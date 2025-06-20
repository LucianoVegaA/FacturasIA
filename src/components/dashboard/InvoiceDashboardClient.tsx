
"use client";

import * as React from "react";
import { Upload } from "lucide-react"; 
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice, SimpleErrorFile } from "@/lib/types";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
import { ErrorFileList } from "@/components/dashboard/ErrorFileList"; 
import { Button } from "@/components/ui/button"; 

interface InvoiceDashboardClientProps {
  initialInvoices: Invoice[];
  initialErrorFiles: SimpleErrorFile[]; 
  availableMonths: string[];
}

export function InvoiceDashboardClient({ initialInvoices, initialErrorFiles, availableMonths }: InvoiceDashboardClientProps) {
  const [managedInvoices, setManagedInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(managedInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", searchTerm: "" });
  const [selectedInvoiceForSummary, setSelectedInvoiceForSummary] = React.useState<Invoice | null>(null);

  React.useEffect(() => {
    // Update managedInvoices if initialInvoices prop changes
    setManagedInvoices(initialInvoices);
  }, [initialInvoices]);
  
  React.useEffect(() => {
    const lowerSearchTerm = filters.searchTerm.toLowerCase();
    
    const newFilteredInvoices = managedInvoices.filter(invoice => {
      const matchesSearchTerm = lowerSearchTerm === "" || 
        (invoice.billed_to && invoice.billed_to.toLowerCase().includes(lowerSearchTerm)) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm));
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));
      
      return matchesSearchTerm && matchesMonth;
    });
    
    setFilteredInvoices(newFilteredInvoices);

  }, [filters, managedInvoices]);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoiceForSummary(invoice);
  };

  const handleCloseSummary = () => {
    setSelectedInvoiceForSummary(null);
  };

  const handleImportToSam = () => {
    console.log("Import Invoices to SAM button clicked");
    // Future implementation:
    // const invoicesToImport = managedInvoices.filter(inv => inv.numero_cuenta_bancaria && inv.numero_cuenta_bancaria !== 'N/A');
    // console.log("Invoices ready for SAM import:", invoicesToImport);
    // Call server action/API here
  };

  const handleAccountUpdate = (invoiceId: string, newAccountNumber: string) => {
    setManagedInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv._id === invoiceId 
          ? { ...inv, numero_cuenta_bancaria: newAccountNumber } 
          : inv
      )
    );
    // Here you would also typically trigger a save to the backend:
    // saveInvoiceAccountToDB(invoiceId, newAccountNumber); 
    console.log(`Account for invoice ${invoiceId} updated to ${newAccountNumber} (client-side)`);
  };


  return (
    <>
      <ErrorFileList errorFiles={initialErrorFiles} />
      
      <div className="my-4 flex justify-end">
        <Button onClick={handleImportToSam} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Invoices to SAM
        </Button>
      </div>
      <InvoiceFilter 
        filters={filters} 
        setFilters={setFilters} 
        availableMonths={availableMonths} 
      />
      <InvoiceTable 
        invoices={filteredInvoices} 
        onRowClick={handleRowClick}
        onAccountChange={handleAccountUpdate} 
      />
      {selectedInvoiceForSummary && (
        <InvoiceSummaryCard invoice={selectedInvoiceForSummary} onClose={handleCloseSummary} />
      )}
    </>
  );
}
