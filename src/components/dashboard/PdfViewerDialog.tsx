"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PdfViewerDialogProps {
  pdfUrl: string;
  fileName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PdfViewerDialog({ pdfUrl, fileName, isOpen, onOpenChange }: PdfViewerDialogProps) {
  if (!pdfUrl) return null;

  // Use Google Docs viewer to embed the PDF. This improves cross-browser compatibility and helps avoid CORS issues.
  // The provided pdfUrl must be publicly accessible on the internet for this to work.
  const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b flex flex-row items-start text-left">
            <div className="space-y-1.5">
                <DialogTitle className="text-lg">Visor de PDF</DialogTitle>
                <DialogDescription>{fileName}</DialogDescription>
            </div>
          </DialogHeader>
        <div className="flex-1 overflow-hidden">
            <iframe
            src={embedUrl}
            title={`PDF Viewer - ${fileName}`}
            className="w-full h-full border-0"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
