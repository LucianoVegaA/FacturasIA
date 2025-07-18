
'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { transformRawInvoice } from "@/lib/types";
import type { Document } from 'mongodb'; 

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

export async function getInvoices(): Promise<Invoice[]> {
  try {
    return await withRetry(async () => {
      console.log('[getInvoices] Connecting to database...');
      const { db } = await connectToDatabase();
      
      console.log('[getInvoices] Fetching invoices from "Datos" collection...');
      const invoicesCollection = db.collection<Document>("Datos"); 
      
      // Add timeout to the database operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000);
      });
      
      const queryPromise = invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray();
      const rawInvoices = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log(`[getInvoices] Successfully fetched ${rawInvoices.length} invoices`);
      return rawInvoices.map(transformRawInvoice);
    }, 'getInvoices');
  } catch (error: any) {
    console.error('[getInvoices] All retry attempts failed:', error?.message || error);
    console.error('[getInvoices] Returning empty array to prevent client-side errors');
    return [];
  }
}

export async function getErrorInvoices(): Promise<ErrorInvoice[]> {
  try {
    return await withRetry(async () => {
      console.log('[getErrorInvoices] Connecting to database...');
      const { db } = await connectToDatabase();
      
      console.log('[getErrorInvoices] Fetching error files from "Facturas con Error" collection...');
      const errorFilesCollection = db.collection<Document>("Facturas con Error");
      
      // Add timeout to the database operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000);
      });
      
      const queryPromise = errorFilesCollection.find({}).toArray();
      const rawErrorFiles = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log(`[getErrorInvoices] Successfully fetched ${rawErrorFiles.length} error files`);
      return rawErrorFiles.map(doc => {
        const { _id, ...rest } = doc;
        return {
          _id: _id.toString(),
          file_name: doc.file_name || null,
          pdf_url: doc.file_url || null,
          raw_data: rest,
        };
      });
    }, 'getErrorInvoices');
  } catch (error: any) {
    console.error('[getErrorInvoices] All retry attempts failed:', error?.message || error);
    console.error('[getErrorInvoices] Returning empty array to prevent client-side errors');
    return [];
  }
}
