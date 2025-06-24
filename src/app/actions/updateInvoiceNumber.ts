
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updateInvoiceNumberInDB(invoiceId: string, newInvoiceNumber: string): Promise<UpdateResult> {
  if (!invoiceId || !newInvoiceNumber) {
    return { success: false, error: 'Invoice ID and Invoice Number are required.' };
  }

  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection('datos');

    // The field in MongoDB is 'numero_factura'
    const result = await invoicesCollection.updateOne(
      { _id: new ObjectId(invoiceId) },
      { $set: { numero_factura: newInvoiceNumber } }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'Invoice not found.' };
    }
    if (result.modifiedCount === 0 && result.matchedCount > 0) {
      return { success: true }; 
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating invoice number in DB:', error);
    return { success: false, error: 'Failed to update invoice number. Please try again.' };
  }
}
