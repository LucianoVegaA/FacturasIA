
"use client";

import * as React from "react";
import { Upload } from "lucide-react"; 
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice, ErrorInvoice } from "@/lib/types";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
import { ErrorInvoiceList } from "@/components/dashboard/ErrorInvoiceList"; // Added import
import { Button } from "@/components/ui/button"; 

interface InvoiceDashboardClientProps {
  initialInvoices: Invoice[];
  initialErrorInvoices: ErrorInvoice[];
  availableMonths: string[];
}

export function InvoiceDashboardClient({ initialInvoices, initialErrorInvoices, availableMonths }: InvoiceDashboardClientProps) {
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", searchTerm: "" });
  const [selectedInvoiceForSummary, setSelectedInvoiceForSummary] = React.useState<Invoice | null>(null);

  React.useEffect(() => {
    const lowerSearchTerm = filters.searchTerm.toLowerCase();
    
    const newFilteredInvoices = initialInvoices.filter(invoice => {
      const matchesSearchTerm = lowerSearchTerm === "" || 
        (invoice.billed_to && invoice.billed_to.toLowerCase().includes(lowerSearchTerm)) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm));
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));
      
      return matchesSearchTerm && matchesMonth;
    });
    
    setFilteredInvoices(newFilteredInvoices);

  }, [filters, initialInvoices]);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoiceForSummary(invoice);
  };

  const handleCloseSummary = () => {
    setSelectedInvoiceForSummary(null);
  };

  const handleImportToSam = () => {
    console.log("Import Invoices to SAM button clicked");
  };

  return (
    <>
      {/* Conditionally render ErrorInvoiceList if there are error invoices */}
      {initialErrorInvoices.length > 0 && (
        <ErrorInvoiceList errorInvoices={initialErrorInvoices} />
      )}
      <div className="my-4 flex justify-end"> {/* Added margin-top/bottom for spacing */}
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
      <InvoiceTable invoices={filteredInvoices} onRowClick={handleRowClick} />
      {selectedInvoiceForSummary && (
        <InvoiceSummaryCard invoice={selectedInvoiceForSummary} onClose={handleCloseSummary} />
      )}
    </>
  );
}
