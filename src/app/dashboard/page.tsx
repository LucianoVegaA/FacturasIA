
import * as React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import type { Invoice } from "@/lib/types";
import { InvoiceDashboardClient } from "@/components/dashboard/InvoiceDashboardClient";

async function getInvoicesFromDB(): Promise<Invoice[]> {
  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection<Omit<Invoice, '_id'>>("invoices"); // Specify Omit if _id is handled by Mongo
    const rawInvoices = await invoicesCollection.find({}).sort({ date_of_issue: -1 }).toArray();
    
    // Convert ObjectId to string and ensure structure matches Invoice type
    // Assuming data in DB mostly matches Invoice type, but _id needs conversion.
    // If your data needs more transformation (like the original transformRawInvoice), apply it here.
    return rawInvoices.map(doc => ({
      ...doc,
      _id: (doc as any)._id?.toString(), // Ensure _id is a string
      // If your MongoDB stores items flat, you'd call transformRawInvoice here
      // For now, assuming 'items' and 'status' are already structured in DB
    })) as Invoice[];
  } catch (error) {
    console.error("Failed to fetch invoices from DB:", error);
    return []; // Return empty array on error
  }
}

export default async function DashboardPage() {
  const initialInvoices = await getInvoicesFromDB();

  // Calculate availableMonths directly without React.useMemo
  const monthsSet = new Set<string>();
  initialInvoices.forEach(inv => {
    if (inv.date_of_issue) {
      monthsSet.add(inv.date_of_issue.substring(0, 7)); // "YYYY-MM"
    }
  });
  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); // Sort descending

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
      <InvoiceDashboardClient 
        initialInvoices={initialInvoices} 
        availableMonths={availableMonths} 
      />
    </div>
  );
}
