
"use client";

import type { Dispatch, SetStateAction } from "react";
import type { DateRange } from "react-day-picker"; // Import DateRange for the interface
import { Search, Filter, XCircle } from "lucide-react";

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
import { Label } from "@/components/ui/label"; // For potential use in commented out section
import { DateRangePicker } from "@/components/ui/date-range-picker"; // Import the separate component
import type { InvoiceStatus } from "@/lib/types";

export interface InvoiceFilters {
  searchTerm: string;
  status: InvoiceStatus | "all";
  dateRange?: DateRange; // Use the imported DateRange type
}

interface InvoiceFilterProps {
  filters: InvoiceFilters;
  setFilters: Dispatch<SetStateAction<InvoiceFilters>>;
}

export function InvoiceFilter({ filters, setFilters }: InvoiceFilterProps) {

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as InvoiceStatus | "all" }));
  };
  
  const clearFilters = () => {
    setFilters({ searchTerm: "", status: "all", dateRange: undefined }); // Clear dateRange as well
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="mr-2 h-5 w-5 text-primary" /> Filter Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Invoice # or Client..."
              value={filters.searchTerm}
              onChange={handleSearchTermChange}
              className="pl-8"
            />
          </div>
          
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* DateRangePicker section - currently commented out but imports are ready */}
          {/* 
          <div>
            <Label htmlFor="invoice-date-range">Date Range</Label>
            <DateRangePicker
              // id="invoice-date-range" // Pass id if Label htmlFor is used
              date={filters.dateRange}
              onDateChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
            />
          </div> 
          */}
          
          <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto md:col-start-3 lg:col-start-4">
            <XCircle className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
