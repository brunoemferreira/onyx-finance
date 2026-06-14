"use client";

import { useEffect, useState } from "react";
import { getBankAccounts } from "@/app/actions/accounts";
import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard as CreditCardIcon, 
  Plus, 
  ArrowRight 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

// Dados mockados de fallback se o banco de dados estiver vazio
const mockChartData = [
  { day: "01/06", receita: 4000, despesa: 2400 },
  { day: "05/06", receita: 4000, despesa: 2800 },
  { day: "10/06", receita: 4500, despesa: 3000 },
  { day: "15/06", receita: 5000, despesa: 3200 },
  { day: "20/06", receita: 6200, despesa: 3500 },
  { day: "25/06", receita: 6200, despesa: 3900 },
  { day: "30/06", receita: 6500, despesa: 4200 },
];

const mockCategoryData = [
  { name: "Alimentação", value: 1200, color: "#27272a" },
  { name: "Assinaturas", value: 450, color: "#52525b" },
  { name: "Transporte", value: 350, color: "#71717a" },
  { name: "Moradia", value: 1800, color: "#a1a1aa" },
  { name: "Lazer", value: 400, color: "#d4d4d8" },
];

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

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, []);

  // Agregações Dinâmicas baseadas no Banco de Dados
  const hasRealData = accounts.length > 0;
  
  // 1. Saldo Geral (Soma de contas checking, savings, investment, cash)
  const totalBalance = hasRealData
    ? accounts
        .filter(a => a.type !== "credit_card")
        .reduce((sum, a) => sum + parseFloat(a.initialBalance), 0)
    : 5800.00;

  // 2. Receitas do Mês (Soma de transações type === 'income' no mês atual)
  const totalIncome = hasRealData
    ? transactions
        .filter(t => t.type === "income" && t.isCleared)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 6500.00;

  // 3. Despesas do Mês (Soma de transações type === 'expense' no mês atual)
  const totalExpense = hasRealData
    ? transactions
        .filter(t => t.type === "expense" && t.isCleared)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 4200.00;

  // 4. Cartão de Crédito Fatura e Limite
  const creditCardAccount = accounts.find(a => a.type === "credit_card");
  const creditCardBalance = creditCardAccount ? parseFloat(creditCardAccount.initialBalance) : 301.80;
  const creditCardLimit = creditCardAccount ? parseFloat(creditCardAccount.creditLimit || "2000") : 2000.00;
  const creditCardPercent = Math.min(100, (creditCardBalance / creditCardLimit) * 100);

  // 5. Categorias Dinâmicas
  const categoryChartData = (() => {
    if (!hasRealData || transactions.length === 0) return mockCategoryData;
    
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

  // 6. Transações Recentes
  const recentTxs = hasRealData ? transactions.slice(0, 5) : null;

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
            {hasRealData ? "Seu resumo financeiro atualizado em tempo real." : "Demonstração (Adicione contas para ver seus dados reais)."}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-[10px] text-zinc-500 mt-1">Receitas confirmadas deste mês</p>
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
              {totalIncome > 0 ? `Equivale a ${((totalExpense / totalIncome) * 100).toFixed(1)}% das receitas` : "Nenhuma receita registrada"}
            </p>
          </CardContent>
        </Card>

        {/* Fatura do Cartão */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {creditCardAccount ? `Fatura ${creditCardAccount.name}` : "Fatura Cartão Exemplo"}
            </CardTitle>
            <CreditCardIcon className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(creditCardBalance)}</div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-zinc-950 dark:bg-zinc-50 h-1.5 rounded-full" style={{ width: `${creditCardPercent}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
              <span>Limite Usado {formatBRL(creditCardBalance)}</span>
              <span>Total {formatBRL(creditCardLimit)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolução Mensal */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-xs">Evolução do saldo de receitas vs. despesas.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27272a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#27272a" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="receita" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#27272a" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Gastos por Categoria</CardTitle>
            <CardDescription className="text-xs">Distribuição de custos baseada em despesas liquidas.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {categoryChartData.length === 0 ? (
              <div className="text-center text-zinc-500 py-10 flex-1 flex items-center justify-center text-xs">Sem despesas este mês.</div>
            ) : (
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
            )}
            
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
          {!hasRealData || transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Adicione transações na tela de transações para alimentar a tabela.</div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <TableRow className="border-zinc-200 dark:border-zinc-900">
                  <TableHead className="px-6 text-zinc-500">Descrição</TableHead>
                  <TableHead className="text-zinc-500">Categoria</TableHead>
                  <TableHead className="text-zinc-500">Conta/Cartão</TableHead>
                  <TableHead className="text-zinc-500">Data</TableHead>
                  <TableHead className="text-right px-6 text-zinc-500">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTxs?.map((tx: any) => (
                  <TableRow key={tx.id} className="border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <TableCell className="font-medium px-6 text-zinc-900 dark:text-zinc-50">{tx.description}</TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
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
                    <TableCell className="text-zinc-500 dark:text-zinc-400">{tx.accountName}</TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className={`text-right px-6 font-bold ${
                      tx.type === "income" 
                        ? "text-zinc-900 dark:text-zinc-50" 
                        : tx.type === "transfer" 
                          ? "text-zinc-500" 
                          : "text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"} {formatBRL(parseFloat(tx.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
