"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, XCircle } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker"; // Assuming this exists or will be created
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceStatus } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";


export interface InvoiceFilters {
  searchTerm: string;
  status: InvoiceStatus | "all";
  // dateRange: { from?: Date; to?: Date }; // For DateRangePicker
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
    setFilters({ searchTerm: "", status: "all" });
  };

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="mr-2 h-5 w-5 text-primary" /> Filter Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
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

          {/* DateRangePicker Placeholder - Requires a separate component */}
          {/* <div>
            <Label>Date Range</Label>
            <DateRangePicker 
              date={filters.dateRange} 
              onDateChange={(range) => setFilters(prev => ({...prev, dateRange: range}))}
            />
          </div> */}
          
          <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal DateRangePicker for placeholder if shadcn/ui doesn't have one readily.
// This is typically a more complex component.
// For now, InvoiceFilter will not use date range.
// You would typically install `react-day-picker` and build this.
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (dateRange?: DateRange) => void;
}

function DateRangePicker({className, date, onDateChange}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
