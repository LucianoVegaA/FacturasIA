"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { ErrorInvoice } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { updateErrorInvoiceInDB } from "@/app/actions/updateErrorInvoice";

interface ErrorInvoiceDetailDialogProps {
  invoice: ErrorInvoice | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  facturado_a: z.string().min(1, "El cliente es obligatorio."),
  numero_factura: z.string().min(1, "El número de factura es obligatorio."),
  fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato debe ser YYYY-MM-DD." }),
  total: z.coerce.number({ invalid_type_error: "El total debe ser un número."}).positive("El total debe ser positivo."),
  descripcion: z.string().min(1, "La descripción es obligatoria."),
});

export function ErrorInvoiceDetailDialog({
  invoice,
  isOpen,
  onOpenChange,
}: ErrorInvoiceDetailDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facturado_a: "",
      numero_factura: "",
      fecha_emision: "",
      total: 0,
      descripcion: "",
    },
  });
  
  React.useEffect(() => {
    if (invoice && isOpen) {
      form.reset({
        facturado_a: invoice.raw_data?.facturado_a || "",
        numero_factura: invoice.raw_data?.numero_factura || "",
        fecha_emision: invoice.raw_data?.fecha_emision || "",
        total: invoice.raw_data?.total || 0,
        descripcion: invoice.raw_data?.descripcion || "",
      });
    }
  }, [invoice, form, isOpen]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!invoice) return;
    setIsSaving(true);
    
    const result = await updateErrorInvoiceInDB(invoice._id, values);

    if (result.success) {
      toast({
        title: "Éxito",
        description: "La factura ha sido actualizada. La información se refrescará.",
      });
      router.refresh();
      onOpenChange(false);
    } else {
      toast({
        title: "Error al Guardar",
        description: result.error || "No se pudo actualizar la factura en la base de datos.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }
  
  if (!invoice) {
    return null;
  }

  const pdfUrl = process.env.NEXT_PUBLIC_SHAREPOINT_ERROR_PDF_BASE_URL && invoice.file_name
    ? `${process.env.NEXT_PUBLIC_SHAREPOINT_ERROR_PDF_BASE_URL}/${invoice.file_name}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle>Corregir Factura con Error</DialogTitle>
          <DialogDescription>
            Edite los campos necesarios y guarde los cambios. Archivo: {invoice.file_name || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Left Column: Editable Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  Formulario de Corrección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="facturado_a"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facturado A (Cliente)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numero_factura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Factura</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: INV-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="fecha_emision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Emisión</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej: 1250.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción general de la factura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
            
            <DialogFooter className="col-span-1 lg:col-span-2 pt-4 border-t mt-auto">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
