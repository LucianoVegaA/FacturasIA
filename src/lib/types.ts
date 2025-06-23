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
  
  // Consolidate all mapping logic here.
  const subtotal = typeof rawData.subtotal === 'number' ? rawData.subtotal : 0;
  
  let taxAmount = 0;
  let taxRate = 0;

  // If `tax` field (amount) exists, use it. This is for data that already has the amount.
  if (typeof rawData.tax === 'number') {
    taxAmount = rawData.tax;
     if (subtotal > 0) {
      taxRate = (taxAmount / subtotal) * 100;
    }
  }
  // Else if `impuesto` (rate) exists, calculate tax amount from it. For newly corrected invoices.
  else if (typeof rawData.impuesto === 'number') {
    taxRate = rawData.impuesto;
    taxAmount = subtotal * (taxRate / 100);
  } else if (typeof rawData.impuesto === 'string') { // Legacy handling for string rates
    const parsedRate = parseFloat(rawData.impuesto);
    if (!isNaN(parsedRate)) {
      taxRate = parsedRate;
      taxAmount = subtotal * (taxRate / 100);
    }
  }


  const transformed: Invoice = {
    _id: rawData._id?.toString(),
    onedrive_file_id: rawData.identificador || `fallback_id_${rawData._id?.toString()}`,
    file_name: rawData.file_name || null,
    billed_to: rawData.facturado_a || "N/A",
    invoice_number: rawData.numero_factura || "N/A",
    date_of_issue: rawData.fecha_emision || new Date().toISOString().split('T')[0],
    due_date: rawData.fecha_vencimiento || null,
    invoice_description: rawData.descripcion || "No description",
    items,
    subtotal: subtotal,
    discount: typeof rawData.descuento === 'number' ? rawData.descuento : 0,
    tax: taxAmount,
    tax_rate: taxRate,
    total: typeof rawData.total === 'number' ? rawData.total : 0,
    terms: rawData.terminos || null,
    conditions_instructions: rawData.condiciones_instrucciones || null,
    company_name: rawData.nombre_empresa || "Default Company Inc.",
    company_mobile: rawData.movil_empresa || null,
    company_email: rawData.email_empresa || null,
    company_website: rawData.web_empresa || null,
    company_address: rawData.direccion_empresa || "123 Default St",
    company_ruc: rawData.ruc_empresa || null,
    recipient_name: rawData.nombre_destinatario || "Valued Customer",
    recipient_id: rawData.id_destinatario || null,
    bank_account_name: rawData.nombre_cuenta_bancaria_banco || null,
    bank_account_number: rawData.numero_cuenta_bancaria_entidad || null,
    bank_name: rawData.nombre_banco || null,
    numero_cuenta_bancaria: rawData.numero_cuenta_bancaria || null,
    staffing_percentage: typeof rawData.porcentaje_staffing === 'number' ? rawData.porcentaje_staffing : 0,
    proyecto_percentage: typeof rawData.porcentaje_proyecto === 'number' ? rawData.porcentaje_proyecto : 0,
    software_percentage: typeof rawData.porcentaje_software === 'number' ? rawData.porcentaje_software : 0,
    pdf_url: rawData.file_url || null, // Correctly maps file_url to pdf_url
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
