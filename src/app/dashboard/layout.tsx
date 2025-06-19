
import { Header } from '@/components/layout/Header';
import { DashboardGuard } from '@/components/auth/DashboardGuard'; // Changed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard> {/* Changed */}
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8"> {/* Ensure flex-col for main content area */}
          {children}
        </main>
      </div>
    </DashboardGuard> {/* Changed */}
  );
}
