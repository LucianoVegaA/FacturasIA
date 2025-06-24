
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Required to convert string ID to ObjectId for querying

interface UpdateResult {
  success: boolean;
  error?: string;
}

export async function updateInvoiceAccountInDB(invoiceId: string, newAccountNumber: string): Promise<UpdateResult> {
  if (!invoiceId || !newAccountNumber) {
    return { success: false, error: 'Invoice ID and Account Number are required.' };
  }

  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection('datos');

    const result = await invoicesCollection.updateOne(
      { _id: new ObjectId(invoiceId) },
      { $set: { numero_cuenta_bancaria: newAccountNumber } }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'Invoice not found.' };
    }
    if (result.modifiedCount === 0 && result.matchedCount > 0) {
      // This means the account number was already the same as the new one
      return { success: true }; 
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating invoice account in DB:', error);
    // In a real app, you might want to log more detailed errors or classify them
    return { success: false, error: 'Failed to update invoice account. Please try again.' };
  }
}
