
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
  // Add more item_X... fields if your invoices can have more than 3 items

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
  if (!rawData || typeof rawData !== 'object') {
    console.warn("transformRawInvoice received invalid data:", rawData);
    // Return a default empty structure to avoid breaking the map function
    return {
      _id: '',
      onedrive_file_id: '',
      file_name: null,
      billed_to: "Invalid Data",
      invoice_number: "N/A",
      date_of_issue: '',
      due_date: null,
      invoice_description: "Invalid Data",
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      tax_rate: 0,
      total: 0,
      terms: null,
      conditions_instructions: null,
      company_name: "N/A",
      company_mobile: null,
      company_email: null,
      company_website: null,
      company_address: "N/A",
      company_ruc: null,
      recipient_name: "N/A",
      recipient_id: null,
      bank_account_name: null,
      bank_account_number: null,
      bank_name: null,
      numero_cuenta_bancaria: null,
      staffing_percentage: 0,
      proyecto_percentage: 0,
      software_percentage: 0,
      pdf_url: null,
    };
  }

  const items: InvoiceItemDetail[] = [];
  // Loop to catch invoices that might have the itemized structure
  for (let i = 0; ; i++) {
    const descKey = `item_${i}_descripcion`;
    if (!rawData.hasOwnProperty(descKey) || rawData[descKey] === null) {
      break;
    }
    items.push({
      description: rawData[descKey] || '',
      quantity: rawData[`item_${i}_cantidad`] || 0,
      rate: rawData[`item_${i}_precio`] || 0,
      amount: rawData[`item_${i}_monto`] || 0,
    });
  }
  
  const subtotal = Number(rawData.subtotal) || 0;
  const total = Number(rawData.total) || 0;
  let taxAmount = 0;
  let taxRate = 0;

  // New robust tax calculation logic
  if (total > 0 && subtotal > 0 && total >= subtotal) {
      taxAmount = total - subtotal;
      if (subtotal > 0) {
        taxRate = (taxAmount / subtotal) * 100;
      }
  } else if (typeof rawData.impuesto === 'string') {
      const impuestoStr = rawData.impuesto.toUpperCase();
      if (impuestoStr === 'C0' || impuestoStr === 'C1') taxRate = 0;
      else if (impuestoStr === 'C2') taxRate = 7;
      else if (impuestoStr === 'C3') taxRate = 10;
      taxAmount = subtotal * (taxRate / 100);
  }

  const transformed: Invoice = {
    _id: rawData._id?.toString() ?? '',
    onedrive_file_id: rawData.identificador ?? '',
    file_name: rawData.file_name ?? null,
    billed_to: rawData.facturado_a ?? "N/A",
    invoice_number: rawData.numero_factura ?? "N/A",
    date_of_issue: rawData.fecha_emision ?? '',
    due_date: rawData.fecha_vencimiento ?? null,
    invoice_description: rawData.descripcion ?? "Sin descripción",
    items: items,
    subtotal: subtotal,
    discount: Number(rawData.descuento) || 0,
    tax: taxAmount,
    tax_rate: taxRate,
    total: total,
    terms: rawData.terminos ?? null,
    conditions_instructions: rawData.condiciones_instrucciones ?? null,
    company_name: rawData.nombre_empresa ?? "N/A",
    company_mobile: rawData.movil_empresa ?? null,
    company_email: rawData.email_empresa ?? null,
    company_website: rawData.web_empresa ?? null,
    company_address: rawData.direccion_empresa ?? "N/A",
    company_ruc: rawData.ruc_empresa ?? null,
    recipient_name: rawData.nombre_destinatario ?? "N/A",
    recipient_id: rawData.id_destinatario ?? null,
    bank_account_name: rawData.nombre_cuenta_bancaria_banco ?? null,
    bank_account_number: rawData.numero_cuenta_bancaria_entidad ?? null,
    bank_name: rawData.nombre_banco ?? null,
    numero_cuenta_bancaria: rawData.numero_cuenta_bancaria ?? null,
    staffing_percentage: Number(rawData.porcentaje_staffing) || 0,
    proyecto_percentage: Number(rawData.porcentaje_proyecto) || 0,
    software_percentage: Number(rawData.porcentaje_software) || 0,
    pdf_url: rawData.file_url ?? null,
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
