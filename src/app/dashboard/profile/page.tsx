"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" />
      </div>
    );
  }

  // Fallback if not authenticated yet middleware redirect handles this, but safe fallback
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-zinc-500">Por favor, faça login para ver seu perfil.</p>
        <Link href="/login">
          <Button>Ir para o Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Meu Perfil</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie e visualize suas informações de conta.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Status */}
        <div className="md:col-span-1 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 flex flex-col items-center text-center justify-between">
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="relative group">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Foto de perfil"}
                  className="h-24 w-24 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-3xl text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-zinc-800">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="space-y-1 w-full px-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 break-words whitespace-normal max-w-full">{user.name || "Usuário"}</h3>
              <p className="text-xs text-zinc-500 break-all whitespace-normal max-w-full">{user.email}</p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              <Shield className="h-3 w-3" />
              Plano Básico
            </span>
          </div>

          <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6">
            <Link href="/dashboard/billing">
              <Button className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Card: Details Form */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3">Detalhes da Conta</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Nome Completo
              </label>
              <input
                type="text"
                readOnly
                value={user.name || "Não informado"}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                E-mail
              </label>
              <input
                type="email"
                readOnly
                value={user.email || ""}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Membro Desde
              </label>
              <input
                type="text"
                readOnly
                value={new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Status do Perfil
              </label>
              <div className="flex items-center gap-1.5 h-9 px-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Verificado</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Perfil sincronizado via provedor OAuth de autenticação.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
