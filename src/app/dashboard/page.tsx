
"use client";

import * as React from "react";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import { sampleInvoices as initialInvoices } from "@/lib/invoiceData";
import type { Invoice } from "@/lib/types";
// Removed StatCard, InvoiceSummaryCard, InvoiceMetricsChart, and unused icons/toast

export default function DashboardPage() {
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", provedor: "" });

  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    initialInvoices.forEach(inv => {
      if (inv.date_of_issue) {
        months.add(inv.date_of_issue.substring(0, 7)); // "YYYY-MM"
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, []);

  React.useEffect(() => {
    const lowerProvedor = filters.provedor.toLowerCase();
    
    const newFilteredInvoices = initialInvoices.filter(invoice => {
      const matchesProvedor = lowerProvedor === "" ||
        invoice.billed_to.toLowerCase().includes(lowerProvedor);
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));
      
      return matchesProvedor && matchesMonth;
    });
    
    setFilteredInvoices(newFilteredInvoices);

  }, [filters]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
      
      <InvoiceFilter 
        filters={filters} 
        setFilters={setFilters} 
        availableMonths={availableMonths} 
      />
      
      <InvoiceTable invoices={filteredInvoices} />
      
    </div>
  );
}
