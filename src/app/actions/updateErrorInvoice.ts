
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateResult {
  success: boolean;
  error?: string;
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
    
    // Step 1: Insert the new, corrected document into the 'Datos' collection.
    const insertResult = await datosCollection.insertOne(newDocumentForDatos);

    if (!insertResult.insertedId) {
        // This would be an unexpected failure from MongoDB.
        return { success: false, error: 'Failed to insert the corrected invoice into the main collection.' };
    }

    // Step 2: Delete the original document from the 'Facturas con Error' collection.
    const deleteResult = await errorInvoicesCollection.deleteOne({ _id: new ObjectId(errorInvoiceId) });

    if (deleteResult.deletedCount === 0) {
      // This is a critical issue. The corrected invoice was inserted, but the original error record still exists.
      // This might happen if the ID is wrong or the record was deleted by another process.
      // For now, we'll report this as a partial failure and log it.
      // In a production system, a transaction or a cleanup job would be ideal.
      console.warn(`Invoice ${errorInvoiceId} was moved to 'Datos' but could not be deleted from 'Facturas con Error'.`);
      return { success: false, error: 'Could not delete the original error invoice, but the new one was created. Please check for duplicates.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error moving corrected invoice:', error);
    return { success: false, error: 'An unexpected error occurred while moving the invoice. Please try again.' };
  }
}
