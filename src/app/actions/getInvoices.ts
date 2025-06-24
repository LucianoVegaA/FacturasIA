
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { transformRawInvoice } from "@/lib/types";
import type { Document } from 'mongodb'; 

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection<Document>("Datos"); 
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); 
    
    return rawInvoices.map(transformRawInvoice);
  } catch (error) {
    console.error("Failed to fetch invoices from DB:", error);
    return []; 
  }
}

export async function getErrorInvoices(): Promise<ErrorInvoice[]> {
  try {
    const { db } = await connectToDatabase();
    const errorFilesCollection = db.collection<Document>("Facturas con Error");
    const rawErrorFiles = await errorFilesCollection.find({}).toArray();

    return rawErrorFiles.map(doc => {
      const { _id, ...rest } = doc;
      return {
        _id: _id.toString(),
        file_name: doc.file_name || null,
        pdf_url: doc.file_url || null,
        raw_data: rest,
      };
    });
  } catch (error) {
    console.error("Failed to fetch error files from DB:", error);
    return [];
  }
}
