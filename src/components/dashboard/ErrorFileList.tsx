
"use client";

import * as React from "react";
import type { SimpleErrorFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdfViewerDialog } from "./PdfViewerDialog";

interface ErrorFileListProps {
  errorFiles: SimpleErrorFile[];
}

export function ErrorFileList({ errorFiles }: ErrorFileListProps) {
  const [selectedPdf, setSelectedPdf] = React.useState<{ url: string; name: string } | null>(null);

  const filesWithNames = errorFiles.filter(file => file.file_name && file.file_name.trim() !== "");

  if (!filesWithNames || filesWithNames.length === 0) {
    return null;
  }

  const handleFileClick = (file: SimpleErrorFile) => {
    if (file.pdf_url && file.file_name) {
      setSelectedPdf({ url: file.pdf_url, name: file.file_name });
    }
  };

  const FileItem = ({ file }: { file: SimpleErrorFile }) => {
    const hasPdf = !!file.pdf_url;
    // Use a button for clickable items for accessibility, otherwise use a div.
    const Component = hasPdf ? 'button' : 'div';
    const props = hasPdf ? { onClick: () => handleFileClick(file), "aria-label": `Ver PDF de ${file.file_name}` } : {};

    return (
      <Component
        {...props}
        key={file._id}
        className={cn(
          "flex-shrink-0 w-40 h-32 rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5 flex flex-col items-center justify-center text-center p-2 overflow-hidden",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
           hasPdf && "hover:border-primary hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
        )}
      >
        <FileText className="h-6 w-6 mb-2 text-destructive flex-shrink-0" />
        <p className="text-xs font-medium text-destructive-foreground break-words w-full">
          {file.file_name}
        </p>
      </Component>
    );
  };

  return (
    <>
      <PdfViewerDialog
        isOpen={!!selectedPdf}
        onOpenChange={(isOpen) => { if (!isOpen) setSelectedPdf(null); }}
        pdfUrl={selectedPdf?.url || ""}
        fileName={selectedPdf?.name || ""}
      />
      <Card className="mb-6 shadow-md border-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-destructive">
            <FileWarning className="mr-2 h-5 w-5" /> Archivos con Errores de Procesamiento
          </CardTitle>
          <CardDescription>
            Los siguientes archivos no pudieron ser procesados. Haga clic en ellos para ver el PDF.
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
