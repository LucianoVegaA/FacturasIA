
export interface InvoiceItemDetail {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id?: string; // MongoDB ObjectId as string
  onedrive_file_id: string;
  file_name: string | null;
  billed_to: string;
  invoice_number: string;
  date_of_issue: string; // "YYYY-MM-DD"
  due_date: string | null; // "YYYY-MM-DD"
  invoice_description: string;
  
  items: InvoiceItemDetail[]; 

  // Raw item fields from JSON, for direct use if needed before transformation
  item_0_description?: string;
  item_0_quantity?: number;
  item_0_rate?: number;
  item_0_amount?: number;
  item_1_description?: string;
  item_1_quantity?: number;
  item_1_rate?: number;
  item_1_amount?: number;
  item_2_description?: string;
  item_2_quantity?: number;
  item_2_rate?: number;
  item_2_amount?: number;
  // Add more item_X_... fields if your invoices can have more than 3 items

  subtotal: number;
  discount: number;
  tax: number;
  tax_rate: number;
  total: number;
  terms: string | null;
  conditions_instructions: string | null;
  company_name: string;
  company_mobile: string | null;
  company_email: string | null;
  company_website: string | null;
  company_address: string;
  company_ruc: string | null;
  recipient_name: string;
  recipient_id: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  numero_cuenta_bancaria: string | null;
  staffing_percentage: number;
  proyecto_percentage: number;
  software_percentage: number;
  pdf_url: string | null;
}

// Represents an invoice from the 'Facturas con Error' collection
export interface ErrorInvoice {
  _id: string;
  file_name: string | null;
  pdf_url: string | null;
  raw_data: { [key: string]: any }; // The entire raw document from MongoDB
}


// Helper function to transform raw invoice data (with flat items) to structured Invoice type
export function transformRawInvoice(rawData: any): Invoice {
  const items: InvoiceItemDetail[] = [];
  for (let i = 0; ; i++) {
    const descriptionKey = `item_${i}_description`;
    const amountKey = `item_${i}_amount`;
    const rateKey = `item_${i}_rate`;
    const quantityKey = `item_${i}_quantity`;

    // Break if none of the keys for the current item index exist
    if (
      !rawData.hasOwnProperty(descriptionKey) &&
      !rawData.hasOwnProperty(amountKey) &&
      !rawData.hasOwnProperty(rateKey) &&
      !rawData.hasOwnProperty(quantityKey)
    ) {
      break;
    }

    items.push({
      description: rawData[descriptionKey] || '',
      quantity: typeof rawData[quantityKey] === 'number' ? rawData[quantityKey] : 0,
      rate: typeof rawData[rateKey] === 'number' ? rawData[rateKey] : 0,
      amount: typeof rawData[amountKey] === 'number' ? rawData[amountKey] : 0,
    });
  }
  
  const subtotal = typeof rawData.subtotal === 'number' ? rawData.subtotal : 0;
  const total = typeof rawData.total === 'number' ? rawData.total : 0;
  
  let taxAmount = 0;
  let taxRate = 0;

  // New robust tax calculation logic
  // First, try to derive from total and subtotal, as this is the most reliable
  if (total > 0 && subtotal > 0 && total >= subtotal) {
      taxAmount = total - subtotal;
      // prevent division by zero
      if (subtotal > 0) {
        taxRate = (taxAmount / subtotal) * 100;
      }
  } 
  // Fallback to 'impuesto' field if total/subtotal are not reliable
  else if (typeof rawData.impuesto === 'string') {
      const impuestoStr = rawData.impuesto.toUpperCase();
      if (impuestoStr === 'C1') {
          taxRate = 0;
      } else if (impuestoStr === 'C2') {
          taxRate = 7;
      } else if (impuestoStr === 'C3') {
          taxRate = 10;
      }
      taxAmount = subtotal * (taxRate / 100);
  } else if (typeof rawData.impuesto === 'number') { // For corrected invoices
      taxRate = rawData.impuesto;
      taxAmount = subtotal * (taxRate / 100);
  } else if (typeof rawData.tax === 'number') { // For legacy data with 'tax' amount
      taxAmount = rawData.tax;
      if (subtotal > 0) {
        taxRate = (taxAmount / subtotal) * 100;
      }
  }


  const transformed: Invoice = {
    _id: rawData._id?.toString(),
    onedrive_file_id: rawData.identificador || rawData.onedrive_file_id || `fallback_id_${rawData._id?.toString()}`,
    file_name: rawData.file_name || null,
    billed_to: rawData.facturado_a || rawData.billed_to || "N/A",
    invoice_number: rawData.numero_factura || rawData.invoice_number || "N/A",
    date_of_issue: rawData.fecha_emision || rawData.date_of_issue || new Date().toISOString().split('T')[0],
    due_date: rawData.fecha_vencimiento || rawData.due_date || null,
    invoice_description: rawData.descripcion || rawData.invoice_description || "No description",
    items,
    subtotal: subtotal,
    discount: typeof (rawData.descuento || rawData.discount) === 'number' ? (rawData.descuento || rawData.discount) : 0,
    tax: taxAmount,
    tax_rate: taxRate,
    total: total,
    terms: rawData.terminos || rawData.terms || null,
    conditions_instructions: rawData.condiciones_instrucciones || rawData.conditions_instructions || null,
    company_name: rawData.nombre_empresa || rawData.company_name || "Default Company Inc.",
    company_mobile: rawData.movil_empresa || rawData.company_mobile || null,
    company_email: rawData.email_empresa || rawData.company_email || null,
    company_website: rawData.web_empresa || rawData.company_website || null,
    company_address: rawData.direccion_empresa || rawData.company_address || "123 Default St",
    company_ruc: rawData.ruc_empresa || rawData.ruc_empresa || null,
    recipient_name: rawData.nombre_destinatario || rawData.recipient_name || "Valued Customer",
    recipient_id: rawData.id_destinatario || rawData.recipient_id || null,
    bank_account_name: rawData.nombre_cuenta_bancaria_banco || rawData.bank_account_name || null,
    bank_account_number: rawData.numero_cuenta_bancaria_entidad || rawData.bank_account_number || null,
    bank_name: rawData.nombre_banco || rawData.bank_name || null,
    numero_cuenta_bancaria: rawData.numero_cuenta_bancaria || null,
    staffing_percentage: typeof (rawData.porcentaje_staffing) === 'number' ? rawData.porcentaje_staffing : 0,
    proyecto_percentage: typeof (rawData.porcentaje_proyecto) === 'number' ? rawData.porcentaje_proyecto : 0,
    software_percentage: typeof (rawData.porcentaje_software) === 'number' ? rawData.porcentaje_software : 0,
    pdf_url: rawData.file_url || rawData.pdf_url || null, // Correctly maps file_url to pdf_url
  };

  // Add original item_X fields back for things like the AI summary if needed
  items.forEach((item, i) => {
    (transformed as any)[`item_${i}_description`] = item.description;
    (transformed as any)[`item_${i}_quantity`] = item.quantity;
    (transformed as any)[`item_${i}_rate`] = item.rate;
    (transformed as any)[`item_${i}_amount`] = item.amount;
  });
  
  return transformed;
}
