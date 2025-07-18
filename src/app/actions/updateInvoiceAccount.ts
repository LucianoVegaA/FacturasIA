
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Required to convert string ID to ObjectId for querying

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

export async function updateInvoiceAccountInDB(invoiceId: string, newAccountNumber: string): Promise<UpdateResult> {
  if (!invoiceId || !newAccountNumber) {
    return { success: false, error: 'Invoice ID and Account Number are required.' };
  }

  try {
    return await withRetry(async () => {
      console.log(`[updateInvoiceAccount] Updating account for invoice ${invoiceId} to ${newAccountNumber}`);
      const { db } = await connectToDatabase();
      const invoicesCollection = db.collection('Datos');

      // Add timeout to the database operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database update timeout after 10 seconds')), 10000);
      });
      
      const updatePromise = invoicesCollection.updateOne(
        { _id: new ObjectId(invoiceId) },
        { $set: { numero_cuenta_bancaria: newAccountNumber } }
      );
      
      const result = await Promise.race([updatePromise, timeoutPromise]);

      if (result.matchedCount === 0) {
        return { success: false, error: 'Invoice not found.' };
      }
      if (result.modifiedCount === 0 && result.matchedCount > 0) {
        // This means the account number was already the same as the new one
        console.log(`[updateInvoiceAccount] Account number already set to ${newAccountNumber}`);
        return { success: true }; 
      }

      console.log(`[updateInvoiceAccount] Successfully updated account number`);
      return { success: true };
    }, 'updateInvoiceAccount');
  } catch (error: any) {
    console.error('[updateInvoiceAccount] All retry attempts failed:', error?.message || error);
    return { success: false, error: 'Failed to update invoice account. Please try again.' };
  }
}
