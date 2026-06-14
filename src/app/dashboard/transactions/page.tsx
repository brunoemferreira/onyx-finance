"use client";

import React, { useEffect, useState } from "react";
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  toggleTransactionClear 
} from "@/app/actions/transactions";
import { getBankAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Pencil,
  Undo2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home,
  Car,
  PartyPopper,
  Briefcase,
  TrendingUp,
  Utensils,
  Tag,
  ShoppingBag,
  Coffee,
  Clapperboard,
  Dumbbell,
  HeartPulse,
  GraduationCap,
  Plane,
  Bus,
  Wrench,
  Wifi,
  Lightbulb,
  Phone,
  Shield,
  Gift,
  PiggyBank,
  Coins,
  Shirt,
  Sparkles,
  PawPrint,
  Baby,
  Stethoscope,
  Receipt,
  Heart,
  BookOpen,
  Gamepad2,
  Plug,
  Store,
  Hammer,
  Smartphone,
  Music,
  Wine,
  Flame,
  Trash,
  Tv,
  User,
  Users,
  Camera,
  Scissors,
  MapPin,
  Ticket,
  Bike,
  ShieldAlert,
  Sparkle,
  DollarSign,
  Award,
  Wallet,
  CreditCard,
  Book,
  Laptop,
  Activity,
  Key,
  Compass,
  Smile
} from "lucide-react";

type Transaction = {
  id: string;
  description: string;
  amount: string;
  type: "income" | "expense" | "transfer";
  date: Date;
  isCleared: boolean;
  isInstallment: boolean;
  currentInstallment: number | null;
  totalInstallments: number | null;
  isRecurring: boolean;
  recurrencePeriod: string;
  parentId: string | null;
  accountName: string;
  accountId: string;
  categoryName: string | null;
  categoryId: string | null;
  toAccountName: string | null;
};

const formatDate = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const getUTCDateStr = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${year}-${month}-${day}`;
};

const getCategoryIcon = (iconName: string | null) => {
  switch (iconName) {
    case "home":
      return Home;
    case "car":
      return Car;
    case "party-popper":
      return PartyPopper;
    case "briefcase":
      return Briefcase;
    case "trending-up":
      return TrendingUp;
    case "utensils":
      return Utensils;
    case "shopping-bag":
      return ShoppingBag;
    case "coffee":
      return Coffee;
    case "clapperboard":
      return Clapperboard;
    case "dumbbell":
      return Dumbbell;
    case "heart-pulse":
      return HeartPulse;
    case "graduation-cap":
      return GraduationCap;
    case "plane":
      return Plane;
    case "bus":
      return Bus;
    case "wrench":
      return Wrench;
    case "wifi":
      return Wifi;
    case "lightbulb":
      return Lightbulb;
    case "phone":
      return Phone;
    case "shield":
      return Shield;
    case "gift":
      return Gift;
    case "piggy-bank":
      return PiggyBank;
    case "coins":
      return Coins;
    case "shirt":
      return Shirt;
    case "sparkles":
      return Sparkles;
    case "paw-print":
      return PawPrint;
    case "baby":
      return Baby;
    case "stethoscope":
      return Stethoscope;
    case "receipt":
      return Receipt;
    case "heart":
      return Heart;
    case "book-open":
      return BookOpen;
    case "gamepad-2":
      return Gamepad2;
    case "plug":
      return Plug;
    case "store":
      return Store;
    case "hammer":
      return Hammer;
    case "smartphone":
      return Smartphone;
    case "music":
      return Music;
    case "wine":
      return Wine;
    case "flame":
      return Flame;
    case "trash":
      return Trash;
    case "tv":
      return Tv;
    case "user":
      return User;
    case "users":
      return Users;
    case "camera":
      return Camera;
    case "scissors":
      return Scissors;
    case "map-pin":
      return MapPin;
    case "ticket":
      return Ticket;
    case "bike":
      return Bike;
    case "shield-alert":
      return ShieldAlert;
    case "sparkle":
      return Sparkle;
    case "dollar-sign":
      return DollarSign;
    case "award":
      return Award;
    case "wallet":
      return Wallet;
    case "credit-card":
      return CreditCard;
    case "book":
      return Book;
    case "laptop":
      return Laptop;
    case "activity":
      return Activity;
    case "key":
      return Key;
    case "compass":
      return Compass;
    case "calendar":
      return Calendar;
    case "smile":
      return Smile;
    default:
      return Tag;
  }
};

type Account = { id: string; name: string; initialBalance: string; type: string };
type Category = { id: string; name: string; type: "income" | "expense"; icon: string; color: string; parentId: string | null };

export default function TransactionsPage() {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const getCategoryNameFormatted = (cat: Category | undefined) => {
    if (!cat) return "";
    if (cat.parentId) {
      const parent = categories.find(c => c.id === cat.parentId);
      if (parent) {
        return `${parent.name} > ${cat.name}`;
      }
    }
    return cat.name;
  };

  const getSortedSelectCategories = (currentType: string) => {
    return [...categories]
      .filter(c => c.type === currentType)
      .sort((a, b) => {
        const aParentId = a.parentId;
        const bParentId = b.parentId;
        const aParent = aParentId ? categories.find(c => c.id === aParentId) : null;
        const bParent = bParentId ? categories.find(c => c.id === bParentId) : null;

        const aGroup = aParent ? aParent.name : a.name;
        const bGroup = bParent ? bParent.name : b.name;

        if (aGroup !== bGroup) {
          return aGroup.localeCompare(bGroup);
        }
        
        if (!aParentId && bParentId) return -1;
        if (aParentId && !bParentId) return 1;
        return a.name.localeCompare(b.name);
      });
  };
  const [showBalances, setShowBalances] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Month navigation (Default: current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());

  // Additional filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Sorting states
  const [sortField, setSortField] = useState<"date" | "description" | "categoryName" | "accountName" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc when changing field
    }
  };

  const renderSortArrow = (field: typeof sortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />
      : <ArrowDown className="h-3 w-3 text-zinc-900 dark:text-zinc-100" />;
  };

  // Selected Transaction for Edit or Delete
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  // Form states (Create / Edit)
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense");
  const [date, setDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  // Installment / Recurrence states
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState("3");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePeriod, setRecurrencePeriod] = useState<"none" | "weekly" | "monthly" | "yearly">("monthly");

  const loadData = async () => {
    try {
      const [txs, accs, cats] = await Promise.all([
        getTransactions(),
        getBankAccounts(),
        getCategories()
      ]);
      setTransactionsList(txs as any);
      setAccounts(accs as Account[]);
      setCategories(cats as Category[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
    if (accounts.length > 0) setAccountId(accounts[0].id);
    setCategoryId(categories.filter(c => c.type === "expense")[0]?.id || "");
    setIsInstallment(false);
    setIsRecurring(false);
    setIsCreateOpen(true);
  };

  const openEditDialog = (tx: Transaction) => {
    setActiveTx(tx);
    setDescription(tx.description);
    setAmount(tx.amount);
    setType(tx.type);
    setDate(new Date(tx.date).toISOString().split("T")[0]);
    setAccountId(tx.accountId);
    setCategoryId(tx.categoryId || "");
    setToAccountId(tx.toAccountName ? accounts.find(a => a.name === tx.toAccountName)?.id || "" : "");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (tx: Transaction) => {
    setActiveTx(tx);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        description,
        amount,
        type,
        date, // Preserve selected date (YYYY-MM-DD)
        accountId,
        categoryId: type !== "transfer" ? categoryId || undefined : undefined,
        toAccountId: type === "transfer" ? toAccountId : undefined,
        isInstallment: type === "expense" ? isInstallment : false,
        totalInstallments: type === "expense" && isInstallment ? parseInt(totalInstallments) : undefined,
        isRecurring: isRecurring,
        recurrencePeriod: isRecurring ? recurrencePeriod : "none",
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTx) return;
    try {
      await updateTransaction(activeTx.id, {
        description,
        amount,
        type,
        date, // Preserve selected date (YYYY-MM-DD)
        accountId,
        categoryId: type !== "transfer" ? categoryId || undefined : undefined,
        toAccountId: type === "transfer" ? toAccountId : undefined,
      });
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async (deleteAllSeries: boolean) => {
    if (!activeTx) return;
    try {
      await deleteTransaction(activeTx.id, deleteAllSeries);
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (id: string) => {
    try {
      await toggleTransactionClear(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-calculate running balances for each transaction row
  const computedTxBalances = (() => {
    const balances: Record<string, number> = {};
    const runningBalances: Record<string, number> = {};
    
    // Initialize with current balances of each account
    accounts.forEach((acc) => {
      runningBalances[acc.id] = parseFloat(acc.initialBalance);
    });

    // Reconstruct history backwards (from newest to oldest)
    transactionsList.forEach((tx) => {
      const amount = parseFloat(tx.amount);
      
      // The balance right after this transaction occurred is the current running balance for this account
      balances[tx.id] = runningBalances[tx.accountId];

      // Revert the transaction's effect to get the balance *before* this transaction occurred
      if (tx.isCleared) {
        if (tx.type === "income") {
          runningBalances[tx.accountId] -= amount;
        } else if (tx.type === "expense") {
          runningBalances[tx.accountId] += amount;
        } else if (tx.type === "transfer") {
          runningBalances[tx.accountId] += amount;
          const destId = accounts.find(a => a.name === tx.toAccountName)?.id;
          if (destId) {
            runningBalances[destId] -= amount;
          }
        }
      }
    });

    return balances;
  })();

  const handlePrevMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Filter transactions by selected filters
  const filteredTransactions = transactionsList.filter((tx) => {
    // 1. Month Filter
    const txDate = new Date(tx.date);
    const yyyy = txDate.getUTCFullYear();
    const mm = String(txDate.getUTCMonth() + 1).padStart(2, '0');
    const targetMonth = `${selectedMonthDate.getFullYear()}-${String(selectedMonthDate.getMonth() + 1).padStart(2, '0')}`;
    if (`${yyyy}-${mm}` !== targetMonth) return false;

    // 2. Type Filter
    if (filterType !== "all" && tx.type !== filterType) return false;

    // 3. Account Filter
    if (filterAccount !== "all" && tx.accountId !== filterAccount) return false;

    // 4. Category Filter
    if (filterCategory !== "all" && tx.categoryId !== filterCategory) return false;

    // 5. Status Filter
    if (filterStatus !== "all") {
      if (filterStatus === "cleared" && !tx.isCleared) return false;
      if (filterStatus === "pending" && tx.isCleared) return false;
    }

    return true;
  });

  // Sort the filtered transactions list
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "categoryName") {
      aValue = a.categoryName || "";
      bValue = b.categoryName || "";
    } else if (sortField === "accountName") {
      aValue = a.accountName || "";
      bValue = b.accountName || "";
    } else if (sortField === "amount") {
      aValue = parseFloat(a.amount);
      bValue = parseFloat(b.amount);
    } else if (sortField === "date") {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getEndOfDayTotalBalance = (dateStr: string) => {
    const parts = dateStr.split("/");
    const targetDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;

    let total = 0;

    accounts.forEach(acc => {
      // Find the first transaction of this account that is on or before targetDateStr
      // Since transactionsList is in reverse chronological order (newest to oldest),
      // the first one we find is the latest balance for this account on or before targetDateStr.
      const lastTx = transactionsList.find(tx => 
        tx.accountId === acc.id && 
        getUTCDateStr(tx.date) <= targetDateStr
      );

      if (lastTx) {
        total += computedTxBalances[lastTx.id] || 0;
      } else {
        total += parseFloat(acc.initialBalance) || 0;
      }
    });

    return total;
  };

  const translateType = (t: string) => {
    if (t === "expense") return "Despesa";
    if (t === "income") return "Receita";
    return "Transferência";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Transações</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Acompanhamento de fluxos e controle de faturas.</p>
        </div>

        {/* Create Transaction Trigger */}
        <Button 
          onClick={openCreateDialog} 
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 h-9"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Novo Lançamento
        </Button>
      </div>

      {/* Filtros Container */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-4">
        <div className="flex flex-wrap items-center justify-start gap-3">
          {/* Navegador Mensal */}
          <div className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl px-2 h-9 w-52 shrink-0">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={handlePrevMonth} 
              className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
              className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtro Tipo */}
          <Select value={filterType} onValueChange={(val) => val && setFilterType(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 bg-white dark:bg-zinc-950 w-40 shrink-0">
              <div className="flex items-center gap-1.5 text-left truncate">
                <span className="text-zinc-400 dark:text-zinc-550 font-medium">Tipo:</span>
                <SelectValue>
                  {filterType === "all" ? "Todos" : filterType === "expense" ? "Despesas" : filterType === "income" ? "Receitas" : "Transferências"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todos</SelectItem>
              <SelectItem value="expense" className="text-xs">Despesas</SelectItem>
              <SelectItem value="income" className="text-xs">Receitas</SelectItem>
              <SelectItem value="transfer" className="text-xs">Transferências</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Conta */}
          <Select value={filterAccount} onValueChange={(val) => val && setFilterAccount(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 bg-white dark:bg-zinc-950 w-44 shrink-0">
              <div className="flex items-center gap-1.5 text-left truncate">
                <span className="text-zinc-400 dark:text-zinc-550 font-medium">Conta:</span>
                <SelectValue>
                  {filterAccount === "all" ? "Todas" : accounts.find(a => a.id === filterAccount)?.name || ""}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todas</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id} className="text-xs">{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Categoria */}
          <Select value={filterCategory} onValueChange={(val) => val && setFilterCategory(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 bg-white dark:bg-zinc-950 w-44 shrink-0">
              <div className="flex items-center gap-1.5 text-left truncate">
                <span className="text-zinc-400 dark:text-zinc-550 font-medium">Categoria:</span>
                <SelectValue>
                  {filterCategory === "all" ? "Todas" : categories.find(c => c.id === filterCategory)?.name || ""}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Status */}
          <Select value={filterStatus} onValueChange={(val) => val && setFilterStatus(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 bg-white dark:bg-zinc-950 w-40 shrink-0">
              <div className="flex items-center gap-1.5 text-left truncate">
                <span className="text-zinc-400 dark:text-zinc-550 font-medium">Status:</span>
                <SelectValue>
                  {filterStatus === "all" ? "Todos" : filterStatus === "cleared" ? "Liquidado" : "Pendente"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todos</SelectItem>
              <SelectItem value="cleared" className="text-xs">Liquidado</SelectItem>
              <SelectItem value="pending" className="text-xs">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="showBalances" 
              checked={showBalances} 
              onChange={(e) => setShowBalances(e.target.checked)} 
              className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800 cursor-pointer h-4 w-4"
            />
            <label htmlFor="showBalances" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
              Mostrar Saldo da Conta
            </label>
          </div>

          {(filterType !== "all" || filterAccount !== "all" || filterCategory !== "all" || filterStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterType("all");
                setFilterAccount("all");
                setFilterCategory("all");
                setFilterStatus("all");
              }}
              className="h-8 text-xs text-red-500 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg justify-start"
            >
              <FilterX className="mr-1.5 h-3.5 w-3.5" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Transações */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">Carregando lançamentos...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-900">
          <p className="text-zinc-500 text-sm">Nenhum lançamento encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <Card className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <TableRow className="border-zinc-200 dark:border-zinc-900 h-9">
                  <TableHead className="px-4 text-xs font-medium w-36">Status</TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 rounded-lg transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Data {renderSortArrow("date")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 rounded-lg transition-colors"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      Descrição {renderSortArrow("description")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 rounded-lg transition-colors"
                    onClick={() => handleSort("categoryName")}
                  >
                    <div className="flex items-center gap-1">
                      Categoria {renderSortArrow("categoryName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 rounded-lg transition-colors"
                    onClick={() => handleSort("accountName")}
                  >
                    <div className="flex items-center gap-1">
                      Conta {renderSortArrow("accountName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 rounded-lg transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Valor {renderSortArrow("amount")}
                    </div>
                  </TableHead>
                  {showBalances && <TableHead className="text-right text-xs font-medium">Saldo</TableHead>}
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                              {sortedTransactions.map((tx, idx) => {
                  const isInc = tx.type === "income";
                  const isTrans = tx.type === "transfer";
                  const dateStr = formatDate(tx.date);

                  const nextTx = sortedTransactions[idx + 1];
                  const isLastOfToday = !nextTx || formatDate(nextTx.date) !== dateStr;

                  return (
                    <React.Fragment key={tx.id}>
                      <TableRow className="border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 h-8">
                        {/* 1. Status */}
                        <TableCell className="py-1 px-4 text-xs flex items-center gap-2">
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

                        {/* 2. Data */}
                        <TableCell className="py-1 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(tx.date)}</TableCell>

                        {/* 3. Descrição */}
                        <TableCell className="font-semibold py-1 text-zinc-900 dark:text-zinc-50 text-xs">
                          <div className="flex flex-col min-w-0">
                            <span className="truncate max-w-[150px] sm:max-w-xs">{tx.description}</span>
                            {isTrans && tx.toAccountName && (
                              <span className="text-[9px] text-zinc-400 font-normal">Destino: {tx.toAccountName}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* 4. Categoria */}
                        <TableCell className="py-1 text-xs">
                          {isTrans ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">
                              <RefreshCw className="h-3 w-3 text-zinc-550" />
                              Transferência
                            </span>
                          ) : (
                            (() => {
                              const cat = categories.find(c => c.name === tx.categoryName || c.id === tx.categoryId);
                              const CatIcon = getCategoryIcon(cat?.icon || "tag");
                              const color = cat?.color || "#71717a";
                              return (
                                <span 
                                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold border"
                                  style={{
                                    backgroundColor: `${color}15`,
                                    borderColor: `${color}40`,
                                    color: color
                                  }}
                                >
                                  <CatIcon className="h-3 w-3" style={{ color: color }} />
                                  {tx.categoryName || "Geral"}
                                </span>
                              );
                            })()
                          )}
                        </TableCell>

                        {/* 5. Conta */}
                        <TableCell className="py-1 text-xs text-zinc-500 dark:text-zinc-400">{tx.accountName}</TableCell>

                        {/* 6. Valor */}
                        <TableCell className={`text-right py-1 text-xs font-normal ${
                          isInc 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : isTrans 
                              ? "text-zinc-500" 
                              : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {isInc ? "+" : isTrans ? "" : "-"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(tx.amount))}
                        </TableCell>

                        {/* 7. Saldo */}
                        {showBalances && (
                          <TableCell className="text-right py-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                            {computedTxBalances[tx.id] !== undefined
                              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(computedTxBalances[tx.id])
                              : "-"}
                          </TableCell>
                        )}

                        {/* 8. Ações */}
                        <TableCell className="px-4 py-1 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {tx.isCleared ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100"
                                onClick={() => handleStatusToggle(tx.id)}
                                title="Desfazer liquidação"
                              >
                                <Undo2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-zinc-450 hover:text-zinc-955 dark:hover:text-zinc-100"
                                onClick={() => handleStatusToggle(tx.id)}
                                title="Liquidar lançamento"
                              >
                                <Check className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-zinc-450 hover:text-zinc-900 dark:hover:text-zinc-100 h-7 w-7"
                              onClick={() => openEditDialog(tx)}
                              title="Editar lançamento"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-zinc-450 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 h-7 w-7"
                              onClick={() => openDeleteDialog(tx)}
                              title="Excluir lançamento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isLastOfToday && (
                        <TableRow className="bg-zinc-50/20 dark:bg-zinc-900/10 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900/40">
                          <TableCell colSpan={5} className="py-2 px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 text-right select-none">
                            Saldo previsto no final do dia:
                          </TableCell>
                          <TableCell className="text-right py-2 px-2 font-black text-xs text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(getEndOfDayTotalBalance(dateStr))}
                          </TableCell>
                          {showBalances && <TableCell className="py-2"></TableCell>}
                          <TableCell className="py-2"></TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 1. Modal de Criação (Novo Lançamento) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            <DialogDescription>Insira os detalhes da transação financeira.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Descrição</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Mercado, Academia, Salário..." required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo</label>
                <Select value={type} onValueChange={(v: any) => {
                  setType(v);
                  // Reseta categorias ao mudar tipo
                  const firstCat = categories.filter(c => c.type === v)[0]?.id || "";
                  setCategoryId(firstCat);
                }}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>{type === 'expense' ? 'Despesa' : type === 'income' ? 'Receita' : type === 'transfer' ? 'Transferência' : ''}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Despesa</SelectItem>
                    <SelectItem value="income" className="text-xs">Receita</SelectItem>
                    <SelectItem value="transfer" className="text-xs">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Valor (R$)</label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Data</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">
                  {type === "transfer" ? "Conta Origem" : "Conta / Cartão"}
                </label>
                {accounts.length > 0 && (
                  <Select value={accountId} onValueChange={(val) => val && setAccountId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>{accounts.find(a => a.id === accountId)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="text-xs">{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {type === "transfer" ? (
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Conta Destino</label>
                {accounts.length > 0 && (
                  <Select value={toAccountId} onValueChange={(val) => val && setToAccountId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>{accounts.find(a => a.id === toAccountId)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.id !== accountId).map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="text-xs">{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Categoria</label>
                {categories.length > 0 && (
                  <Select value={categoryId} onValueChange={(val) => val && setCategoryId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>
                        {(() => {
                          const cat = categories.find(c => c.id === categoryId);
                          const CatIcon = getCategoryIcon(cat?.icon || "tag");
                          return (
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="h-3.5 w-3.5 text-zinc-500" />
                              <span>{getCategoryNameFormatted(cat)}</span>
                            </div>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getSortedSelectCategories(type).map((cat) => {
                        const CatIcon = getCategoryIcon(cat.icon);
                        const isSub = !!cat.parentId;
                        return (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="h-3.5 w-3.5 text-zinc-500" />
                              <span className={isSub ? "pl-2 font-normal text-zinc-650 dark:text-zinc-400" : "font-bold text-zinc-900 dark:text-zinc-100"}>
                                {isSub ? `↳ ${cat.name}` : cat.name}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Recorrência / Parcelamento */}
            {type !== "transfer" && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                {type === "expense" && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isInstallment" 
                      checked={isInstallment} 
                      onChange={(e) => {
                        setIsInstallment(e.target.checked);
                        if (e.target.checked) setIsRecurring(false);
                      }} 
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800"
                    />
                    <label htmlFor="isInstallment" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Compra parcelada</label>
                  </div>
                )}

                {isInstallment && type === "expense" && (
                  <div className="pl-5">
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Número de Parcelas</label>
                    <Input type="number" min="2" max="60" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} className="w-24 h-8" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isRecurring" 
                    checked={isRecurring} 
                    onChange={(e) => {
                      setIsRecurring(e.target.checked);
                      if (e.target.checked) setIsInstallment(false);
                    }} 
                    className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800"
                  />
                  <label htmlFor="isRecurring" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Lançamento recorrente fixo</label>
                </div>

                {isRecurring && (
                  <div className="pl-5">
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Frequência</label>
                    <Select value={recurrencePeriod} onValueChange={(v: any) => setRecurrencePeriod(v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly" className="text-xs">Semanal</SelectItem>
                        <SelectItem value="monthly" className="text-xs">Mensal</SelectItem>
                        <SelectItem value="yearly" className="text-xs">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" className="w-full mt-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal de Edição (Editar Lançamento) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
            <DialogDescription>Modifique as propriedades deste lançamento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Descrição</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo</label>
                <Select value={type} onValueChange={(v: any) => {
                  setType(v);
                  const firstCat = categories.filter(c => c.type === v)[0]?.id || "";
                  setCategoryId(firstCat);
                }}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>{type === 'expense' ? 'Despesa' : type === 'income' ? 'Receita' : type === 'transfer' ? 'Transferência' : ''}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Despesa</SelectItem>
                    <SelectItem value="income" className="text-xs">Receita</SelectItem>
                    <SelectItem value="transfer" className="text-xs">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Valor (R$)</label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Data</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Conta / Cartão</label>
                {accounts.length > 0 && (
                  <Select value={accountId} onValueChange={(val) => val && setAccountId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>{accounts.find(a => a.id === accountId)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="text-xs">{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {type === "transfer" ? (
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Conta Destino</label>
                {accounts.length > 0 && (
                  <Select value={toAccountId} onValueChange={(val) => val && setToAccountId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>{accounts.find(a => a.id === toAccountId)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.id !== accountId).map((acc) => (
                        <SelectItem key={acc.id} value={acc.id} className="text-xs">{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Categoria</label>
                {categories.length > 0 && (
                  <Select value={categoryId} onValueChange={(val) => val && setCategoryId(val)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue>
                        {(() => {
                          const cat = categories.find(c => c.id === categoryId);
                          const CatIcon = getCategoryIcon(cat?.icon || "tag");
                          return (
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="h-3.5 w-3.5 text-zinc-500" />
                              <span>{getCategoryNameFormatted(cat)}</span>
                            </div>
                          );
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getSortedSelectCategories(type).map((cat) => {
                        const CatIcon = getCategoryIcon(cat.icon);
                        const isSub = !!cat.parentId;
                        return (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="h-3.5 w-3.5 text-zinc-500" />
                              <span className={isSub ? "pl-2 font-normal text-zinc-650 dark:text-zinc-400" : "font-bold text-zinc-900 dark:text-zinc-100"}>
                                {isSub ? `↳ ${cat.name}` : cat.name}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" className="w-full mt-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
                Atualizar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza de que deseja excluir o lançamento "${activeTx?.description}"?${activeTx?.parentId ? '\nAviso: Esta transação faz parte de um parcelamento ou recorrência.' : ''}`}
        onConfirm={async () => {
          // Simple deletion of single transaction
          await handleDeleteConfirm(false);
        }}
      />
    </div>
  );
}
