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
  Tag,
  ChevronDown
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/dashboard/transactions", icon: Receipt },
  { name: "Contas e Cartões", href: "/dashboard/accounts", icon: CreditCard },
  { name: "Tipos de Conta", href: "/dashboard/account-types", icon: PiggyBank },
  { name: "Categorias", href: "/dashboard/categories", icon: Tag },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

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
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-900" />
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(prev => !prev)}
                className="flex items-center gap-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 p-1.5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
              >
                {user?.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || "Perfil"} 
                    className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-150 dark:bg-zinc-900 flex items-center justify-center font-semibold text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-850">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col min-w-0 pr-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[120px]">
                    {user?.name || "Usuário"}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                    {user?.email || ""}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-1.5 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900/50 mb-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{user?.name || "Usuário"}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email || ""}</p>
                    </div>
                    <Link 
                      href="/dashboard/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      Meu Perfil
                    </Link>
                    <Link 
                      href="/dashboard/billing"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Assinatura
                    </Link>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-900/50 my-1" />
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await signOut({ redirect: false });
                        window.location.href = "/";
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-650 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
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
