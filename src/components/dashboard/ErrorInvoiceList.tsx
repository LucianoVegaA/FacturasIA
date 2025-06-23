
"use client";

import * as React from "react";
import type { SimpleErrorFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { fetchPdfAsBase64 } from "@/app/actions/fetchPdfProxy";
import { Button } from "../ui/button";

interface ErrorFileListProps {
  errorFiles: SimpleErrorFile[];
}

export function ErrorFileList({ errorFiles }: ErrorFileListProps) {
  const [isDownloading, setIsDownloading] = React.useState<string | null>(null);
  const { toast } = useToast();

  const filesWithNames = errorFiles.filter(file => file.file_name && file.file_name.trim() !== "");

  if (!filesWithNames || filesWithNames.length === 0) {
    return null;
  }

  const handleDownloadClick = async (file: SimpleErrorFile) => {
    if (!file.pdf_url || !file.file_name) return;

    setIsDownloading(file._id);
    try {
        const result = await fetchPdfAsBase64(file.pdf_url);
        if (!result.success || !result.data) {
            throw new Error(result.error || "No se pudieron obtener los datos del PDF.");
        }
        
        const safeFileName = file.file_name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
        
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.contentType || 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = safeFileName.endsWith('.pdf') ? safeFileName : `${safeFileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error: any) {
        toast({
            title: "Error de Descarga",
            description: error.message || "No se pudo descargar el PDF.",
            variant: "destructive",
        });
    } finally {
        setIsDownloading(null);
    }
  };

  const FileItem = ({ file }: { file: SimpleErrorFile }) => {
    const hasPdf = !!file.pdf_url;
    const isCurrentlyDownloading = isDownloading === file._id;

    return (
      <div
        key={file._id}
        className={cn(
          "flex-shrink-0 w-64 h-auto rounded-md border bg-card flex flex-row items-center text-left p-2.5 gap-3 overflow-hidden",
          !hasPdf && "opacity-50"
        )}
      >
        <FileText className="h-5 w-5 text-destructive flex-shrink-0" />
        <p className="text-sm font-medium text-foreground truncate flex-grow">
          {file.file_name}
        </p>
        {hasPdf && (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownloadClick(file)}
                disabled={isCurrentlyDownloading}
                className="ml-auto p-1 text-primary hover:bg-accent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Descargar PDF de ${file.file_name}`}
            >
                {isCurrentlyDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            </Button>
        )}
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
            Los siguientes archivos no pudieron ser procesados. Haga clic en el icono para descargarlos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto p-2 -m-2">
              {filesWithNames.map((file) => (
                <FileItem key={file._id} file={file} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
