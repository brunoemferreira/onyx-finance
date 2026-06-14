"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (provider: "google" | "github" | "credentials") => {
    try {
      setLoadingProvider(provider);
      if (provider === "credentials") {
        await signIn("credentials", {
          email: "demo@onyx.finance",
          name: "Usuário Demo",
          callbackUrl: "/dashboard",
        });
      } else {
        await signIn(provider, { callbackUrl: "/dashboard" });
      }
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      setLoadingProvider(null);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500 font-medium">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.8),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(39,39,42,0.6),transparent_50%)]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-zinc-800/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-zinc-900/20 blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-xl shadow-black/25 mb-4 border border-zinc-700/50">
            <span className="text-black font-black text-xl">O</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Onyx<span className="font-light text-zinc-400">Finance</span></h2>
          <p className="mt-2 text-sm text-zinc-500">Gestão financeira pessoal de alta performance</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-zinc-100">Seja bem-vindo</h3>
            <p className="text-xs text-zinc-500 mt-1">Conecte sua conta para acessar o painel de controle</p>
          </div>

          <div className="space-y-4">
            {/* Google Login Button */}
            <button
              onClick={() => handleLogin("google")}
              disabled={loadingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/80 hover:text-zinc-50 hover:border-zinc-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loadingProvider === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>Entrar com o Google</span>
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={() => handleLogin("github")}
              disabled={loadingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/80 hover:text-zinc-50 hover:border-zinc-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loadingProvider === "github" ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              )}
              <span>Entrar com o GitHub</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-[#111113] px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Desenvolvimento</span>
            </div>

            {/* Credentials / Demo Login Button */}
            <button
              onClick={() => handleLogin("credentials")}
              disabled={loadingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900/60 hover:text-zinc-50 hover:border-zinc-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loadingProvider === "credentials" ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span>Acessar Modo Demonstração</span>
            </button>
          </div>

          <div className="mt-8 border-t border-zinc-800/60 pt-6 text-center">
            <p className="text-xs text-zinc-600">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
