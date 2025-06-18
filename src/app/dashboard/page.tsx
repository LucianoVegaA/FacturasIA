"use client";

import * as React from "react";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
import { InvoiceMetricsChart } from "@/components/dashboard/InvoiceMetricsChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { sampleInvoices as initialInvoices } from "@/lib/invoiceData";
import type { Invoice } from "@/lib/types";
import { DollarSign, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // For potential future use
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ searchTerm: "", status: "all" });
  const [isLoading, setIsLoading] = React.useState(false); // Simulate loading

  const { toast } = useToast();

  React.useEffect(() => {
    setIsLoading(true);
    // Simulate API call or data processing
    const lowerSearchTerm = filters.searchTerm.toLowerCase();
    const newFilteredInvoices = initialInvoices.filter(invoice => {
      const matchesSearch = lowerSearchTerm === "" ||
        invoice.invoice_number.toLowerCase().includes(lowerSearchTerm) ||
        invoice.billed_to.toLowerCase().includes(lowerSearchTerm);
      
      const matchesStatus = filters.status === "all" || invoice.status === filters.status;
      
      // Date range filter would be added here
      return matchesSearch && matchesStatus;
    });
    
    // Simulate delay for loading effect
    setTimeout(() => {
        setFilteredInvoices(newFilteredInvoices);
        setInvoices(initialInvoices); // Base invoices remain unchanged
        setIsLoading(false);
    }, 500);

  }, [filters]);


  const handleViewSummary = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseSummary = () => {
    setSelectedInvoice(null);
  };
  
  const totalRevenue = React.useMemo(() => 
    invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0), 
  [invoices]);
  
  const outstandingAmount = React.useMemo(() => 
    invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.total, 0), 
  [invoices]);

  const overdueInvoicesCount = React.useMemo(() => 
    invoices.filter(inv => inv.status === 'Overdue').length, 
  [invoices]);


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          description="From paid invoices"
          isLoading={isLoading}
        />
        <StatCard 
          title="Outstanding Amount" 
          value={`$${outstandingAmount.toFixed(2)}`} 
          icon={AlertCircle} 
          description="From unpaid/overdue invoices"
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Invoices" 
          value={invoices.length} 
          icon={FileText} 
          description="Across all statuses"
          isLoading={isLoading}
        />
        <StatCard 
          title="Overdue Invoices" 
          value={overdueInvoicesCount} 
          icon={AlertCircle} 
          description="Require immediate attention"
          isLoading={isLoading}
        />
      </div>
      
      <InvoiceFilter filters={filters} setFilters={setFilters} />
      
      <InvoiceTable invoices={filteredInvoices} onViewSummary={handleViewSummary} isLoading={isLoading} />
      
      {selectedInvoice && (
        <InvoiceSummaryCard invoice={selectedInvoice} onClose={handleCloseSummary} />
      )}
      
      <InvoiceMetricsChart invoices={invoices} selectedInvoice={selectedInvoice} />

    </div>
  );
}
