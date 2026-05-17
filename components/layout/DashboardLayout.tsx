"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import {
  LayoutDashboard,
  User,
  FileText,
  LogOut,
  Menu,
  X,
  Github,
  ArrowRight,
  Briefcase
} from "lucide-react";
import GitHubIcon from "@/components/ui/GitHubIcon";
import { useState } from "react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/resume", label: "BUILDER", icon: FileText },
  { href: "/github", label: "GITHUB", icon: GitHubIcon },
  { href: "/dashboard/jobs", label: "JOB FINDER", icon: Briefcase },
  { href: "/profile", label: "PROFILE", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 font-sans antialiased selection:bg-ordr-accent/10">
      <div className="flex">
        {/* Sidebar - Enhanced with better hierarchy and active states */}
        <aside
          className={clsx(
            "fixed left-0 top-0 bottom-0 z-40 w-72 h-screen transition-all duration-700 lg:translate-x-0 bg-white border-r border-zinc-100/80 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-full flex flex-col justify-between py-12">
            <div className="px-12 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-ordr-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-ordr-accent/20">
                  R
                </div>
                <span className="font-ordr-serif text-xl tracking-tight">Rezumy</span>
              </div>
            </div>

            <nav className="flex-1 px-6">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30 px-6 mb-6">Main Menu</p>
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        "flex items-center gap-4 px-6 py-3.5 rounded-xl text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-500 group relative overflow-hidden",
                        isActive
                          ? "text-ordr-accent bg-ordr-accent/[0.04]"
                          : "text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50"
                      )}
                    >
                      <item.icon size={16} className={clsx("transition-transform duration-500 group-hover:scale-110", isActive ? "text-ordr-accent" : "text-zinc-300 group-hover:text-zinc-500")} />
                      {item.label}
                      {isActive && (
                        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-ordr-accent rounded-l-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="px-12 pt-8">
              <div className="h-[1px] bg-zinc-50 w-full mb-8" />
              <button
                onClick={logout}
                className="flex items-center gap-4 w-full text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-ordr-accent transition-all duration-500 group"
              >
                <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-ordr-accent/5 transition-colors">
                  <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Refined background and layout */}
        <main className="flex-1 lg:pl-72 transition-all duration-500">
          <div className={clsx(
            "mx-auto w-full max-w-[1440px] transition-all duration-700",
            pathname === "/resume"
              ? "px-0"
              : "px-12 py-12"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/10 backdrop-blur-[2px] z-30 lg:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
