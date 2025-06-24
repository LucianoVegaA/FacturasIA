
import * as React from "react";
import { InvoiceDashboardClient } from "@/components/dashboard/InvoiceDashboardClient";

// This page now simply acts as a container for the client component
// that handles its own data fetching based on auth state.
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <InvoiceDashboardClient />
    </div>
  );
}
