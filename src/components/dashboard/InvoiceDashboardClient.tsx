
"use client";

import * as React from "react";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice } from "@/lib/types";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
// Removed StatCard and InvoiceMetricsChart related imports

interface InvoiceDashboardClientProps {
  initialInvoices: Invoice[];
  availableMonths: string[];
}

export function InvoiceDashboardClient({ initialInvoices, availableMonths }: InvoiceDashboardClientProps) {
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", searchTerm: "" });
  const [selectedInvoiceForSummary, setSelectedInvoiceForSummary] = React.useState<Invoice | null>(null);
  // Removed selectedInvoiceForChart state

  // Removed totalInvoiced, invoicesDue, invoicesPaid memos

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
    // Removed logic for deselecting selectedInvoiceForChart

  }, [filters, initialInvoices]);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoiceForSummary(invoice);
    // Removed setSelectedInvoiceForChart(invoice);
  };

  const handleCloseSummary = () => {
    setSelectedInvoiceForSummary(null);
  };

  return (
    <>
      {/* Removed StatCard components */}
      <InvoiceFilter 
        filters={filters} 
        setFilters={setFilters} 
        availableMonths={availableMonths} 
      />
      <InvoiceTable invoices={filteredInvoices} onRowClick={handleRowClick} />
      {selectedInvoiceForSummary && (
        <InvoiceSummaryCard invoice={selectedInvoiceForSummary} onClose={handleCloseSummary} />
      )}
      {/* Removed InvoiceMetricsChart component */}
    </>
  );
}
