"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth-reset";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await requestPasswordReset(email);
      if (res?.success) {
        setSubmitted(true);
        toast.success("Solicitação processada com sucesso!");
      } else {
        toast.error(res?.error || "Ocorreu um erro ao processar a solicitação.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.8),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(39,39,42,0.6),transparent_50%)]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-zinc-800/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-zinc-900/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-xl shadow-black/25 mb-4 border border-zinc-700/50">
            <span className="text-black font-black text-xl">O</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Onyx<span className="font-light text-zinc-400">Finance</span></h2>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-zinc-100">Recuperar Senha</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Insira o e-mail associado à sua conta para receber o link de redefinição.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 py-3 text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                ) : (
                  <span>Enviar link de recuperação</span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300">
                Se o e-mail estiver cadastrado com uma senha local, você receberá uma mensagem para redefini-la em instantes.
              </div>
              <p className="text-xs text-zinc-500">
                Dica: Verifique a caixa de entrada ou os logs do console do Docker no ambiente de testes.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800/60 flex justify-center">
            <Link href="/login" className="flex items-center text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
