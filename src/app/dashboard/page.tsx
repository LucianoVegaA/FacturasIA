
import * as React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import type { Invoice, InvoiceStatus } from "@/lib/types"; // Ensure InvoiceStatus is imported
import { InvoiceDashboardClient } from "@/components/dashboard/InvoiceDashboardClient";
import type { Document } from 'mongodb'; // Import Document type

async function getInvoicesFromDB(): Promise<Invoice[]> {
  try {
    const { db } = await connectToDatabase();
    // Fetch as raw Document type, from the "Datos" collection
    const invoicesCollection = db.collection<Document>("Datos"); 
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); // Sort by original date field
    
    // Manually map MongoDB document fields to the Invoice type
    return rawInvoices.map(doc => {
      let taxValue = 0;
      if (typeof doc.impuesto === 'number') {
        taxValue = doc.impuesto;
      } else if (typeof doc.impuesto === 'string') {
        const parsedTax = parseFloat(doc.impuesto);
        if (!isNaN(parsedTax)) {
          taxValue = parsedTax;
        }
        // If "C0" or other non-numeric string, taxValue remains 0
      }

      const totalAmount = typeof doc.total === 'number' ? doc.total : 0;
      let status: InvoiceStatus = 'Unpaid';
      if (totalAmount === 0) {
        status = 'Paid';
      } else if (doc.fecha_vencimiento && new Date(doc.fecha_vencimiento) < new Date() && totalAmount > 0) {
        status = 'Overdue';
      }

      const mappedInvoice: Invoice = {
        _id: doc._id?.toString(),
        onedrive_file_id: doc.identificador || `fallback_id_${doc._id?.toString()}`, // Using 'identificador' from your screenshot
        billed_to: doc.facturado_a || "N/A", // Using 'facturado_a'
        invoice_number: doc.numero_factura || "N/A", // Using 'numero_factura'
        date_of_issue: doc.fecha_emision || new Date().toISOString().split('T')[0], // Using 'fecha_emision'
        due_date: doc.fecha_vencimiento || null, // Using 'fecha_vencimiento'
        invoice_description: doc.descripcion || "No description", // Using 'descripcion'
        
        items: [], // MongoDB sample doesn't have item details, default to empty array

        subtotal: typeof doc.subtotal === 'number' ? doc.subtotal : 0, // Using 'subtotal'
        // Assuming 'descuento' might be the field name for discount in your DB - not in screenshot
        discount: typeof doc.descuento === 'number' ? doc.descuento : 0, 
        tax: taxValue, // Handled 'impuesto'
        total: totalAmount, // Using 'total'
        
        terms: doc.terminos || null, // Default if not in DB
        conditions_instructions: doc.condiciones_instrucciones || null, // Default if not in DB
        
        company_name: doc.nombre_empresa || "Default Company Inc.", // Default if not in DB
        company_mobile: doc.movil_empresa || null, // Default if not in DB
        company_email: doc.email_empresa || null, // Default if not in DB
        company_website: doc.web_empresa || null, // Default if not in DB
        company_address: doc.direccion_empresa || "123 Default St", // Default if not in DB
        company_ruc: doc.ruc_empresa || null, // Default if not in DB
        
        recipient_name: doc.nombre_destinatario || "Valued Customer", // Default if not in DB
        recipient_id: doc.id_destinatario || null, // Default if not in DB
        
        bank_account_name: doc.nombre_cuenta_bancaria_banco || null, // Default if not in DB
        bank_account_number: doc.numero_cuenta_bancaria_entidad || null, // Default if not in DB
        bank_name: doc.nombre_banco || null, // Default if not in DB
        
        numero_cuenta_bancaria: doc.numero_cuenta_bancaria || null, // Using 'numero_cuenta_bancaria'
        
        staffing_percentage: typeof doc.porcentaje_staffing === 'number' ? doc.porcentaje_staffing : 0, // Using 'porcentaje_staffing'
        proyecto_percentage: typeof doc.porcentaje_proyecto === 'number' ? doc.porcentaje_proyecto : 0, // Using 'porcentaje_proyecto'
        software_percentage: typeof doc.porcentaje_software === 'number' ? doc.porcentaje_software : 0, // Using 'porcentaje_software'
        
        status: status,
      };
      return mappedInvoice;
    });
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
    if (inv.date_of_issue) { // inv.date_of_issue should be populated by the mapping
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
