"use client";

import { useEffect, useState } from "react";
import { getBankAccounts } from "@/app/actions/accounts";
import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { toggleTransactionClear } from "@/app/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowRight,
  PiggyBank,
  Check,
  Undo2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from "lucide-react";
import BankLogo from "@/components/BankLogo";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const formatDate = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export default function Dashboard() {
  const formatBRL = (num: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [accs, txs, cats] = await Promise.all([getBankAccounts(), getTransactions(), getCategories()]);
      setAccounts(accs);
      setTransactions(txs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusToggle = async (id: string) => {
    try {
      setLoading(true);
      await toggleTransactionClear(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 1. Saldo Geral (Soma de contas checking, savings, investment, cash)
  const totalBalance = accounts
    .filter(a => a.type !== "credit_card")
    .reduce((sum, a) => sum + parseFloat(a.initialBalance), 0);

  // 2. Receitas Efetivadas (Soma de transações type === 'income' no mês atual que estão liquidadas)
  const totalIncome = transactions
    .filter(t => t.type === "income" && t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Receitas Pendentes (Soma de transações type === 'income' no mês atual em aberto)
  const pendingIncome = transactions
    .filter(t => t.type === "income" && !t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // 3. Despesas Efetivadas (Soma de transações type === 'expense' no mês atual que estão liquidadas)
  const totalExpense = transactions
    .filter(t => t.type === "expense" && t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Despesas Pendentes (Soma de transações type === 'expense' no mês atual em aberto)
  const pendingExpense = transactions
    .filter(t => t.type === "expense" && !t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // 4. Categorias Dinâmicas
  const categoryChartData = (() => {
    if (transactions.length === 0) return [];
    
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === "expense" && t.categoryName)
      .forEach(t => {
        categoryTotals[t.categoryName!] = (categoryTotals[t.categoryName!] || 0) + parseFloat(t.amount);
      });

    return Object.entries(categoryTotals).map(([name, value]) => {
      const cat = categories.find(c => c.name === name);
      return {
        name,
        value,
        color: cat?.color || "#71717a",
      };
    });
  })();

  // 5. Gráfico de Fluxo de Caixa (Saldo diário acumulado nos últimos 30 dias para Liquidado vs Pendente)
  const chartData = (() => {
    if (accounts.length === 0) return [];

    const now = new Date();
    const daysList: { date: Date; label: string }[] = [];

    // Gera os últimos 30 dias em formato UTC para consistência
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const label = `${String(utcDate.getUTCDate()).padStart(2, '0')}/${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}`;
      daysList.push({ date: utcDate, label });
    }

    // Saldo atual consolidado das contas (Saldo Liquidado hoje)
    let runningCleared = accounts
      .filter(a => a.type !== "credit_card")
      .reduce((sum, a) => sum + parseFloat(a.initialBalance), 0);

    // Saldo atual planejado/pendente (inclui todas as transações que ainda não foram liquidadas)
    let runningPending = runningCleared + transactions
      .filter(t => !t.isCleared)
      .reduce((sum, t) => {
        const val = parseFloat(t.amount);
        return sum + (t.type === "income" ? val : t.type === "expense" ? -val : 0);
      }, 0);

    const result: { day: string; liquidado: number; pendente: number }[] = [];

    // Iteramos de hoje para trás para reconstruir o saldo acumulado retroativo
    for (let i = daysList.length - 1; i >= 0; i--) {
      const currentDay = daysList[i];
      
      // Adiciona o saldo diário no início do resultado (unshift mantém a ordem cronológica)
      result.unshift({
        day: currentDay.label,
        liquidado: runningCleared,
        pendente: runningPending,
      });

      // Filtra transações ocorridas nesta data específica
      const txsToday = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getUTCFullYear() === currentDay.date.getUTCFullYear() &&
               tDate.getUTCMonth() === currentDay.date.getUTCMonth() &&
               tDate.getUTCDate() === currentDay.date.getUTCDate();
      });

      // Reverte o efeito dessas transações para obter o saldo do início do dia
      txsToday.forEach((tx) => {
        const val = parseFloat(tx.amount);
        if (tx.isCleared) {
          if (tx.type === "income") {
            runningCleared -= val;
            runningPending -= val;
          } else if (tx.type === "expense") {
            runningCleared += val;
            runningPending += val;
          }
        } else {
          if (tx.type === "income") {
            runningPending -= val;
          } else if (tx.type === "expense") {
            runningPending += val;
          }
        }
      });
    }

    return result;
  })();

  // 6. Transações Recentes
  const recentTxs = transactions.slice(0, 5);

  if (loading) {
    return <div className="text-center py-20 text-zinc-500">Carregando painel financeiro...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Bem-vindo!</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Seu resumo financeiro atualizado em tempo real.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/transactions">
            <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Geral */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saldo Geral</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(totalBalance)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Soma de todas as contas ativas</p>
          </CardContent>
        </Card>

        {/* Receitas */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Receitas Efetivadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(totalIncome)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {pendingIncome > 0 ? `${formatBRL(pendingIncome)} em aberto` : "Nenhuma receita em aberto"}
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Despesas Efetivadas</CardTitle>
            <TrendingDown className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(totalExpense)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {pendingExpense > 0 ? `${formatBRL(pendingExpense)} em aberto` : "Nenhuma despesa em aberto"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos e Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Evolução Mensal */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-xs">Evolução do saldo líquido de receitas vs. despesas.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 py-10">
                <p className="text-xs mb-3">Nenhum lançamento realizado nos últimos 30 dias.</p>
                <Link href="/dashboard/transactions">
                  <Button variant="outline" size="sm" className="text-xs rounded-xl">
                    Criar Lançamento
                  </Button>
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLiquidado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#71717a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPendente" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)", 
                      borderRadius: "0.5rem",
                      color: "var(--foreground)"
                    }} 
                  />
                  <Area type="monotone" dataKey="liquidado" stroke="#71717a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLiquidado)" name="Saldo Liquidado" />
                  <Area type="monotone" dataKey="pendente" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="4 4" fillOpacity={0.5} fill="url(#colorPendente)" name="Saldo Pendente" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Minhas Contas */}
        <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Minhas Contas</CardTitle>
            <CardDescription className="text-xs">Saldos individuais de cada conta ativa.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between overflow-hidden">
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-zinc-500 py-10">
                <p className="text-xs mb-3">Nenhuma conta cadastrada.</p>
                <Link href="/dashboard/accounts">
                  <Button variant="outline" size="sm" className="text-xs rounded-xl">
                    Adicionar Conta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin h-full">
                {accounts.map((acc) => {
                  const bal = parseFloat(acc.initialBalance);
                  return (
                    <div key={acc.id} className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-zinc-900/50 last:border-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BankLogo institution={acc.institution} type={acc.type} className="h-7 w-7 rounded-lg" />
                        <span className="truncate text-zinc-700 dark:text-zinc-300 font-semibold">{acc.name}</span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap ml-2">
                        {formatBRL(bal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Gastos por Categoria</CardTitle>
            <CardDescription className="text-xs">Distribuição de custos baseada em despesas liquidas.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {categoryChartData.length === 0 ? (
              <div className="text-center text-zinc-500 py-10 flex-1 flex items-center justify-center text-xs">Sem despesas este mês.</div>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                         data={categoryChartData}
                         cx="50%"
                         cy="50%"
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={3}
                         dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--card)", 
                          borderColor: "var(--border)", 
                          borderRadius: "0.5rem"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-1.5 mt-4 max-h-[120px] overflow-y-auto pr-1">
                  {categoryChartData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatBRL(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recentes Lançamentos */}
      <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Últimas Transações</CardTitle>
            <CardDescription className="text-xs">Seus lançamentos mais recentes no banco.</CardDescription>
          </div>
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">
              Ver Todas <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Adicione transações na tela de transações para alimentar a tabela.</div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <TableRow className="border-zinc-200 dark:border-zinc-900">
                  <TableHead className="px-6 text-zinc-500 w-36">Status</TableHead>
                  <TableHead className="text-zinc-500">Descrição</TableHead>
                  <TableHead className="text-zinc-500">Categoria</TableHead>
                  <TableHead className="text-zinc-500">Conta/Cartão</TableHead>
                  <TableHead className="text-zinc-500">Data</TableHead>
                  <TableHead className="text-right text-zinc-500">Valor</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTxs.map((tx: any) => {
                  const isInc = tx.type === "income";
                  const isTrans = tx.type === "transfer";
                  return (
                    <TableRow key={tx.id} className="border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      {/* 1. Status Badge */}
                      <TableCell className="py-2 px-6 text-xs flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          isInc 
                            ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200" 
                            : isTrans
                              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                              : "bg-zinc-200/40 dark:bg-zinc-900/40 text-zinc-500"
                        }`}>
                          {isInc ? <ArrowUpRight className="h-3 w-3" /> : isTrans ? <RefreshCw className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                        </div>
                        {tx.isCleared ? (
                          <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-[9px] font-bold text-zinc-800 dark:text-zinc-300">
                            Liquidado
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded bg-zinc-200/50 dark:bg-zinc-900/50 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500">
                            Pendente
                          </span>
                        )}
                      </TableCell>

                      {/* 2. Descrição */}
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-50 text-xs py-2">
                        {tx.description}
                      </TableCell>

                      {/* 3. Categoria */}
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs py-2">
                        {tx.type === "transfer" ? (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                            Transferência
                          </span>
                        ) : (
                          (() => {
                            const cat = categories.find(c => c.name === tx.categoryName || c.id === tx.categoryId);
                            const color = cat?.color || "#71717a";
                            return (
                              <span 
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
                                style={{
                                  backgroundColor: `${color}15`,
                                  borderColor: `${color}40`,
                                  color: color
                                }}
                              >
                                {tx.categoryName || "Geral"}
                              </span>
                            );
                          })()
                        )}
                      </TableCell>

                      {/* 4. Conta */}
                      <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs py-2">{tx.accountName}</TableCell>
                      
                      {/* 5. Data */}
                      <TableCell className="text-zinc-550 dark:text-zinc-400 text-xs py-2">
                        {formatDate(tx.date)}
                      </TableCell>
                      
                      {/* 6. Valor */}
                      <TableCell className={`text-right font-bold text-xs py-2 ${
                        tx.type === "income" 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : tx.type === "transfer" 
                            ? "text-zinc-500" 
                            : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"} {formatBRL(parseFloat(tx.amount))}
                      </TableCell>

                      {/* 7. Ações Rápidas */}
                      <TableCell className="py-2 px-6 text-right">
                        <div className="flex items-center justify-end">
                          {tx.isCleared ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                              onClick={() => handleStatusToggle(tx.id)}
                              title="Desfazer liquidação"
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                              onClick={() => handleStatusToggle(tx.id)}
                              title="Liquidar lançamento"
                            >
                              <Check className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
