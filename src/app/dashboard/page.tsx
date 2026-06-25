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
  RefreshCw,
  ChevronLeft,
  ChevronRight
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

  // Month navigation (Default: current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());

  const handlePrevMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

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

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const yyyy = txDate.getUTCFullYear();
    const mm = String(txDate.getUTCMonth() + 1).padStart(2, '0');
    const targetMonth = `${selectedMonthDate.getFullYear()}-${String(selectedMonthDate.getMonth() + 1).padStart(2, '0')}`;
    return `${yyyy}-${mm}` === targetMonth;
  });

  const [activeCardTab, setActiveCardTab] = useState<"todas" | "receitas" | "despesas" | "despesas_nao_pagas">("despesas");

  const getMonthDateRangeLabel = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `1 de ${monthNames[month]} - ${lastDay} de ${monthNames[month]}`;
  };

  // Get active tab chart data and total
  const tabData = (() => {
    let filtered: any[] = [];
    let title = "";
    
    if (activeCardTab === "todas") {
      filtered = filteredTransactions;
      title = "Todas as Transações";
    } else if (activeCardTab === "receitas") {
      filtered = filteredTransactions.filter(t => t.type === "income" && t.isCleared);
      title = "Todas as Receitas";
    } else if (activeCardTab === "despesas") {
      filtered = filteredTransactions.filter(t => t.type === "expense" && t.isCleared);
      title = "Todas as Despesas";
    } else if (activeCardTab === "despesas_nao_pagas") {
      filtered = filteredTransactions.filter(t => t.type === "expense" && !t.isCleared);
      title = "Despesas Não Pagas";
    }

    const categoryTotals: Record<string, number> = {};
    let totalValue = 0;

    filtered.forEach(t => {
      const catName = t.categoryName || (t.type === "transfer" ? "Transferência" : "Geral");
      const val = parseFloat(t.amount);
      categoryTotals[catName] = (categoryTotals[catName] || 0) + val;
      totalValue += val;
    });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => {
      let color = "#71717a";
      if (name === "Transferência") {
        color = "#a1a1aa";
      } else {
        const cat = categories.find(c => c.name === name);
        if (cat) color = cat.color;
      }
      return {
        name,
        value,
        color,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      };
    });

    return {
      chartData,
      totalValue,
      title
    };
  })();

  // 1. Saldo Geral (Soma de contas checking, savings, investment, cash)
  const totalBalance = accounts
    .filter(a => a.type !== "credit_card")
    .reduce((sum, a) => sum + parseFloat(a.initialBalance), 0);

  // 2. Receitas Efetivadas (Soma de transações type === 'income' no mês selecionado que estão liquidadas)
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income" && t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Receitas Pendentes (Soma de transações type === 'income' no mês selecionado em aberto)
  const pendingIncome = filteredTransactions
    .filter(t => t.type === "income" && !t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // 3. Despesas Efetivadas (Soma de transações type === 'expense' no mês selecionado que estão liquidadas)
  const totalExpense = filteredTransactions
    .filter(t => t.type === "expense" && t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Despesas Pendentes (Soma de transações type === 'expense' no mês selecionado em aberto)
  const pendingExpense = filteredTransactions
    .filter(t => t.type === "expense" && !t.isCleared)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // 4. Categorias Dinâmicas
  const categoryChartData = (() => {
    if (filteredTransactions.length === 0) return [];
    
    const categoryTotals: Record<string, number> = {};
    filteredTransactions
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

  // 5. Gráfico de Fluxo de Caixa (Saldo diário acumulado no mês selecionado para Liquidado vs Pendente)
  const chartData = (() => {
    if (accounts.length === 0) return [];

    const todayDate = new Date();
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

    const latestDate = todayDate > lastDayOfMonth ? todayDate : lastDayOfMonth;
    
    const daysList: { date: Date; label: string; isTargetMonth: boolean }[] = [];
    const temp = new Date(Date.UTC(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate()));
    const limit = new Date(Date.UTC(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate()));

    while (temp >= limit) {
      const utcDate = new Date(temp);
      const label = `${String(utcDate.getUTCDate()).padStart(2, '0')}/${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}`;
      const isTargetMonth = utcDate.getUTCMonth() === month && utcDate.getUTCFullYear() === year;
      daysList.push({ date: utcDate, label, isTargetMonth });
      temp.setDate(temp.getDate() - 1);
    }

    let runningCleared = accounts
      .filter(a => a.type !== "credit_card")
      .reduce((sum, a) => sum + parseFloat(a.initialBalance), 0);

    let runningPending = runningCleared + transactions
      .filter(t => !t.isCleared)
      .reduce((sum, t) => {
        const val = parseFloat(t.amount);
        return sum + (t.type === "income" ? val : t.type === "expense" ? -val : 0);
      }, 0);

    const allDaysResult: { day: string; liquidado: number; pendente: number }[] = [];

    for (let i = 0; i < daysList.length; i++) {
      const currentDay = daysList[i];

      if (currentDay.isTargetMonth) {
        allDaysResult.push({
          day: currentDay.label,
          liquidado: runningCleared,
          pendente: runningPending,
        });
      }

      const txsToday = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getUTCFullYear() === currentDay.date.getUTCFullYear() &&
               tDate.getUTCMonth() === currentDay.date.getUTCMonth() &&
               tDate.getUTCDate() === currentDay.date.getUTCDate();
      });

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

    return allDaysResult.reverse();
  })();

  // 6. Transações Recentes
  const recentTxs = filteredTransactions.slice(0, 5);

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Navegador Mensal */}
          <div className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl px-2 h-9 w-52 shrink-0">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={handlePrevMonth} 
              className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold capitalize text-zinc-900 dark:text-zinc-100 text-center flex-1 select-none">
              {selectedMonthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={handleNextMonth} 
              className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Link href="/dashboard/transactions" className="w-full sm:w-auto">
            <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 w-full h-9">
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
                <p className="text-xs mb-3">Nenhum lançamento realizado neste mês.</p>
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

        {/* Distribuição por Categoria / Despesas */}
        <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Despesas</CardTitle>
            </div>
            
            {/* Tabs Selector */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-900 mt-2 overflow-x-auto scrollbar-none pb-0.5">
              {(["todas", "receitas", "despesas", "despesas_nao_pagas"] as const).map((tab) => {
                const label = tab === "todas" ? "Todas" 
                            : tab === "receitas" ? "Receitas" 
                            : tab === "despesas" ? "Despesas" 
                            : "Não Pagas";
                const isActive = activeCardTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveCardTab(tab)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-[2px] ${
                      isActive 
                        ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100" 
                        : "border-transparent text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="text-center mb-2">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{tabData.title}</p>
              <p className="text-[10px] text-zinc-400">{getMonthDateRangeLabel(selectedMonthDate)}</p>
            </div>

            {tabData.chartData.length === 0 ? (
              <div className="text-center text-zinc-500 py-10 flex-1 flex items-center justify-center text-xs">
                Nenhum lançamento nesta categoria este mês.
              </div>
            ) : (
              <>
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                         data={tabData.chartData}
                         cx="50%"
                         cy="50%"
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={3}
                         dataKey="value"
                      >
                        {tabData.chartData.map((entry, index) => (
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
                  
                  {/* Centered label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                      {formatBRL(tabData.totalValue)}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                      Total
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4 max-h-[120px] overflow-y-auto pr-1">
                  {tabData.chartData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatBRL(cat.value)}</span>
                        <span className="text-[10px] text-zinc-400">({cat.percentage.toFixed(1)}%)</span>
                      </div>
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
