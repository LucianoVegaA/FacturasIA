import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
