
"use client";

import * as React from "react";
import type { SimpleErrorFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface ErrorFileListProps {
  errorFiles: SimpleErrorFile[];
}

export function ErrorFileList({ errorFiles }: ErrorFileListProps) {
  const filesWithNames = errorFiles.filter(file => file.file_name && file.file_name.trim() !== "");

  if (!filesWithNames || filesWithNames.length === 0) {
    return null;
  }

  const handleDownloadClick = (file: SimpleErrorFile) => {
    if (file.pdf_url) {
      window.open(file.pdf_url, '_blank', 'noopener,noreferrer');
    }
  };

  const FileItem = ({ file }: { file: SimpleErrorFile }) => {
    const hasPdf = !!file.pdf_url;

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
                className="ml-auto p-1 text-primary hover:bg-accent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Descargar PDF de ${file.file_name}`}
            >
                <Download className="h-5 w-5" />
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
