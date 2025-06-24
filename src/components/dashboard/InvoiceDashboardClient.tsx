
"use client";

import * as React from "react";
import { Upload, ArrowUp, ArrowDown, Loader2 } from "lucide-react"; 
import { InvoiceTable } from "@/components/dashboard/InvoiceTable";
import { InvoiceFilter, type InvoiceFilters } from "@/components/dashboard/InvoiceFilter";
import type { Invoice, ErrorInvoice } from "@/lib/types";
import { ErrorFileList } from "@/components/dashboard/ErrorFileList"; 
import { updateInvoiceAccountInDB } from "@/app/actions/updateInvoiceAccount";
import { updateInvoiceNumberInDB } from "@/app/actions/updateInvoiceNumber";
import { useToast } from "@/hooks/use-toast";
import { useDemoAuth } from "@/context/DemoAuthProvider";
import { getInvoices, getErrorInvoices } from "@/app/actions/getInvoices";

type SortKey = keyof Invoice | null;
type SortOrder = 'asc' | 'desc' | null;

export function InvoiceDashboardClient() {
  const [managedInvoices, setManagedInvoices] = React.useState<Invoice[]>([]);
  const [errorFiles, setErrorFiles] = React.useState<ErrorInvoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [filteredInvoices, setFilteredInvoices] = React.useState<Invoice[]>([]);
  const [filters, setFilters] = React.useState<InvoiceFilters>({ 
    month: "all", 
    searchTerm: "",
    accountNumber: "all",
  });
  const { toast } = useToast();

  const [sortKey, setSortKey] = React.useState<SortKey>(null);
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(null);

  const { loading: demoAuthLoading } = useDemoAuth();

  React.useEffect(() => {
    // Don't fetch until we know the auth status
    if (demoAuthLoading) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      // Fetch real data regardless of auth mode (demo or Azure)
      const [invoices, errors] = await Promise.all([
          getInvoices(),
          getErrorInvoices()
      ]);
      setManagedInvoices(invoices);
      setErrorFiles(errors);
      setIsLoading(false);
    };

    fetchData();
  }, [demoAuthLoading]);
  
  React.useEffect(() => {
    const lowerSearchTerm = filters.searchTerm.toLowerCase();
    
    const newFilteredInvoices = managedInvoices.filter(invoice => {
      const matchesSearchTerm = lowerSearchTerm === "" || 
        (invoice.billed_to && invoice.billed_to.toLowerCase().includes(lowerSearchTerm)) ||
        (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm));
      
      const matchesMonth = filters.month === "all" || 
        (invoice.date_of_issue && invoice.date_of_issue.startsWith(filters.month));

      const matchesAccountNumber = filters.accountNumber === "all" ||
        (invoice.numero_cuenta_bancaria && invoice.numero_cuenta_bancaria === filters.accountNumber);
      
      return matchesSearchTerm && matchesMonth && matchesAccountNumber;
    });
    
    setFilteredInvoices(newFilteredInvoices);

  }, [filters, managedInvoices]);

  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set<string>();
    managedInvoices.forEach(inv => {
      if (inv.date_of_issue) { 
        monthsSet.add(inv.date_of_issue.substring(0, 7)); 
      }
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [managedInvoices]);

  const availableAccountNumbers = React.useMemo(() => {
    const accountNumbers = new Set<string>();
    managedInvoices.forEach(inv => {
      if (inv.numero_cuenta_bancaria && inv.numero_cuenta_bancaria !== 'N/A') {
        accountNumbers.add(inv.numero_cuenta_bancaria);
      }
    });
    return Array.from(accountNumbers).sort();
  }, [managedInvoices]);

  const handleSort = (key: keyof Invoice) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortKey(null);
        setSortOrder(null);
      } else { // Should only happen if sortOrder was null
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredInvoices = React.useMemo(() => {
    let sortableItems = [...filteredInvoices];
    if (sortKey && sortOrder) {
      sortableItems.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        let comparison = 0;

        if (valA === null || valA === undefined) comparison = 1;
        else if (valB === null || valB === undefined) comparison = -1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if ((sortKey === 'date_of_issue' || sortKey === 'due_date') && typeof valA === 'string' && typeof valB === 'string') {
          try {
            const dateA = new Date(valA).getTime();
            const dateB = new Date(valB).getTime();
            if (isNaN(dateA) && isNaN(dateB)) comparison = 0;
            else if (isNaN(dateA)) comparison = 1;
            else if (isNaN(dateB)) comparison = -1;
            else comparison = dateA - dateB;
          } catch (e) {
            comparison = 0; // Fallback for invalid date strings
          }
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        }
        
        return sortOrder === 'asc' ? comparison : comparison * -1;
      });
    }
    return sortableItems;
  }, [filteredInvoices, sortKey, sortOrder]);


  const handleExportToSam = () => {
    console.log("Exportar Facturas a SAM button clicked");
    // const invoicesToExport = managedInvoices.filter(inv => inv.numero_cuenta_bancaria && inv.numero_cuenta_bancaria !== 'N/A');
    // console.log("Invoices ready for SAM export:", invoicesToExport);
  };

  const handleAccountUpdate = async (invoiceId: string, newAccountNumber: string) => {
    // Optimistically update UI
    const originalInvoices = [...managedInvoices];
    setManagedInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv._id === invoiceId 
          ? { ...inv, numero_cuenta_bancaria: newAccountNumber } 
          : inv
      )
    );
    
    const result = await updateInvoiceAccountInDB(invoiceId, newAccountNumber);

    if (result.success) {
      toast({
        title: "Cuenta Actualizada",
        description: `El número de cuenta de la factura se actualizó correctamente a ${newAccountNumber}.`,
        variant: "default", 
      });
    } else {
      toast({
        title: "Actualización Fallida",
        description: result.error || "No se pudo actualizar el número de cuenta en la base de datos. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
      // Revert optimistic update on failure
       setManagedInvoices(originalInvoices);
    }
  };

  const handleInvoiceNumberUpdate = async (invoiceId: string, newInvoiceNumber: string) => {
    // Optimistically update UI
    const originalInvoices = [...managedInvoices];
    setManagedInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv._id === invoiceId 
          ? { ...inv, invoice_number: newInvoiceNumber } 
          : inv
      )
    );
    
    const result = await updateInvoiceNumberInDB(invoiceId, newInvoiceNumber);

    if (result.success) {
      toast({
        title: "Número de Factura Actualizado",
        description: `El número de la factura se actualizó correctamente a ${newInvoiceNumber}.`,
        variant: "default", 
      });
    } else {
      toast({
        title: "Actualización Fallida",
        description: result.error || "No se pudo actualizar el número de factura. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
      // Revert optimistic update on failure
       setManagedInvoices(originalInvoices);
    }
  };

  if (isLoading || demoAuthLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando facturas...</p>
      </div>
    );
  }

  return (
    <>
      <ErrorFileList errorFiles={errorFiles} />
      
      <InvoiceFilter 
        filters={filters} 
        setFilters={setFilters} 
        availableMonths={availableMonths}
        availableAccountNumbers={availableAccountNumbers}
      />
      <InvoiceTable 
        invoices={sortedAndFilteredInvoices} 
        onAccountChange={handleAccountUpdate}
        onInvoiceNumberChange={handleInvoiceNumberUpdate}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        onExportToSam={handleExportToSam}
      />
    </>
  );
}
