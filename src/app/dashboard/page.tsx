
import * as React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import type { Invoice, ErrorInvoice } from "@/lib/types"; 
import { InvoiceDashboardClient } from "@/components/dashboard/InvoiceDashboardClient";
import type { Document } from 'mongodb'; 
import { transformRawInvoice, transformRawErrorInvoice } from "@/lib/types";

async function getInvoicesFromDB(): Promise<Invoice[]> {
  try {
    const { db } = await connectToDatabase();
    const invoicesCollection = db.collection<Document>("Datos"); 
    const rawInvoices = await invoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray(); 
    
    return rawInvoices.map(doc => {
      let taxValue = 0;
      if (typeof doc.impuesto === 'number') {
        taxValue = doc.impuesto;
      } else if (typeof doc.impuesto === 'string') {
        const parsedTax = parseFloat(doc.impuesto);
        if (!isNaN(parsedTax)) {
          taxValue = parsedTax;
        }
      }

      const mappedInvoice: Invoice = {
        _id: doc._id?.toString(),
        onedrive_file_id: doc.identificador || `fallback_id_${doc._id?.toString()}`, 
        billed_to: doc.facturado_a || "N/A", 
        invoice_number: doc.numero_factura || "N/A", 
        date_of_issue: doc.fecha_emision || new Date().toISOString().split('T')[0], 
        due_date: doc.fecha_vencimiento || null, 
        invoice_description: doc.descripcion || "No description", 
        items: [], 
        subtotal: typeof doc.subtotal === 'number' ? doc.subtotal : 0, 
        discount: typeof doc.descuento === 'number' ? doc.descuento : 0, 
        tax: taxValue, 
        total: typeof doc.total === 'number' ? doc.total : 0,
        terms: doc.terminos || null, 
        conditions_instructions: doc.condiciones_instrucciones || null, 
        company_name: doc.nombre_empresa || "Default Company Inc.", 
        company_mobile: doc.movil_empresa || null, 
        company_email: doc.email_empresa || null, 
        company_website: doc.web_empresa || null, 
        company_address: doc.direccion_empresa || "123 Default St", 
        company_ruc: doc.ruc_empresa || null, 
        recipient_name: doc.nombre_destinatario || "Valued Customer", 
        recipient_id: doc.id_destinatario || null, 
        bank_account_name: doc.nombre_cuenta_bancaria_banco || null, 
        bank_account_number: doc.numero_cuenta_bancaria_entidad || null, 
        bank_name: doc.nombre_banco || null, 
        numero_cuenta_bancaria: doc.numero_cuenta_bancaria || null, 
        staffing_percentage: typeof doc.porcentaje_staffing === 'number' ? doc.porcentaje_staffing : 0, 
        proyecto_percentage: typeof doc.porcentaje_proyecto === 'number' ? doc.porcentaje_proyecto : 0, 
        software_percentage: typeof doc.porcentaje_software === 'number' ? doc.porcentaje_software : 0, 
        pdf_url: doc.pdf_url || null, 
      };
      // For items, we'll use the transformRawInvoice to populate them if item_X fields exist
      const fullMappedInvoice = transformRawInvoice(doc);
      mappedInvoice.items = fullMappedInvoice.items;
      return mappedInvoice;
    });
  } catch (error) {
    console.error("Failed to fetch invoices from DB:", error);
    return []; 
  }
}

async function getErrorInvoicesFromDB(): Promise<ErrorInvoice[]> {
  try {
    const { db } = await connectToDatabase();
    const errorInvoicesCollection = db.collection<Document>("facturas_con_error");
    const rawErrorInvoices = await errorInvoicesCollection.find({}).sort({ fecha_emision: -1 }).toArray();
    return rawErrorInvoices.map(doc => transformRawErrorInvoice(doc));
  } catch (error) {
    console.error("Failed to fetch error invoices from DB:", error);
    return [];
  }
}


export default async function DashboardPage() {
  const initialInvoices = await getInvoicesFromDB();
  const initialErrorInvoices = await getErrorInvoicesFromDB();

  const monthsSet = new Set<string>();
  initialInvoices.forEach(inv => {
    if (inv.date_of_issue) { 
      monthsSet.add(inv.date_of_issue.substring(0, 7)); 
    }
  });
  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); 

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
      <InvoiceDashboardClient 
        initialInvoices={initialInvoices} 
        initialErrorInvoices={initialErrorInvoices}
        availableMonths={availableMonths} 
      />
    </div>
  );
}
