
"use client";

import type { Dispatch, SetStateAction } from "react";
import { Search, Filter, XCircle, CalendarDays } from "lucide-react";

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
// Removed DateRangePicker import as it's not used for this simplified version

export interface InvoiceFilters {
  month: string; // "all" or "YYYY-MM"
  provedor: string;
}

interface InvoiceFilterProps {
  filters: InvoiceFilters;
  setFilters: Dispatch<SetStateAction<InvoiceFilters>>;
  availableMonths: string[];
}

export function InvoiceFilter({ filters, setFilters, availableMonths }: InvoiceFilterProps) {

  const handleProvedorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, provedor: event.target.value }));
  };

  const handleMonthChange = (value: string) => {
    setFilters(prev => ({ ...prev, month: value }));
  };
  
  const clearFilters = () => {
    setFilters({ month: "all", provedor: "" });
  };

  const formatMonthForDisplay = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="mr-2 h-5 w-5 text-primary" /> Filter Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Provedor (Client)..."
              value={filters.provedor}
              onChange={handleProvedorChange}
              className="pl-8"
            />
          </div>
          
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select value={filters.month} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full pl-8">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {formatMonthForDisplay(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
