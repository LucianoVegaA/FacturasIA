
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
import { ChevronLeft, ChevronRight, Eye, AlertTriangle, ArrowUp, ArrowDown, ChevronsUpDown, Upload, Save, Expand } from "lucide-react"; 
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 25];

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

const TaxDisplay = ({ rate }: { rate: number }) => {
  const roundedRate = Math.round(rate);
  let label = 'N/A';

  if (roundedRate === 0) {
    label = 'C1';
  } else if (roundedRate === 7) {
    label = 'C2';
  } else if (roundedRate === 10) {
    label = 'C3';
  }

  return (
    <div className="text-right">
      <span>{label}</span>
    </div>
  );
};
TaxDisplay.displayName = 'TaxDisplay';

const ExpandableDescription: React.FC<{
  description: string;
  invoiceNumber: string;
}> = ({ description, invoiceNumber }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const maxLength = 30;
  const isLongDescription = description && description.length > maxLength;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 min-w-0">
        <div className="truncate" title={description}>
          {description}
        </div>
      </div>
      {isLongDescription && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Expand className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Descripción completa</DialogTitle>
              <DialogDescription>
                Factura N° {invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
ExpandableDescription.displayName = 'ExpandableDescription';


export function InvoiceTable({ invoices, onAccountChange, onInvoiceNumberChange, sortKey, sortOrder, onSort, onExportToSam }: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [pendingUpdate, setPendingUpdate] = React.useState<{ invoiceId: string; newAccountNumber: string } | null>(null);

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    // Adjust current page to ensure we don't end up on an empty page
    const maxPage = Math.ceil(invoices.length / newItemsPerPage);
    setCurrentPage(prev => Math.min(prev, maxPage || 1));
  };

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
    const baseUrl = "https://newhnl-my.sharepoint.com/personal/lvega_hypernovalabs_com/Documents/Facturas_Procesadas/";
    if (!invoice.file_name) {
      console.error("El nombre del archivo no está disponible.");
      return;
    }
    const pdfUrl = `${baseUrl}${invoice.file_name}`;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
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
                  <SortableHeader columnKey="billed_to" title="Cliente" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="date_of_issue" title="Fecha Emisión" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="due_date" title="Fecha Vencimiento" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="subtotal" title="Subtotal" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="text-right" />
                  <SortableHeader columnKey="tax" title="Impuesto" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="text-right" />
                  <SortableHeader columnKey="total" title="Total" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} className="text-right" />
                  <SortableHeader columnKey="numero_cuenta_bancaria" title="N° Cuenta" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader columnKey="invoice_description" title="Descripción" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={onSort} />
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
                      <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <TaxDisplay rate={invoice.tax_rate} />
                      </TableCell>
                      <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
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
                       <TableCell>
                        <div className="w-60">
                          <ExpandableDescription 
                            description={invoice.invoice_description} 
                            invoiceNumber={invoice.invoice_number}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPdfClick(invoice);
                            }}
                            disabled={!invoice.file_name}
                          >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No se encontraron facturas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Mostrar
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                por página • {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, invoices.length)} de {invoices.length} facturas
              </span>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
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
          </div>
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
