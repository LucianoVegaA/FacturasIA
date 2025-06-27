
import { Header } from '@/components/layout/Header';
import { DashboardGuard } from '@/components/auth/DashboardGuard';
import AuthRedirect from '../auth/redirect/page';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <><AuthRedirect></AuthRedirect><DashboardGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8"> {/* Ensure flex-col for main content area */}
          {children}
        </main>
      </div>
    </DashboardGuard></>
  );
}
