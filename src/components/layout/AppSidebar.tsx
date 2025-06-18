"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BarChart3, Settings, Users, Briefcase } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/common/AppLogo';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'; // Assuming sidebar is a ShadCN or custom component
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/projects', label: 'Projects', icon: Briefcase },
];

const settingsItem = { href: '/dashboard/settings', label: 'Settings', icon: Settings };


export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === 'collapsed';

  return (
    <Sidebar collapsible="icon" variant="sidebar" defaultOpen={true}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <AppLogo collapsed={collapsed} />
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={collapsed ? item.label : undefined}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-2">{item.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href={settingsItem.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(settingsItem.href)}
                  tooltip={collapsed ? settingsItem.label : undefined}
                  className="justify-start"
                >
                  <settingsItem.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-2">{settingsItem.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
