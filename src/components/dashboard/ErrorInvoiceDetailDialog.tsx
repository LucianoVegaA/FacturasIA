
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, AlertCircle, Loader2, Save, ExternalLink, AlertTriangle, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ErrorInvoice } from "@/lib/types";
import { providerData, allProviders } from "@/lib/providerData";
import { correctAndMoveInvoice } from "@/app/actions/updateErrorInvoice";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText } from "lucide-react";

interface ErrorInvoiceDetailDialogProps {
  invoice: ErrorInvoice | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  facturado_a: z.string().min(1, "El proveedor es obligatorio."),
  numero_factura: z.string().min(1, "El número de factura es obligatorio."),
  fecha_emision: z.date({ required_error: "La fecha de emisión es obligatoria." }),
  subtotal: z.coerce.number({ invalid_type_error: "El subtotal debe ser un número."}).positive("El subtotal debe ser positivo."),
  impuesto: z.coerce.number({ required_error: "Debe seleccionar un impuesto." }).min(0, "El impuesto no puede ser negativo."),
  descripcion: z.string().min(1, "La descripción es obligatoria."),
  // Hidden fields managed by provider selection
  porcentaje_staffing: z.number(),
  porcentaje_proyecto: z.number(),
  porcentaje_software: z.number(),
  numero_cuenta_bancaria: z.string(),
});

export function ErrorInvoiceDetailDialog({ invoice, isOpen, onOpenChange }: ErrorInvoiceDetailDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isProviderComboboxOpen, setIsProviderComboboxOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facturado_a: "",
      numero_factura: "",
      fecha_emision: new Date(),
      subtotal: 0,
      impuesto: 7, // Default to 7%
      descripcion: "",
      porcentaje_staffing: 0,
      porcentaje_proyecto: 0,
      porcentaje_software: 0,
      numero_cuenta_bancaria: "",
    },
  });

  React.useEffect(() => {
    if (invoice && isOpen) {
      // Adding 'T00:00:00' ensures the date is parsed in the local timezone, preventing off-by-one-day errors.
      const emissionDateStr = invoice.raw_data?.fecha_emision;
      const emissionDate = emissionDateStr ? new Date(`${emissionDateStr}T00:00:00`) : new Date();
      
      form.reset({
        facturado_a: invoice.raw_data?.facturado_a || "",
        numero_factura: invoice.raw_data?.numero_factura || "",
        fecha_emision: emissionDate,
        subtotal: invoice.raw_data?.total || 0, // Assuming old 'total' is the new 'subtotal'
        impuesto: 7,
        descripcion: invoice.raw_data?.descripcion || "",
        porcentaje_staffing: 0,
        porcentaje_proyecto: 0,
        porcentaje_software: 0,
        numero_cuenta_bancaria: "",
      });
    }
  }, [invoice, form, isOpen]);

  const watchedSubtotal = form.watch("subtotal");
  const watchedImpuesto = form.watch("impuesto");

  const calculatedTotal = React.useMemo(() => {
    const sub = Number(watchedSubtotal) || 0;
    const taxRate = Number(watchedImpuesto) || 0;
    return sub + (sub * (taxRate / 100));
  }, [watchedSubtotal, watchedImpuesto]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!invoice) return;
    setIsSaving(true);

    const total = calculatedTotal;
    const taxAmount = values.subtotal * (values.impuesto / 100);

    const correctedData = {
      ...values,
      fecha_emision: format(values.fecha_emision, 'yyyy-MM-dd'),
      total,
      subtotal: values.subtotal,
      impuesto: values.impuesto, // Keep rate for reference
      tax: taxAmount, // Add calculated tax amount
    };
    
    const result = await correctAndMoveInvoice(invoice._id, invoice.raw_data, correctedData);

    if (result.success) {
      toast({
        title: "Éxito",
        description: "La factura ha sido corregida y movida al registro principal.",
      });
      router.refresh();
      onOpenChange(false);
    } else {
      toast({
        title: "Error al Guardar",
        description: result.error || "No se pudo procesar la factura.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }
  
  if (!invoice) return null;

  const handleProviderChange = (providerName: string) => {
    const provider = allProviders.find(p => p.name === providerName);
    if (provider) {
        form.setValue('facturado_a', provider.name);
        form.setValue('porcentaje_staffing', provider.staffingPercentage);
        form.setValue('porcentaje_proyecto', provider.projectPercentage);
        form.setValue('porcentaje_software', provider.softwarePercentage);
        form.setValue('numero_cuenta_bancaria', provider.accountCode);
    }
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  Formulario de Corrección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="facturado_a"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Proveedor</FormLabel>
                        <Popover open={isProviderComboboxOpen} onOpenChange={setIsProviderComboboxOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? allProviders.find(
                                      (provider) => provider.name === field.value
                                    )?.name
                                  : "Seleccione un proveedor"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar proveedor..." />
                              <CommandEmpty>No se encontró el proveedor.</CommandEmpty>
                              <CommandList>
                                {providerData.map((category) => (
                                  <CommandGroup key={category.code} heading={category.name}>
                                    {category.providers.map((provider) => (
                                      <CommandItem
                                        key={provider.name}
                                        value={provider.name}
                                        onSelect={(value) => {
                                          form.setValue("facturado_a", value)
                                          handleProviderChange(value)
                                          setIsProviderComboboxOpen(false)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            provider.name === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {provider.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="fecha_emision"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Emisión</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccione una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="impuesto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impuesto</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el impuesto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="7">C1 = 7%</SelectItem>
                              <SelectItem value="10">C2 = 10%</SelectItem>
                              <SelectItem value="15">C3 = 15%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Ej: 1250.50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Total Calculado</FormLabel>
                    <FormControl>
                      <Input value={calculatedTotal.toFixed(2)} readOnly disabled className="bg-muted" />
                    </FormControl>
                  </FormItem>
                 </div>
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

            <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6 text-center">
              <CardHeader>
                  <CardTitle>Documento Original</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-4 flex-1">
                  {pdfUrl ? (
                      <>
                        <FileText className="h-20 w-20 text-primary/80" />
                        <p className="text-muted-foreground max-w-sm">
                          Haga clic en el botón para abrir el documento original en una nueva pestaña como referencia.
                        </p>
                        <Button
                            type="button"
                            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                            className="w-full"
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir PDF en Nueva Pestaña
                        </Button>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                          <AlertTriangle className="h-12 w-12 text-destructive" />
                          <p className="font-semibold">URL del PDF no disponible</p>
                          <p className="text-xs">No se puede mostrar el enlace al PDF.</p>
                      </div>
                  )}
              </CardContent>
            </Card>
            
            <DialogFooter className="col-span-1 lg:col-span-3 pt-4 border-t mt-auto">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Corregir y Procesar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
