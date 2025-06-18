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
          // We need to pass the original flat structure if the AI was trained on it.
          // For this example, we assume `invoice` has all necessary fields,
          // including the flat `item_X_...` ones if the AI model relies on them.
          // If not, we might need to reconstruct that from `invoice.items`.
          // For now, let's stringify the passed invoice object.
          const rawInvoiceData = { ...invoice };
          // Remove the transformed 'items' array as the AI model expects flat item structure
          delete (rawInvoiceData as any).items; 


          const result = await summarizeInvoice({ invoiceData: JSON.stringify(rawInvoiceData) });
          setSummary(result);
        } catch (e) {
          console.error("Error fetching invoice summary:", e);
          setError("Failed to generate summary. Please try again.");
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
            Invoice Summary
          </CardTitle>
          <CardDescription>AI-generated summary for Invoice #{invoice.invoice_number}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close summary">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Generating summary...</p>
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
