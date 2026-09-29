import { useState, type ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar mobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
