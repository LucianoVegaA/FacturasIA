
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';

export interface InvoiceItemDetail {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  onedrive_file_id: string;
  billed_to: string;
  invoice_number: string;
  date_of_issue: string; // "YYYY-MM-DD"
  due_date: string | null; // "YYYY-MM-DD"
  invoice_description: string;
  
  // Represents item_X_description, item_X_quantity etc. as a structured array
  // This transformation should happen when data is fetched/loaded.
  items: InvoiceItemDetail[]; 

  // Raw item fields from JSON, for direct use if needed before transformation
  // These are optional as they might not all exist for every invoice
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
  // Potentially more items...

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
  status: InvoiceStatus; // Added for clarity, can be derived
}

// Helper function to transform raw invoice data (with flat items) to structured Invoice type
export function transformRawInvoice(rawData: any): Invoice {
  const items: InvoiceItemDetail[] = [];
  for (let i = 0; ; i++) {
    if (rawData[`item_${i}_description`] === undefined && rawData[`item_${i}_amount`] === undefined) {
      break;
    }
    items.push({
      description: rawData[`item_${i}_description`] || '',
      quantity: rawData[`item_${i}_quantity`] || 0,
      rate: rawData[`item_${i}_rate`] || 0,
      amount: rawData[`item_${i}_amount`] || 0,
    });
  }

  // Determine status (example logic)
  let status: InvoiceStatus = 'Unpaid';
  if (rawData.total === 0) status = 'Paid'; // Simplified logic
  else if (rawData.due_date && new Date(rawData.due_date) < new Date() && rawData.total > 0) {
    status = 'Overdue';
  }


  return {
    ...rawData,
    items,
    status,
  };
}
