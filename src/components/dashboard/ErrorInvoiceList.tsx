
"use client";

import type { ErrorInvoice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileWarning } from "lucide-react"; // Added FileWarning for title
import { Badge } from "@/components/ui/badge";

interface ErrorInvoiceListProps {
  errorInvoices: ErrorInvoice[];
}

export function ErrorInvoiceList({ errorInvoices }: ErrorInvoiceListProps) {
  if (!errorInvoices || errorInvoices.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-md border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg text-destructive">
          <FileWarning className="mr-2 h-5 w-5" /> Facturas con Error
        </CardTitle>
        <CardDescription>
          Las siguientes facturas tienen problemas y requieren atención.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48 max-h-[200px] rounded-md border p-3">
          {errorInvoices.length > 0 ? (
            <ul className="space-y-3">
              {errorInvoices.map((invoice) => (
                <li key={invoice._id || invoice.invoice_number} className="p-3 rounded-md border border-dashed border-destructive/50 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-destructive-foreground">
                      Factura #{invoice.invoice_number}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Cliente: {invoice.billed_to}
                  </p>
                  <div className="flex items-start text-xs text-destructive mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
                    <p className="break-words">{invoice.error_description || "No specific error details provided."}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay facturas con errores.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
