
"use client";

import type { Dispatch, SetStateAction } from "react";
import { Search, Filter, XCircle, CalendarDays, ListFilter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface InvoiceFilters {
  month: string; // "all" or "YYYY-MM"
  searchTerm: string;
  accountNumber: string; // "all" or specific account number
}

interface InvoiceFilterProps {
  filters: InvoiceFilters;
  setFilters: Dispatch<SetStateAction<InvoiceFilters>>;
  availableMonths: string[];
  availableAccountNumbers: string[];
}

export function InvoiceFilter({ 
  filters, 
  setFilters, 
  availableMonths, 
  availableAccountNumbers
}: InvoiceFilterProps) {

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleMonthChange = (value: string) => {
    setFilters(prev => ({ ...prev, month: value }));
  };

  const handleAccountNumberChange = (value: string) => {
    setFilters(prev => ({ ...prev, accountNumber: value }));
  };
  
  const clearFilters = () => {
    setFilters({ month: "all", searchTerm: "", accountNumber: "all" });
  };

  const formatMonthForDisplay = (monthYear: string) => {
    if (monthYear === "all") return "Todos los Meses";
    const [year, month] = monthYear.split('-');
    // Ensure month is parsed correctly for Date constructor (0-indexed)
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="mr-2 h-5 w-5 text-primary" /> Filtrar Facturas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Column 1: Search and Month */}
          <div className="space-y-4">
            {/* Search by Client or Invoice # */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Cliente o N° de Factura..."
                value={filters.searchTerm}
                onChange={handleSearchTermChange}
                className="pl-8 w-full"
              />
            </div>
            
            {/* Filter by Month */}
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={filters.month} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-full pl-8">
                  <SelectValue placeholder="Filtrar por mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonthForDisplay(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 2: Account and Clear Button */}
          <div className="space-y-4">
            {/* Filter by Account Number */}
            <div className="relative">
              <ListFilter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={filters.accountNumber} onValueChange={handleAccountNumberChange}>
                <SelectTrigger className="w-full pl-8">
                  <SelectValue placeholder="Filtrar por N° de Cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Cuentas</SelectItem>
                  {availableAccountNumbers.map(accNum => (
                    <SelectItem key={accNum} value={accNum}>
                      {accNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
