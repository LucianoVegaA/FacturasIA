
import * as React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import type { Invoice, SimpleErrorFile } from "@/lib/types"; 
import { InvoiceDashboardClient } from "@/components/dashboard/InvoiceDashboardClient";
import type { Document } from 'mongodb'; 
import { transformRawInvoice } from "@/lib/types";

async function getInvoicesFromDB(): Promise<Invoice[]> {
  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection<Document>("Datos"); 
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); 
    
    // Use the centralized transform function for consistency and to fix mapping bugs
    return rawInvoices.map(transformRawInvoice);
  } catch (error) {
    console.error("Failed to fetch invoices from DB:", error);
    return []; 
  }
}

async function getErrorFilesFromDB(): Promise<SimpleErrorFile[]> {
  try {
    const { db } = await connectToDatabase();
    const errorFilesCollection = db.collection<Document>("Facturas con Error"); 
    const rawErrorFiles = await errorFilesCollection.find({}).toArray();
    
    return rawErrorFiles.map(doc => ({
      _id: doc._id.toString(),
      file_name: doc.file_name || null,
      pdf_url: doc.file_url || null, // Map the file_url to pdf_url
    }));
  } catch (error) {
    console.error("Failed to fetch error files from DB:", error);
    return [];
  }
}


export default async function DashboardPage() {
  const initialInvoices = await getInvoicesFromDB();
  const initialErrorFiles = await getErrorFilesFromDB();

  const monthsSet = new Set<string>();
  initialInvoices.forEach(inv => {
    if (inv.date_of_issue) { 
      monthsSet.add(inv.date_of_issue.substring(0, 7)); 
    }
  });
  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); 

  return (
    <div className="flex flex-col gap-6">
      {/* <h1 className="text-3xl font-bold text-foreground">Invoices</h1> Removed this line */}
      <InvoiceDashboardClient 
        initialInvoices={initialInvoices} 
        initialErrorFiles={initialErrorFiles}
        availableMonths={availableMonths} 
      />
    </div>
  );
}
