"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Menu,
  Settings,
  Activity,
  UserLock,
  Users,
  Video,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: {
    href: string;
    icon: string;
    label: string;
  }[];
}

const iconMap: Record<string, React.ElementType> = {
  Menu,
  Settings,
  Activity,
  UserLock,
  Users,
  Video,
  Shield,
};

export default function DashboardLayoutClient({
  children,
  navItems,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}

      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <span className="font-medium">Settings</span>
        <Button
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}

        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${isSidebarOpen ? "block" : "hidden"} lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`shadow-none my-1 w-full justify-start cursor-pointer ${
                      pathname === item.href ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2 text-gray-700" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
