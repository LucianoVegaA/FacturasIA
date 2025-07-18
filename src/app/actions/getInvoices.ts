
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { transformRawInvoice } from "@/lib/types";
import type { Document } from 'mongodb';
import { logServerEnvironment } from '@/lib/serverEnvLogger'; 

export async function getInvoices(): Promise<Invoice[]> {
  try {
    // Log server environment on first call
    logServerEnvironment();
    console.log('[getInvoices] Starting database connection...');
    const { db } = await connectToDatabase();
    console.log('[getInvoices] Database connected successfully');
    
    const invoicesCollection = db.collection<Document>("Datos"); 
    console.log('[getInvoices] Fetching invoices from collection...');
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); 
    
    console.log(`[getInvoices] Found ${rawInvoices.length} invoices`);
    const transformedInvoices = rawInvoices.map(transformRawInvoice);
    console.log(`[getInvoices] Transformed ${transformedInvoices.length} invoices successfully`);
    
    return transformedInvoices;
  } catch (error: any) {
    console.error("[getInvoices] Failed to fetch invoices from DB:", error);
    console.error("[getInvoices] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // En producción, lanzar el error para que se propague
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return [];
  }
}

export async function getErrorInvoices(): Promise<ErrorInvoice[]> {
  try {
    console.log('[getErrorInvoices] Starting database connection...');
    const { db } = await connectToDatabase();
    console.log('[getErrorInvoices] Database connected successfully');
    
    const errorFilesCollection = db.collection<Document>("Facturas con Error");
    console.log('[getErrorInvoices] Fetching error files from collection...');
    const rawErrorFiles = await errorFilesCollection.find({}).toArray();

    console.log(`[getErrorInvoices] Found ${rawErrorFiles.length} error files`);
    const transformedErrorFiles = rawErrorFiles.map(doc => {
      const { _id, ...rest } = doc;
      return {
        _id: _id.toString(),
        file_name: doc.file_name || null,
        pdf_url: doc.file_url || null,
        raw_data: rest,
      };
    });
    
    console.log(`[getErrorInvoices] Transformed ${transformedErrorFiles.length} error files successfully`);
    return transformedErrorFiles;
  } catch (error: any) {
    console.error("[getErrorInvoices] Failed to fetch error files from DB:", error);
    console.error("[getErrorInvoices] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // En producción, lanzar el error para que se propague
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return [];
  }
}
