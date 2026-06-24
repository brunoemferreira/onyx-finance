"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  CreditCard, 
  LayoutDashboard, 
  Receipt, 
  Settings, 
  PiggyBank, 
  Menu,
  ChevronLast,
  LogOut,
  User as UserIcon,
  Tag
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/dashboard/transactions", icon: Receipt },
  { name: "Contas e Cartões", href: "/dashboard/accounts", icon: CreditCard },
  { name: "Categorias", href: "/dashboard/categories", icon: Tag },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const profileFooter = (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-col gap-3">
      <Link 
        href="/dashboard/profile" 
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-xl transition-colors group cursor-pointer"
      >
        {user?.image ? (
          <img 
            src={user.image} 
            alt={user.name || "Perfil"} 
            className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-semibold text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 break-words whitespace-normal group-hover:text-zinc-950 dark:group-hover:text-white">
            {user?.name || "Usuário"}
          </span>
          <span className="text-xs text-zinc-500 break-all whitespace-normal group-hover:text-zinc-400">
            {user?.email || "Ver Perfil"}
          </span>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-zinc-200 dark:border-zinc-900">
          <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <span className="text-white dark:text-black font-black text-xs">O</span>
          </div>
          <span className="font-bold tracking-tight text-md text-zinc-900 dark:text-zinc-50">Onyx<span className="font-light text-zinc-500">Finance</span></span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className={`mr-3 h-4 w-4 transition-colors ${
                  isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        {profileFooter}
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile drawer */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex flex-col transform transition-transform duration-300 md:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <span className="text-white dark:text-black font-black text-xs">O</span>
            </div>
            <span className="font-bold tracking-tight text-md text-zinc-900 dark:text-zinc-50">Onyx<span className="font-light text-zinc-500">Finance</span></span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <ChevronLast className="h-5 w-5 rotate-180" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer Mobile */}
        {profileFooter}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/dashboard/billing">
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                title="Assinatura"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Assinatura</span>
              </Button>
            </Link>
            <ThemeToggle />
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-900" />
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = "/";
              }}
              className="border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              title="Sair"
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </header>

        {/* Content wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
