
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

// This function takes the ID of the error invoice and the corrected data,
// creates a new record in the 'Datos' collection, and deletes the original from 'Facturas con Error'.
export async function correctAndMoveInvoice(
    errorInvoiceId: string, 
    originalRawData: { [key: string]: any },
    correctedData: { [key: string]: any }
): Promise<UpdateResult> {
  if (!errorInvoiceId || !correctedData || !originalRawData) {
    return { success: false, error: 'Invoice ID and data are required.' };
  }

  try {
    return await withRetry(async () => {
      console.log(`[correctAndMoveInvoice] Processing error invoice ${errorInvoiceId}`);
      const { db } = await connectToDatabase();
      const errorInvoicesCollection = db.collection('Facturas con Error');
      const datosCollection = db.collection('Datos');

      // Prepare the new document for the 'Datos' collection.
      // The correctedData from the form will overwrite any corresponding fields in the original raw data.
      const newDocumentForDatos = {
        ...originalRawData,
        ...correctedData,
      };
      
      // Remove the internal MongoDB _id from the object before inserting.
      // A new one will be generated for the 'Datos' collection.
      delete newDocumentForDatos._id; 
      
      // Add timeout for database operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout after 15 seconds')), 15000);
      });
      
      // Step 1: Insert the new, corrected document into the 'Datos' collection.
      console.log(`[correctAndMoveInvoice] Inserting corrected document into Datos collection`);
      const insertPromise = datosCollection.insertOne(newDocumentForDatos);
      const insertResult = await Promise.race([insertPromise, timeoutPromise]);

      if (!insertResult.insertedId) {
          // This would be an unexpected failure from MongoDB.
          return { success: false, error: 'Failed to insert the corrected invoice into the main collection.' };
      }

      // Step 2: Delete the original document from the 'Facturas con Error' collection.
      console.log(`[correctAndMoveInvoice] Deleting original error document`);
      const deletePromise = errorInvoicesCollection.deleteOne({ _id: new ObjectId(errorInvoiceId) });
      const deleteResult = await Promise.race([deletePromise, timeoutPromise]);

      if (deleteResult.deletedCount === 0) {
        // This is a critical issue. The corrected invoice was inserted, but the original error record still exists.
        // This might happen if the ID is wrong or the record was deleted by another process.
        // For now, we'll report this as a partial failure and log it.
        // In a production system, a transaction or a cleanup job would be ideal.
        console.warn(`[correctAndMoveInvoice] Invoice ${errorInvoiceId} was moved to 'Datos' but could not be deleted from 'Facturas con Error'.`);
        return { success: false, error: 'Could not delete the original error invoice, but the new one was created. Please check for duplicates.' };
      }

      console.log(`[correctAndMoveInvoice] Successfully moved invoice from error collection to main collection`);
      return { success: true };
    }, 'correctAndMoveInvoice');
  } catch (error: any) {
    console.error('[correctAndMoveInvoice] All retry attempts failed:', error?.message || error);
    return { success: false, error: 'An unexpected error occurred while moving the invoice. Please try again.' };
  }
}
