
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/lib/types";
import { ChevronLeft, ChevronRight, Eye, AlertTriangle, ArrowUp, ArrowDown, ChevronsUpDown, Upload, Save } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface InvoiceTableProps {
  invoices: Invoice[];
  onAccountChange?: (invoiceId: string, newAccountNumber: string) => void;
  onInvoiceNumberChange?: (invoiceId: string, newInvoiceNumber: string) => void;
  sortKey: keyof Invoice | null;
  sortOrder: 'asc' | 'desc' | null;
  onSort: (key: keyof Invoice) => void;
  onExportToSam?: () => void; 
  onViewPdf: (url: string, fileName: string) => void;
}

const ITEMS_PER_PAGE = 10;

const accountOptions = [
  "701001", "701003", "701006", "701008", "701009", "701011",
  "701019", "701020", "701501", "702001", "703020", "707003", "712004"
];

const SortableHeader: React.FC<{
  columnKey: keyof Invoice;
  title: string;
  currentSortKey: keyof Invoice | null;
  currentSortOrder: 'asc' | 'desc' | null;
  onSort: (key: keyof Invoice) => void;
  className?: string;
}> = ({ columnKey, title, currentSortKey, currentSortOrder, onSort, className }) => {
  const isActive = currentSortKey === columnKey;
  const Icon = isActive ? (currentSortOrder === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <TableHead onClick={() => onSort(columnKey)} className={cn("cursor-pointer hover:bg-muted/50", className)}>
      <div className="flex items-center gap-2">
        {title}
        <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`} />
      </div>
    </TableHead>
  );
};
SortableHeader.displayName = "SortableHeader";


const EditableInvoiceNumberCell: React.FC<{
  invoice: Invoice;
  onSave: (invoiceId: string, newInvoiceNumber: string) => void;
}> = ({ invoice, onSave }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSaveClick = () => {
    if (inputValue.trim() && invoice._id) {
      onSave(invoice._id, inputValue.trim());
      setInputValue(''); // Reset after saving
    }
  };

  if (invoice.invoice_number !== 'N/A' || !invoice._id) {
    return <span className="font-medium">{invoice.invoice_number}</span>;
  }

  return (
    <div className="flex items-center gap-2 min-w-[250px]">
      <Input
        placeholder="Asignar N° Factura"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveClick(); }}
        className="h-9 text-xs"
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        size="sm"
        onClick={(e) => { e.stopPropagation(); handleSaveClick(); }}
        disabled={!inputValue.trim()}
        className="h-9"
      >
        <Save className="mr-2 h-4 w-4" />
        Guardar
      </Button>
    </div>
  );
};
EditableInvoiceNumberCell.displayName = 'EditableInvoiceNumberCell';


export function InvoiceTable({ invoices, onAccountChange, onInvoiceNumberChange, sortKey, sortOrder, onSort, onExportToSam, onViewPdf }: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [pendingUpdate, setPendingUpdate] = React.useState<{ invoiceId: string; newAccountNumber: string } | null>(null);

  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInitiateAccountChange = (invoiceId: string | undefined, selectedAccount: string) => {
    if (invoiceId && onAccountChange) {
      setPendingUpdate({ invoiceId, newAccountNumber: selectedAccount });
      setIsConfirmDialogOpen(true);
    }
  };

  const confirmAccountChange = () => {
    if (pendingUpdate && onAccountChange) {
      onAccountChange(pendingUpdate.invoiceId, pendingUpdate.newAccountNumber);
    }
    setIsConfirmDialogOpen(false);
    setPendingUpdate(null);
  };

  const cancelAccountChange = () => {
    setIsConfirmDialogOpen(false);
    setPendingUpdate(null);
  };
  
  const handleViewPdfClick = (invoice: Invoice) => {
    const baseUrl = process.env.NEXT_PUBLIC_SHAREPOINT_PDF_BASE_URL;
    if (!baseUrl) {
      console.error("La URL base de SharePoint para los PDF no está configurada en las variables de entorno (NEXT_PUBLIC_SHAREPOINT_PDF_BASE_URL).");
      // The button will be disabled if the env var is not set, so this is a fallback.
      return;
    }
    const pdfUrl = `${baseUrl}/${invoice.invoice_number}.pdf`;
    const fileName = `${invoice.invoice_number}.pdf`;
    onViewPdf(pdfUrl, fileName);
  };

  return (
    <>
      <Card className="shadow-lg mt-6"> 
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registros de Facturas</CardTitle>
          {onExportToSam && (
            <Button onClick={onExportToSam} variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Exportar Facturas a SAM
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader columnKey="invoice_number" title="Factura N°" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="billed_to" title="Cliente (Proveedor)" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="date_of_issue" title="Fecha Emisión" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="due_date" title="Fecha Vencimiento" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="numero_cuenta_bancaria" title="Número de Cuenta" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="total" title="Total" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="text-right" />
                  <TableHead className="text-center">Ver PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow
                      key={invoice._id || invoice.invoice_number}
                    >
                      <TableCell>
                        {onInvoiceNumberChange ? (
                          <EditableInvoiceNumberCell invoice={invoice} onSave={onInvoiceNumberChange} />
                        ) : (
                          <span className="font-medium">{invoice.invoice_number}</span>
                        )}
                      </TableCell>
                      <TableCell>{invoice.billed_to}</TableCell>
                      <TableCell>{new Date(invoice.date_of_issue).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        {(!invoice.numero_cuenta_bancaria || invoice.numero_cuenta_bancaria === 'N/A') && onAccountChange && invoice._id ? (
                          <Select
                            onValueChange={(value) => handleInitiateAccountChange(invoice._id, value)}
                          >
                            <SelectTrigger
                              className="w-[150px] h-9 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue placeholder="Asignar Cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                              {accountOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          invoice.numero_cuenta_bancaria || 'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPdfClick(invoice);
                            }}
                            disabled={!invoice.invoice_number || invoice.invoice_number === 'N/A' || !process.env.NEXT_PUBLIC_SHAREPOINT_PDF_BASE_URL}
                          >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron facturas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {pendingUpdate && (
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                Confirmar Cambio de Cuenta
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea cambiar el número de cuenta para la factura
                {' '}<strong>{invoices.find(inv => inv._id === pendingUpdate.invoiceId)?.invoice_number || 'N/A'}</strong>
                {' '}a <strong>{pendingUpdate.newAccountNumber}</strong>?
                <br />
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelAccountChange}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAccountChange} className="bg-destructive hover:bg-destructive/90">
                Confirmar Cambio
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
