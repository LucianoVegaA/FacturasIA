

export interface InvoiceItemDetail {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id?: string; // MongoDB ObjectId as string
  onedrive_file_id: string;
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

export interface ErrorInvoice extends Invoice {
  error_description?: string;
}

// Helper function to transform raw invoice data (with flat items) to structured Invoice type
export function transformRawInvoice(rawData: any): Invoice {
  const items: InvoiceItemDetail[] = [];
  for (let i = 0; ; i++) {
    if (rawData[`item_${i}_description`] === undefined && rawData[`item_${i}_amount`] === undefined && rawData[`item_${i}_rate`] === undefined && rawData[`item_${i}_quantity`] === undefined) {
      break;
    }
    if (rawData[`item_${i}_description`] || rawData[`item_${i}_amount`] || rawData[`item_${i}_rate`] || rawData[`item_${i}_quantity`]) {
      items.push({
        description: rawData[`item_${i}_description`] || '',
        quantity: typeof rawData[`item_${i}_quantity`] === 'number' ? rawData[`item_${i}_quantity`] : 0,
        rate: typeof rawData[`item_${i}_rate`] === 'number' ? rawData[`item_${i}_rate`] : 0,
        amount: typeof rawData[`item_${i}_amount`] === 'number' ? rawData[`item_${i}_amount`] : 0,
      });
    }
  }

  const transformed: Invoice = {
    ...rawData, 
    items,      
    pdf_url: rawData.pdf_url || null,
    subtotal: typeof rawData.subtotal === 'number' ? rawData.subtotal : 0,
    discount: typeof rawData.discount === 'number' ? rawData.discount : 0,
    tax: typeof rawData.tax === 'number' ? rawData.tax : 0,
    total: typeof rawData.total === 'number' ? rawData.total : 0,
    staffing_percentage: typeof rawData.staffing_percentage === 'number' ? rawData.staffing_percentage : 0,
    proyecto_percentage: typeof rawData.proyecto_percentage === 'number' ? rawData.proyecto_percentage : 0,
    software_percentage: typeof rawData.software_percentage === 'number' ? rawData.software_percentage : 0,
    invoice_number: rawData.invoice_number || "N/A",
    billed_to: rawData.billed_to || "N/A",
    date_of_issue: rawData.date_of_issue || new Date().toISOString().split('T')[0],
    invoice_description: rawData.invoice_description || "No description",
    company_name: rawData.company_name || "Default Company Inc.",
    company_address: rawData.company_address || "123 Default St",
    recipient_name: rawData.recipient_name || "Valued Customer",
  };

  if (rawData._id && typeof rawData._id !== 'string') {
    transformed._id = rawData._id.toString();
  }
  
  return transformed;
}

export function transformRawErrorInvoice(rawData: any): ErrorInvoice {
  const baseInvoice = transformRawInvoice(rawData);
  return {
    ...baseInvoice,
    error_description: rawData.error_description || "No error description provided.",
  };
}
