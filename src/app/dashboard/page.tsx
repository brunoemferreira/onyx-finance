"use client";

import { useEffect, useState, useCallback } from "react";
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
  Check,
  Undo2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Clock
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
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof getBankAccounts>>>([]);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof getTransactions>>>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);

  // Month navigation (Default: current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());

  const handlePrevMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const initData = async () => {
      await loadData();
    };
    initData();
  }, [loadData]);

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

  const [hideCardValues, setHideCardValues] = useState(false);
  const [showIncomeDetails, setShowIncomeDetails] = useState(true);
  const [showExpenseDetails, setShowExpenseDetails] = useState(true);
  const [showBalanceDetails, setShowBalanceDetails] = useState(true);
  const [showPrevMonthDetails, setShowPrevMonthDetails] = useState(true);

  const renderValue = (val: number) => {
    if (hideCardValues) return "R$ ••••";
    return formatBRL(val);
  };

  const getMonthName = (date: Date) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return monthNames[date.getMonth()];
  };

  const getMonthLastDay = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const [activeCardTab, setActiveCardTab] = useState<"todas" | "receitas" | "despesas" | "despesas_nao_pagas" | "receitas_nao_recebidas">("todas");

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
    let filtered: typeof transactions = [];
    let title = "";
    let isTodas = false;
    
    if (activeCardTab === "todas") {
      filtered = filteredTransactions;
      title = "Receitas vs Despesas";
      isTodas = true;
    } else if (activeCardTab === "receitas") {
      filtered = filteredTransactions.filter(t => t.type === "income" && t.isCleared);
      title = "Todas as Receitas";
    } else if (activeCardTab === "despesas") {
      filtered = filteredTransactions.filter(t => t.type === "expense" && t.isCleared);
      title = "Todas as Despesas";
    } else if (activeCardTab === "despesas_nao_pagas") {
      filtered = filteredTransactions.filter(t => t.type === "expense" && !t.isCleared);
      title = "Despesas Não Pagas";
    } else if (activeCardTab === "receitas_nao_recebidas") {
      filtered = filteredTransactions.filter(t => t.type === "income" && !t.isCleared);
      title = "Receitas Não Recebidas";
    }

    const categoryTotals: Record<string, number> = {};
    let totalValue = 0;
    let netValue = 0;

    filtered.forEach(t => {
      let catName = "";
      if (isTodas) {
        if (t.type === "income") catName = "Receitas";
        else if (t.type === "expense") catName = "Despesas";
        else return; // Ignore transfers in "Todas"
      } else {
        catName = t.categoryName || (t.type === "transfer" ? "Transferência" : "Geral");
      }
      
      const val = parseFloat(t.amount);
      categoryTotals[catName] = (categoryTotals[catName] || 0) + val;
      totalValue += val;
      
      if (isTodas) {
        if (t.type === "income") netValue += val;
        else if (t.type === "expense") netValue -= val;
      } else {
        netValue += val;
      }
    });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => {
      let color = "#71717a";
      if (isTodas) {
        if (name === "Receitas") color = "#10b981"; // emerald-500
        else if (name === "Despesas") color = "#f43f5e"; // rose-500
      } else if (name === "Transferência") {
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
    }).sort((a, b) => b.value - a.value);

    return {
      chartData,
      totalValue,
      displayValue: isTodas ? netValue : totalValue,
      title
    };
  })();

  // 1. Saldo Geral (Soma de contas checking, savings, investment, cash)
  const totalBalance = accounts
    .filter(a => a.accountType.type !== "credit_card")
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

  // 4. Saldo Do Período Anterior
  const prevMonthBalanceData = (() => {
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const lastDayOfPrevMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    let clearedBalance = totalBalance;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate > lastDayOfPrevMonth && t.isCleared) {
        const val = parseFloat(t.amount);
        if (t.type === "income") clearedBalance -= val;
        else if (t.type === "expense") clearedBalance += val;
      }
    });

    let pendencies = 0;
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate <= lastDayOfPrevMonth && !t.isCleared) {
        const val = parseFloat(t.amount);
        if (t.type === "income") pendencies += val;
        else if (t.type === "expense") pendencies -= val;
      }
    });

    return {
      disponivel: clearedBalance,
      pendencias: pendencies,
      total: clearedBalance + pendencies
    };
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
      .filter(a => a.accountType?.type !== "credit_card")
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 0: Saldo Do Período Anterior */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 shadow-sm rounded-2xl flex flex-col justify-between p-4 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4 stroke-[2.2]" />
                </span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Saldo Do Período Anterior
                </span>
              </div>
              <button 
                onClick={() => setHideCardValues(prev => !prev)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {hideCardValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {renderValue(prevMonthBalanceData.total)}
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[10px] text-zinc-400 font-medium capitalize">
                  Até {new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 0).getDate()} de {new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 0).toLocaleDateString('pt-BR', { month: 'long' })}
                </p>
                <span className="text-[9px] text-zinc-400/70 font-normal">
                  (Receita - Despesa + Saldo Bancário)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
            <button
              onClick={() => setShowPrevMonthDetails(prev => !prev)}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-300 cursor-pointer mb-2"
            >
              {showPrevMonthDetails ? "Ocultar detalhes" : "Ver detalhes"}
              {showPrevMonthDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showPrevMonthDetails && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/20 dark:border-orange-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-orange-600 dark:text-orange-400">
                    <Clock className="h-3.5 w-3.5 stroke-[2.5]" /> Pendências
                  </div>
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {renderValue(prevMonthBalanceData.pendencias)}
                  </div>
                </div>
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 dark:border-emerald-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Disponível
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {renderValue(prevMonthBalanceData.disponivel)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Card 1: Receitas */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 shadow-sm rounded-2xl flex flex-col justify-between p-4 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4 stroke-[2.2]" />
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Receitas
                </span>
              </div>
              <button 
                onClick={() => setHideCardValues(prev => !prev)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {hideCardValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {renderValue(totalIncome + pendingIncome)}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                {getMonthDateRangeLabel(selectedMonthDate)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
            <button
              onClick={() => setShowIncomeDetails(prev => !prev)}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-300 cursor-pointer mb-2"
            >
              {showIncomeDetails ? "Ocultar detalhes" : "Ver detalhes"}
              {showIncomeDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showIncomeDetails && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 dark:border-emerald-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Recebido
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(totalIncome)}
                  </div>
                </div>
                <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/20 dark:border-amber-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                    <RefreshCw className="h-3 w-3 stroke-[2.5]" /> A receber
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(pendingIncome)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Despesas */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 shadow-sm rounded-2xl flex flex-col justify-between p-4 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100/50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-455">
                  <TrendingDown className="h-4 w-4 stroke-[2.2]" />
                </span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Despesas
                </span>
              </div>
              <button 
                onClick={() => setHideCardValues(prev => !prev)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {hideCardValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {renderValue(totalExpense + pendingExpense)}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                {getMonthDateRangeLabel(selectedMonthDate)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
            <button
              onClick={() => setShowExpenseDetails(prev => !prev)}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-300 cursor-pointer mb-2"
            >
              {showExpenseDetails ? "Ocultar detalhes" : "Ver detalhes"}
              {showExpenseDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showExpenseDetails && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 dark:border-emerald-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-650 dark:text-emerald-450">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Pago
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(totalExpense)}
                  </div>
                </div>
                <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/20 dark:border-rose-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-600 dark:text-rose-455">
                    <RefreshCw className="h-3 w-3 stroke-[2.5]" /> A pagar
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(pendingExpense)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Saldo Previsto */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 shadow-sm rounded-2xl flex flex-col justify-between p-4 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100/50 dark:bg-sky-950/40 text-sky-650 dark:text-sky-400">
                  <Wallet className="h-4 w-4 stroke-[2.2]" />
                </span>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Saldo Previsto
                </span>
              </div>
              <button 
                onClick={() => setHideCardValues(prev => !prev)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {hideCardValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {renderValue(totalBalance + pendingIncome - pendingExpense)}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                Até {getMonthLastDay(selectedMonthDate)} de {getMonthName(selectedMonthDate)} <span className="text-[9px] text-zinc-400/70 font-normal ml-0.5">(Receita - Despesa + Saldo Bancário)</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/50">
            <button
              onClick={() => setShowBalanceDetails(prev => !prev)}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-300 cursor-pointer mb-2"
            >
              {showBalanceDetails ? "Ocultar detalhes" : "Ver detalhes"}
              {showBalanceDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showBalanceDetails && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 dark:border-emerald-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-650 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Disponível
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(totalBalance)}
                  </div>
                </div>
                <div className="bg-sky-50/20 dark:bg-sky-950/10 border border-sky-100/20 dark:border-sky-900/10 rounded-xl p-2.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">
                    <RefreshCw className="h-3 w-3 stroke-[2.5]" /> Previsto
                  </div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {renderValue(totalBalance + pendingIncome - pendingExpense)}
                  </div>
                </div>
              </div>
            )}
          </div>
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
                        <BankLogo institution={acc.institution} type={acc.accountType.type} className="h-7 w-7 rounded-lg" />
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
              <CardTitle className="text-sm font-semibold">Gráficos</CardTitle>
            </div>
            
            {/* Tabs Selector */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-900 mt-2 overflow-x-auto scrollbar-none pb-0.5">
              {(["todas", "receitas", "despesas", "despesas_nao_pagas", "receitas_nao_recebidas"] as const).map((tab) => {
                const label = tab === "todas" ? "Todas" 
                            : tab === "receitas" ? "Receitas" 
                            : tab === "despesas" ? "Despesas" 
                            : tab === "despesas_nao_pagas" ? "Não Pagas"
                            : "Não Recebidas";
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
                      {formatBRL(tabData.displayValue)}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                      {activeCardTab === "todas" ? "Saldo" : "Total"}
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
                {recentTxs.map((tx) => {
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
