"use client"

import * as React from "react"
import { Bar, BarChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Invoice } from "@/lib/types"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface InvoiceMetricsChartProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
}

const COLORS_CATEGORIES = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))']; // For pie chart

export function InvoiceMetricsChart({ invoices, selectedInvoice }: InvoiceMetricsChartProps) {
  const totalsByClientChartData = React.useMemo(() => {
    const dataMap = new Map<string, number>();
    invoices.forEach(inv => {
      dataMap.set(inv.billed_to, (dataMap.get(inv.billed_to) || 0) + inv.total);
    });
    return Array.from(dataMap.entries()).map(([client, total]) => ({ client, total }));
  }, [invoices]);

  const totalsByClientChartConfig = {
    total: {
      label: "Total Amount",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  const expenseDistributionChartData = React.useMemo(() => {
    if (!selectedInvoice) return [];
    return [
      { name: "Software", value: selectedInvoice.software_percentage, fill: COLORS_CATEGORIES[0] },
      { name: "Project", value: selectedInvoice.proyecto_percentage, fill: COLORS_CATEGORIES[1] },
      { name: "Staffing", value: selectedInvoice.staffing_percentage, fill: COLORS_CATEGORIES[2] },
    ].filter(item => item.value > 0);
  }, [selectedInvoice]);

 const expenseDistributionChartConfig = {
    value: { label: "Percentage" },
    Software: { label: "Software", color: "hsl(var(--chart-1))" },
    Project: { label: "Project", color: "hsl(var(--chart-2))" },
    Staffing: { label: "Staffing", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Total Invoiced by Client</CardTitle>
          <CardDescription>Overview of total amounts billed to each client.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalsByClientChartData.length > 0 ? (
            <ChartContainer config={totalsByClientChartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={totalsByClientChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="client" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">No data available for this chart.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Expense Distribution</CardTitle>
          <CardDescription>
            {selectedInvoice ? `For Invoice #${selectedInvoice.invoice_number}` : "Select an invoice to see distribution."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedInvoice && expenseDistributionChartData.length > 0 ? (
             <ChartContainer config={expenseDistributionChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart accessibilityLayer>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={expenseDistributionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cy + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cy ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                    }}
                  >
                    {expenseDistributionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm">
                      {payload?.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.value}
                        </div>
                      ))}
                    </div>
                  )} />
                </PieChart>
              </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              {selectedInvoice ? "No expense distribution data for this invoice." : "Select an invoice to view its expense distribution."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
