
"use client";

import type { SimpleErrorFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileWarning, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorFileListProps {
  errorFiles: SimpleErrorFile[];
}

export function ErrorFileList({ errorFiles }: ErrorFileListProps) {
  const filesWithNames = errorFiles.filter(file => file.file_name && file.file_name.trim() !== "");

  if (!filesWithNames || filesWithNames.length === 0) {
    return null;
  }

  const FileItem = ({ file }: { file: SimpleErrorFile }) => {
    const content = (
      <div className="flex flex-col items-center justify-center text-center p-4 h-full w-full overflow-hidden">
        <FileText className="h-8 w-8 mb-2 text-destructive flex-shrink-0" />
        <p className="text-sm font-medium text-destructive-foreground break-words w-full">
          {file.file_name}
        </p>
        {file.pdf_url && (
          <div className="mt-auto flex items-center text-xs text-primary/80">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span>Abrir PDF</span>
          </div>
        )}
      </div>
    );

    if (file.pdf_url) {
      return (
        <Link
          href={file.pdf_url}
          key={file._id}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block flex-shrink-0 w-48 h-40 rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5",
            "hover:border-primary hover:bg-primary/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        key={file._id}
        className="flex-shrink-0 w-48 h-40 rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5 flex items-center justify-center"
      >
        {content}
      </div>
    );
  };

  return (
    <Card className="mb-6 shadow-md border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg text-destructive">
          <FileWarning className="mr-2 h-5 w-5" /> Archivos con Errores de Procesamiento
        </CardTitle>
        <CardDescription>
          Los siguientes archivos no pudieron ser procesados. Haga clic en ellos para ver el PDF si está disponible.
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
  );
}
