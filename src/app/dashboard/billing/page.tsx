"use client";

import { useEffect, useState } from "react";
import { getUserSubscription, createCheckoutSession, createPortalSession } from "@/app/actions/stripe";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, AlertCircle } from "lucide-react";

type Subscription = {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: string;
  currentPeriodEnd: Date | null;
  isActive: boolean;
} | null;

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadSub() {
      try {
        const data = await getUserSubscription();
        setSub(data as Subscription);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSub();
  }, []);

  const handleCheckout = async () => {
    setActionLoading(true);
    try {
      const res = await createCheckoutSession();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível iniciar o checkout.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePortal = async () => {
    setActionLoading(true);
    try {
      const res = await createPortalSession();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível abrir o portal de faturamento.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">Carregando dados de cobrança...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Assinatura & Planos</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie seu plano de assinatura e faturamento na Onyx Finance.</p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold">Plano Atual</CardTitle>
              <CardDescription>
                {sub?.isActive ? "Assinatura ativa e renovando." : "Você está usando a versão gratuita limitada."}
              </CardDescription>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              sub?.isActive 
                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100" 
                : "bg-zinc-200/50 dark:bg-zinc-900/50 text-zinc-500"
            }`}>
              {sub?.isActive ? "Premium" : "Básico"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sub?.isActive && sub.currentPeriodEnd && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              Sua assinatura renova em: <strong className="text-zinc-800 dark:text-zinc-200">{new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}</strong>
            </div>
          )}

          {!sub?.isActive && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900">
              <AlertCircle className="h-4 w-4" />
              Limites ativos: Máximo de 2 contas/cartões e 50 transações por mês.
            </div>
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Vantagens do Plano Premium:</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Zap className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                Contas e Cartões Ilimitados
              </li>
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Zap className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                Transações Ilimitadas (sem restrição mensal)
              </li>
              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Zap className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                Lançamentos Parcelados e Recorrências Automáticas
              </li>

              <li className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Zap className="h-4 w-4 text-zinc-900 dark:text-zinc-50" />
                Exportação de dados completa em CSV/OFX
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/20 border-t border-zinc-200 dark:border-zinc-900 p-6 flex justify-between items-center">
          <div>
            {!sub?.isActive && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">R$ 19,90</span>
                <span className="text-xs text-zinc-500">/mês</span>
              </div>
            )}
          </div>

          {sub?.isActive ? (
            <Button 
              onClick={handlePortal} 
              disabled={actionLoading}
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {actionLoading ? "Redirecionando..." : "Gerenciar Assinatura"}
            </Button>
          ) : (
            <Button 
              onClick={handleCheckout} 
              disabled={actionLoading}
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {actionLoading ? "Carregando..." : "Upgrade para Premium"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
