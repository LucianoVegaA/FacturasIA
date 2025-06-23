"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface PdfViewerDialogProps {
  pdfUrl: string;
  fileName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PdfViewerDialog({ pdfUrl, fileName, isOpen, onOpenChange }: PdfViewerDialogProps) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Ref to hold the current object URL to allow cleanup to access it without being in the dependency array
  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // When the dialog is closed, or a new PDF is being opened, revoke the old object URL to prevent memory leaks.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setObjectUrl(null); // Clear the display URL
    
    if (isOpen && pdfUrl) {
      setIsLoading(true);
      setError(null);

      const fetchPdfAsBlob = async () => {
        try {
          const response = await fetch(pdfUrl);
          if (!response.ok) {
            throw new Error(`Error al cargar el PDF: ${response.statusText} (Código: ${response.status})`);
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setObjectUrl(url);
        } catch (err: any) {
          console.error("PDF Fetch Error:", err);
          setError(err.message || "No se pudo cargar el PDF. Verifique la URL y los permisos de CORS.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPdfAsBlob();
    }
    
    // The main cleanup function that runs when the component unmounts.
    return () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    };
  }, [isOpen, pdfUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b flex flex-row items-start text-left">
            <div className="space-y-1.5">
                <DialogTitle className="text-lg">Visor de PDF</DialogTitle>
                <DialogDescription>{fileName}</DialogDescription>
            </div>
          </DialogHeader>
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/20">
            {isLoading && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Cargando PDF...</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
                    <AlertTriangle className="h-8 w-8" />
                    <p className="font-semibold">Error al Cargar el PDF</p>
                    <p className="text-xs">{error}</p>
                </div>
            )}
            {!isLoading && !error && objectUrl && (
                <iframe
                    src={objectUrl}
                    title={`PDF Viewer - ${fileName}`}
                    className="w-full h-full border-0"
                />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
