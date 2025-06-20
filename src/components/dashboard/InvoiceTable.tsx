
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
import { ChevronLeft, ChevronRight, Download } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick: (invoice: Invoice) => void;
  onAccountChange?: (invoiceId: string, newAccountNumber: string) => void;
}

const ITEMS_PER_PAGE = 10;

const accountOptions = [
  "701001", "701003", "701006", "701008", "701009", "701011", 
  "701019", "701020", "701501", "702001", "703020", "707003", "712004"
];

export function InvoiceTable({ invoices, onRowClick, onAccountChange }: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAccount = (invoiceId: string | undefined, selectedAccount: string) => {
    if (invoiceId && onAccountChange) {
      onAccountChange(invoiceId, selectedAccount);
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Invoice Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client (Provedor)</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Número de Cuenta</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Download PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice._id || invoice.invoice_number} 
                    onClick={() => onRowClick(invoice)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.billed_to}</TableCell>
                    <TableCell>{new Date(invoice.date_of_issue).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      {(!invoice.numero_cuenta_bancaria || invoice.numero_cuenta_bancaria === 'N/A') && onAccountChange && invoice._id ? (
                        <Select
                          onValueChange={(value) => handleSelectAccount(invoice._id, value)}
                          defaultValue={invoice.numero_cuenta_bancaria === 'N/A' ? undefined : invoice.numero_cuenta_bancaria || undefined}
                        >
                          <SelectTrigger 
                            className="w-[150px] h-9 text-xs" 
                            onClick={(e) => e.stopPropagation()} // Prevent row click
                          >
                            <SelectValue placeholder="Assign Account" />
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
                      {invoice.pdf_url ? (
                        <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled onClick={(e) => e.stopPropagation()}>
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No invoices found.
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
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
