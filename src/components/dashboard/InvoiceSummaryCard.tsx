
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { summarizeInvoice, type SummarizeInvoiceOutput } from "@/ai/flows/invoice-summary";
import type { Invoice } from "@/lib/types";
import { Loader2, FileText, AlertTriangle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvoiceSummaryCardProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceSummaryCard({ invoice, onClose }: InvoiceSummaryCardProps) {
  const [summary, setSummary] = useState<SummarizeInvoiceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
          // The AI flow expects invoiceData as a JSON string.
          // We pass a copy of the invoice object, from which the 'items' array
          // is removed, as the AI model might expect the original flat item structure.
          // The `Invoice` type now includes optional item_X_... fields.
          const rawInvoiceData = { ...invoice };
          delete (rawInvoiceData as Partial<Invoice>).items; // Remove transformed items, rely on item_X_... fields

          const result = await summarizeInvoice({ invoiceData: JSON.stringify(rawInvoiceData) });
          setSummary(result);
        } catch (e) {
          console.error("Error fetching invoice summary:", e);
          setError("Error al generar el resumen. Por favor, inténtelo de nuevo.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSummary();
    }
  }, [invoice]);

  if (!invoice) {
    return null;
  }

  return (
    <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-lg z-50 shadow-2xl bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Resumen de Factura
          </CardTitle>
          <CardDescription>Resumen generado por IA para Factura N° {invoice.invoice_number}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar resumen">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Generando resumen...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="mt-2 text-center">{error}</p>
          </div>
        )}
        {summary && !isLoading && !error && (
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3 text-sm">
              <p className="whitespace-pre-wrap leading-relaxed">{summary.summary}</p>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
