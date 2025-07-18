
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateResult {
  success: boolean;
  error?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper function for retry logic
async function withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`[${operationName}] Attempt ${attempt}/${MAX_RETRIES} failed:`, error?.message || error);
      
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  
  throw new Error(`${operationName} failed after ${MAX_RETRIES} attempts`);
}

export async function updateInvoiceNumberInDB(invoiceId: string, newInvoiceNumber: string): Promise<UpdateResult> {
  if (!invoiceId || !newInvoiceNumber) {
    return { success: false, error: 'Invoice ID and Invoice Number are required.' };
  }

  try {
    return await withRetry(async () => {
      console.log(`[updateInvoiceNumber] Updating invoice number for ${invoiceId} to ${newInvoiceNumber}`);
      const { db } = await connectToDatabase();
      const invoicesCollection = db.collection('Datos');

      // Add timeout to the database operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database update timeout after 10 seconds')), 10000);
      });
      
      // The field in MongoDB is 'numero_factura'
      const updatePromise = invoicesCollection.updateOne(
        { _id: new ObjectId(invoiceId) },
        { $set: { numero_factura: newInvoiceNumber } }
      );
      
      const result = await Promise.race([updatePromise, timeoutPromise]);

      if (result.matchedCount === 0) {
        return { success: false, error: 'Invoice not found.' };
      }
      if (result.modifiedCount === 0 && result.matchedCount > 0) {
        console.log(`[updateInvoiceNumber] Invoice number already set to ${newInvoiceNumber}`);
        return { success: true }; 
      }

      console.log(`[updateInvoiceNumber] Successfully updated invoice number`);
      return { success: true };
    }, 'updateInvoiceNumber');
  } catch (error: any) {
    console.error('[updateInvoiceNumber] All retry attempts failed:', error?.message || error);
    return { success: false, error: 'Failed to update invoice number. Please try again.' };
  }
}
