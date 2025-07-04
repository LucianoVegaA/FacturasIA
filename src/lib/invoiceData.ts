import type { Invoice } from '@/lib/types';
import { transformRawInvoice } from '@/lib/types';

const rawSampleInvoices = [
  {
    onedrive_file_id: "01UUHECBCIF7ZCLD4BWBE272224BVR6YB5",
    billed_to: "HYPERNOVALABS",
    invoice_number: "1747855762",
    date_of_issue: "2025-05-21",
    due_date: null,
    invoice_description: "CMS Hosting Plan - May 21, 2025 - Jun 21, 2025",
    item_0_description: "Site plans CMS Hosting Plan (at $29.00 / month), from May 21 2025 to Jun 21 2025",
    item_0_quantity: 1,
    item_0_rate: 29.00,
    item_0_amount: 29.00,
    subtotal: 29.00,
    discount: 0,
    tax: 0,
    total: 29.00,
    terms: null,
    conditions_instructions: null,
    company_name: "Webflow, Inc.",
    company_mobile: null,
    company_email: "https://support.webflow.com",
    company_website: null,
    company_address: "398 11th Street\n2nd Floor\nSan Francisco, CA 94103\nUnited States",
    company_ruc: "46-1068692",
    recipient_name: "Emeldo Quiroz Nunez",
    recipient_id: null,
    bank_account_name: null,
    bank_account_number: null,
    bank_name: null,
    numero_cuenta_bancaria: "707003",
    staffing_percentage: 0,
    proyecto_percentage: 0,
    software_percentage: 100,
  },
  {
    onedrive_file_id: "02ABCDEFGHIJ1234567890KLMNOPQRSTU1",
    billed_to: "CLIENT CORP",
    invoice_number: "INV-2024-001",
    date_of_issue: "2024-07-01",
    due_date: "2024-07-31",
    invoice_description: "Software Development Services",
    item_0_description: "Feature implementation (10 hours)",
    item_0_quantity: 10,
    item_0_rate: 100.00,
    item_0_amount: 1000.00,
    item_1_description: "Consulting (5 hours)",
    item_1_quantity: 5,
    item_1_rate: 120.00,
    item_1_amount: 600.00,
    subtotal: 1600.00,
    discount: 100,
    tax: 150,
    total: 1650.00,
    terms: "Net 30",
    conditions_instructions: "Payment due within 30 days.",
    company_name: "My Awesome Company",
    company_mobile: "555-1234",
    company_email: "billing@awesome.com",
    company_website: "www.awesome.com",
    company_address: "123 Main St, Anytown, USA",
    company_ruc: "12-3456789",
    recipient_name: "John Doe",
    recipient_id: "CUST-001",
    bank_account_name: "My Bank",
    bank_account_number: "1234567890",
    bank_name: "First National Bank",
    numero_cuenta_bancaria: "001",
    staffing_percentage: 20,
    proyecto_percentage: 70,
    software_percentage: 10,
  },
  {
    onedrive_file_id: "03KLMNOPQRSTU1234567890ABCDEFGHIJ",
    billed_to: "STARTUP INC",
    invoice_number: "INV-2024-002",
    date_of_issue: "2024-06-15",
    due_date: "2024-07-15",
    invoice_description: "Marketing Campaign Q2",
    item_0_description: "Social Media Management",
    item_0_quantity: 1,
    item_0_rate: 500.00,
    item_0_amount: 500.00,
    item_1_description: "Content Creation (3 articles)",
    item_1_quantity: 3,
    item_1_rate: 150.00,
    item_1_amount: 450.00,
    subtotal: 950.00,
    discount: 50,
    tax: 0,
    total: 900.00,
    terms: "Due on receipt",
    conditions_instructions: "Please pay promptly.",
    company_name: "Creative Solutions Ltd.",
    company_mobile: "555-5678",
    company_email: "accounts@creativesol.com",
    company_website: "www.creativesol.com",
    company_address: "456 Oak Ave, Otherville, USA",
    company_ruc: "98-7654321",
    recipient_name: "Jane Smith",
    recipient_id: "CUST-002",
    bank_account_name: "Creative Bank",
    bank_account_number: "0987654321",
    bank_name: "Second Commercial Bank",
    numero_cuenta_bancaria: "002",
    staffing_percentage: 50,
    proyecto_percentage: 30,
    software_percentage: 20,
  }
];

export const sampleInvoices: Invoice[] = rawSampleInvoices.map(transformRawInvoice);
