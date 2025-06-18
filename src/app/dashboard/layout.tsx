
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add authentication check here in a real app.
  // For example:
  // const user = await getCurrentUser(); // from lib/authService
  // if (!user) { redirect('/'); }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
