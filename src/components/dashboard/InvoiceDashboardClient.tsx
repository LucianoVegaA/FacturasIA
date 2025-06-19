
"use client";

import * as React from "react";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice } from "@/lib/types";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
import { InvoiceMetricsChart } from "@/components/dashboard/InvoiceMetricsChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingUp, FileText, AlertCircle, CheckCircle } from "lucide-react";


interface InvoiceDashboardClientProps {
  initialInvoices: Invoice[];
  availableMonths: string[];
}

export function InvoiceDashboardClient({ initialInvoices, availableMonths }: InvoiceDashboardClientProps) {
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", searchTerm: "" });
  const [selectedInvoiceForSummary, setSelectedInvoiceForSummary] = React.useState<Invoice | null>(null);
  const [selectedInvoiceForChart, setSelectedInvoiceForChart] = React.useState<Invoice | null>(null);


  const totalInvoiced = React.useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [filteredInvoices]);

  const invoicesDue = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredInvoices.filter(inv => inv.due_date && inv.due_date < today).length; 
  }, [filteredInvoices]);
  
  const invoicesPaid = React.useMemo(() => {
    // This is a placeholder. Actual paid status would need to be tracked.
    // For now, let's assume if it's not due or overdue, it's "paid" for demo purposes.
    const today = new Date().toISOString().split('T')[0];
    return filteredInvoices.filter(inv => !inv.due_date || inv.due_date >= today).length;
  }, [filteredInvoices]);


  React.useEffect(() => {
    const lowerSearchTerm = filters.searchTerm.toLowerCase();
    
    const newFilteredInvoices = initialInvoices.filter(invoice => {
      const matchesSearchTerm = lowerSearchTerm === "" || 
        (invoice.billed_to && invoice.billed_to.toLowerCase().includes(lowerSearchTerm)) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm)); // Added invoice number search
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));
      
      return matchesSearchTerm && matchesMonth;
    });
    
    setFilteredInvoices(newFilteredInvoices);
    // If the currently selected invoice for chart is no longer in the filtered list, deselect it
    if (selectedInvoiceForChart && !newFilteredInvoices.find(inv => inv._id === selectedInvoiceForChart._id)) {
      setSelectedInvoiceForChart(null);
    }

  }, [filters, initialInvoices, selectedInvoiceForChart]);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoiceForSummary(invoice);
    setSelectedInvoiceForChart(invoice); // Also set for chart when row is clicked
  };

  const handleCloseSummary = () => {
    setSelectedInvoiceForSummary(null);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard 
          title="Total Invoiced" 
          value={`$${totalInvoiced.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={TrendingUp} 
          description="Sum of all filtered invoices"
        />
        <StatCard 
          title="Invoices Paid (Est.)" 
          value={invoicesPaid.toString()} 
          icon={CheckCircle}
          description="Estimated paid or on-time"
        />
        <StatCard 
          title="Invoices Due/Overdue" 
          value={invoicesDue.toString()} 
          icon={AlertCircle}
          description="Based on due dates"
        />
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
      <InvoiceMetricsChart invoices={filteredInvoices} selectedInvoice={selectedInvoiceForChart} />
    </>
  );
}
