'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateResult {
  success: boolean;
  error?: string;
}

// The data will be a partial object with the fields that were updated.
export async function updateErrorInvoiceInDB(invoiceId: string, updatedData: { [key: string]: any }): Promise<UpdateResult> {
  if (!invoiceId || !updatedData) {
    return { success: false, error: 'Invoice ID and updated data are required.' };
  }

  try {
    const { db } = await connectToDatabase();
    const errorInvoicesCollection = db.collection('Facturas con Error');

    // Make sure to update the fields with the correct database names
    const dataToSet = {
        facturado_a: updatedData.facturado_a,
        numero_factura: updatedData.numero_factura,
        fecha_emision: updatedData.fecha_emision,
        total: updatedData.total,
        descripcion: updatedData.descripcion,
    };


    const result = await errorInvoicesCollection.updateOne(
      { _id: new ObjectId(invoiceId) },
      { $set: dataToSet }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'Invoice not found in error collection.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating error invoice in DB:', error);
    return { success: false, error: 'Failed to update error invoice. Please try again.' };
  }
}
