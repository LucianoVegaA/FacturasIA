
"use client";

import * as React from "react";
import type { ErrorInvoice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ErrorInvoiceDetailDialog } from "./ErrorInvoiceDetailDialog";

interface ErrorFileListProps {
  errorFiles: ErrorInvoice[];
  onDataRefresh: () => void;
}

export function ErrorFileList({ errorFiles, onDataRefresh }: ErrorFileListProps) {
  const [selectedInvoice, setSelectedInvoice] = React.useState<ErrorInvoice | null>(null);

  if (!errorFiles || errorFiles.length === 0) {
    return null;
  }

  const handleDownloadClick = (file: ErrorInvoice) => {
    const baseUrl = "https://newhnl-my.sharepoint.com/personal/lvega_hypernovalabs_com/Documents/Facturas_Con_Errorr";
    if (file.file_name) {
      const pdfUrl = `${baseUrl}/${file.file_name}`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.error("El nombre del archivo no está disponible para este archivo con error.");
    }
  };

  const FileItem = ({ file }: { file: ErrorInvoice }) => {
    const canDownload = !!file.file_name;
    const displayName = file.file_name || `ID de Error: ${file._id.slice(-6)}`;

    return (
      <div
        key={file._id}
        className={cn(
          "flex-shrink-0 w-64 h-auto rounded-md border bg-card flex flex-row items-center text-left p-2.5 gap-3 overflow-hidden"
        )}
      >
        <FileText className="h-5 w-5 text-destructive flex-shrink-0" />
        <button
          onClick={() => setSelectedInvoice(file)}
          className="text-sm font-medium text-foreground truncate flex-grow text-left hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
          aria-label={`Ver detalles de ${displayName}`}
        >
          {displayName}
        </button>
        
        <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleDownloadClick(file); }}
            disabled={!canDownload}
            className="ml-auto flex-shrink-0 p-1 text-primary hover:bg-accent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Descargar PDF de ${file.file_name || 'archivo con error'}`}
        >
            <Download className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card className="mb-6 shadow-md border-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-destructive">
            <FileWarning className="mr-2 h-5 w-5" /> Archivos con Errores de Procesamiento
          </CardTitle>
          <CardDescription>
            Haz clic en el nombre del archivo para ver los detalles del error o en el icono para descargarlo.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto p-2 -m-2">
              {errorFiles.map((file) => (
                <FileItem key={file._id} file={file} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <ErrorInvoiceDetailDialog
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInvoice(null);
          }
        }}
        onSuccess={onDataRefresh}
      />
    </>
  );
}
