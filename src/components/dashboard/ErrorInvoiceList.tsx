
"use client";

import type { SimpleErrorFile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileWarning, FileText } from "lucide-react"; // Using FileWarning

interface ErrorFileListProps {
  errorFiles: SimpleErrorFile[];
}

export function ErrorFileList({ errorFiles }: ErrorFileListProps) {
  const filesWithNames = errorFiles.filter(file => file.file_name && file.file_name.trim() !== "");

  if (!filesWithNames || filesWithNames.length === 0) {
    return null; // Don't render anything if no error files with names
  }

  return (
    <Card className="mb-6 shadow-md border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg text-destructive">
          <FileWarning className="mr-2 h-5 w-5" /> Archivos con Errores de Procesamiento
        </CardTitle>
        <CardDescription>
          Los siguientes archivos no pudieron ser procesados correctamente y requieren atención.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-36 max-h-[150px] rounded-md border p-3">
          {filesWithNames.length > 0 ? (
            <ul className="space-y-2">
              {filesWithNames.map((file) => (
                <li 
                  key={file._id} 
                  className="p-2 rounded-md border border-dashed border-destructive/50 bg-destructive/5 hover:bg-destructive/10 transition-colors text-sm text-destructive-foreground"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-destructive" />
                    <span>{file.file_name}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // This case should ideally not be reached due to the filter above,
            // but kept as a fallback.
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay archivos con errores.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
