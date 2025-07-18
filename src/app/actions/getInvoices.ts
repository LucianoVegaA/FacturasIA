
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { transformRawInvoice } from "@/lib/types";
import type { Document } from 'mongodb'; 

export async function getInvoices(): Promise<Invoice[]> {
  try {
    console.log('[getInvoices] Starting database connection...');
    
    // Verificar variables de entorno primero
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('MONGODB_DB_NAME environment variable is not set');
    }
    
    const { db } = await connectToDatabase();
    console.log('[getInvoices] Database connected successfully');
    
    const invoicesCollection = db.collection<Document>("Datos"); 
    console.log('[getInvoices] Fetching invoices from collection...');
    
    // Agregar timeout y límite
    const rawInvoices = await invoicesCollection
      .find({})
      .sort({ fecha_emision: -1 })
      .limit(1000) // Límite de seguridad
      .toArray(); 
    
    console.log(`[getInvoices] Found ${rawInvoices.length} invoices`);
    
    if (rawInvoices.length === 0) {
      console.log('[getInvoices] No invoices found, returning empty array');
      return [];
    }
    
    const transformedInvoices = rawInvoices.map((doc, index) => {
      try {
        return transformRawInvoice(doc);
      } catch (transformError) {
        console.error(`[getInvoices] Error transforming invoice ${index}:`, transformError);
        return null;
      }
    }).filter(Boolean) as Invoice[];
    
    console.log(`[getInvoices] Transformed ${transformedInvoices.length} invoices successfully`);
    
    return transformedInvoices;
  } catch (error: any) {
    console.error("[getInvoices] Failed to fetch invoices from DB:", error);
    console.error("[getInvoices] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      mongoError: error.code ? `MongoDB Error Code: ${error.code}` : 'Not a MongoDB error'
    });
    
    // Siempre retornar array vacío en lugar de lanzar error para evitar crash de Server Actions
    console.error("[getInvoices] Returning empty array due to error");
    return [];
  }
}

export async function getErrorInvoices(): Promise<ErrorInvoice[]> {
  try {
    console.log('[getErrorInvoices] Starting database connection...');
    
    // Verificar variables de entorno primero
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('MONGODB_DB_NAME environment variable is not set');
    }
    
    const { db } = await connectToDatabase();
    console.log('[getErrorInvoices] Database connected successfully');
    
    const errorFilesCollection = db.collection<Document>("Facturas con Error");
    console.log('[getErrorInvoices] Fetching error files from collection...');
    
    // Agregar límite de seguridad
    const rawErrorFiles = await errorFilesCollection
      .find({})
      .limit(500) // Límite de seguridad
      .toArray();

    console.log(`[getErrorInvoices] Found ${rawErrorFiles.length} error files`);
    
    if (rawErrorFiles.length === 0) {
      console.log('[getErrorInvoices] No error files found, returning empty array');
      return [];
    }
    
    const transformedErrorFiles = rawErrorFiles.map((doc, index) => {
      try {
        const { _id, ...rest } = doc;
        return {
          _id: _id.toString(),
          file_name: doc.file_name || null,
          pdf_url: doc.file_url || null,
          raw_data: rest,
        };
      } catch (transformError) {
        console.error(`[getErrorInvoices] Error transforming error file ${index}:`, transformError);
        return null;
      }
    }).filter(Boolean) as ErrorInvoice[];
    
    console.log(`[getErrorInvoices] Transformed ${transformedErrorFiles.length} error files successfully`);
    return transformedErrorFiles;
  } catch (error: any) {
    console.error("[getErrorInvoices] Failed to fetch error files from DB:", error);
    console.error("[getErrorInvoices] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      mongoError: error.code ? `MongoDB Error Code: ${error.code}` : 'Not a MongoDB error'
    });
    
    // Siempre retornar array vacío en lugar de lanzar error para evitar crash de Server Actions
    console.error("[getErrorInvoices] Returning empty array due to error");
    return [];
  }
}
