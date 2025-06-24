
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { transformRawInvoice } from "@/lib/types";
import type { Document } from 'mongodb'; 

export interface GetInvoicesResult {
  invoices: Invoice[];
  error: string | null;
}

export async function getInvoices(): Promise<GetInvoicesResult> {
  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection<Document>("Datos"); 
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); 
    
    return {
      invoices: rawInvoices.map(transformRawInvoice),
      error: null
    };
  } catch (error: any) {
    console.error("Failed to fetch invoices from DB:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    return {
      invoices: [],
      error: `No se pudo conectar a la base de datos. Verifique las variables de entorno MONGODB. (${errorMessage})`
    };
  }
}

export interface GetErrorInvoicesResult {
  errorInvoices: ErrorInvoice[];
  error: string | null;
}

export async function getErrorInvoices(): Promise<GetErrorInvoicesResult> {
  try {
    const { db } = await connectToDatabase();
    const errorFilesCollection = db.collection<Document>("Facturas con Error");
    const rawErrorFiles = await errorFilesCollection.find({}).toArray();

    return {
      errorInvoices: rawErrorFiles.map(doc => {
        const { _id, ...rest } = doc;
        return {
          _id: _id.toString(),
          file_name: doc.file_name || null,
          pdf_url: doc.file_url || null,
          raw_data: rest,
        };
      }),
      error: null
    };
  } catch (error: any) {
    console.error("Failed to fetch error files from DB:", error);
    const errorMessage = error.message || "An unknown error occurred.";
    return { 
      errorInvoices: [], 
      error: `No se pudo conectar a la base de datos para obtener archivos con error. (${errorMessage})` 
    };
  }
}
