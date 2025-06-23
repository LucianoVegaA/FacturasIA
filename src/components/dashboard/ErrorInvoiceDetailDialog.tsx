
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { ErrorInvoice } from "@/lib/types";

interface ErrorInvoiceDetailDialogProps {
  invoice: ErrorInvoice | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// These are the raw field names we expect from the database.
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "facturado_a", label: "Facturado A (Cliente)" },
  { key: "numero_factura", label: "Número de Factura" },
  { key: "fecha_emision", label: "Fecha de Emisión" },
  { key: "total", label: "Total" },
  { key: "descripcion", label: "Descripción" },
];

export function ErrorInvoiceDetailDialog({
  invoice,
  isOpen,
  onOpenChange,
}: ErrorInvoiceDetailDialogProps) {
  if (!invoice) {
    return null;
  }

  const pdfUrl = process.env.NEXT_PUBLIC_SHAREPOINT_ERROR_PDF_BASE_URL && invoice.file_name
    ? `${process.env.NEXT_PUBLIC_SHAREPOINT_ERROR_PDF_BASE_URL}/${invoice.file_name}`
    : null;

  const getMissingFields = () => {
    if (!invoice.raw_data) return ["No se encontró información detallada."];
    
    const missing = REQUIRED_FIELDS.filter(({ key }) => {
      const value = invoice.raw_data[key];
      return value === null || value === undefined || value === "" || (typeof value === 'number' && isNaN(value));
    });

    // Special check for items
    const hasItems = Object.keys(invoice.raw_data).some(k => k.startsWith('item_') && k.endsWith('_description'));
    if (!hasItems) {
        missing.push({ key: 'items', label: 'Items (ninguno encontrado)'});
    }

    if (missing.length === 0) return [];
    return missing.map(f => f.label);
  };
  
  const missingFields = getMissingFields();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>Detalle de Factura con Error</DialogTitle>
          <DialogDescription>
            {invoice.file_name || "Nombre de archivo no disponible"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Column: Missing Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                Análisis del Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missingFields.length > 0 ? (
                <>
                  <p className="mb-3 font-semibold text-foreground">
                    Se detectaron los siguientes campos faltantes o inválidos:
                  </p>
                  <ul className="space-y-2 list-disc pl-5 text-destructive">
                    {missingFields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No se detectaron campos obligatorios faltantes de forma automática. El error puede deberse a un formato de dato incorrecto o una condición inesperada.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Right Column: PDF Viewer */}
          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Visor de PDF</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        title={`Visor de PDF - ${invoice.file_name}`}
                        className="w-full h-full border rounded-md"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No se puede mostrar el PDF. URL no disponible.
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
