
"use client";

import * as React from "react";
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice } from "@/lib/types";

interface InvoiceDashboardClientProps {
  initialInvoices: Invoice[];
  availableMonths: string[];
}

export function InvoiceDashboardClient({ initialInvoices, availableMonths }: InvoiceDashboardClientProps) {
  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ month: "all", provedor: "" });

  React.useEffect(() => {
    const lowerProvedor = filters.provedor.toLowerCase();
    
    const newFilteredInvoices = initialInvoices.filter(invoice => {
      const matchesProvedor = lowerProvedor === "" || 
        (invoice.billed_to && invoice.billed_to.toLowerCase().includes(lowerProvedor));
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));
      
      return matchesProvedor && matchesMonth;
    });
    
    setFilteredInvoices(newFilteredInvoices);

  }, [filters, initialInvoices]);

  return (
    <>
      <InvoiceFilter 
        filters={filters} 
        setFilters={setFilters} 
        availableMonths={availableMonths} 
      />
      <InvoiceTable invoices={filteredInvoices} />
    </>
  );
}
