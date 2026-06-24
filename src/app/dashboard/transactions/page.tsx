"use client";

import React, { useEffect, useState } from "react";
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  toggleTransactionClear,
  clearTransactionsBulk
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
  Smile,
  AlertTriangle,
  CheckCircle
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
  documentNumber: string | null;
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

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleIds = paginatedTransactions.map(tx => tx.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedTransactions.map(tx => tx.id);
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkClear = async (isCleared: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      await clearTransactionsBulk(selectedIds, isCleared);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  const [documentNumber, setDocumentNumber] = useState("");
  const [isClearedForm, setIsClearedForm] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedMonthDate, filterType, filterAccount, filterCategory, filterStatus, currentPage]);

  const openCreateDialog = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
    if (accounts.length > 0) setAccountId(accounts[0].id);
    setCategoryId(categories.filter(c => c.type === "expense")[0]?.id || "");
    setDocumentNumber("");
    setIsClearedForm(false);
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
    setDocumentNumber(tx.documentNumber || "");
    setIsClearedForm(tx.isCleared);
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
        isCleared: isClearedForm,
        documentNumber: documentNumber || undefined,
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
        documentNumber: documentNumber || undefined,
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const metrics = filteredTransactions.reduce((acc, tx) => {
    const amount = parseFloat(tx.amount);
    const txDate = new Date(tx.date);
    const isPast = txDate < today;

    // Total Geral
    if (tx.type === "income") {
      acc.totalGeral += amount;
    } else if (tx.type === "expense") {
      acc.totalGeral -= amount;
    }

    if (tx.type === "expense") {
      if (!tx.isCleared) {
        acc.totalAPagar += amount;
        if (isPast) {
          acc.totalVencidas += amount;
        } else {
          acc.totalAVencer += amount;
        }
      } else {
        acc.totalPagos += amount;
      }
    }
    return acc;
  }, {
    totalVencidas: 0,
    totalAVencer: 0,
    totalAPagar: 0,
    totalPagos: 0,
    totalGeral: 0,
  });

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const pages = Math.ceil(sortedTransactions.length / pageSize);
    if (currentPage > pages && pages > 0) {
      setCurrentPage(pages);
    }
  }, [sortedTransactions.length, pageSize, currentPage]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* Vencidas */}
        <div className="rounded-2xl border border-red-200/50 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5 p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-500/85 dark:text-red-400/80">Vencidas</p>
            <div className="p-1.5 rounded-lg bg-red-100/70 dark:bg-red-950/40 text-red-650 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-650 dark:text-red-400 mt-1">{formatCurrency(metrics.totalVencidas)}</p>
        </div>

        {/* A Vencer */}
        <div className="rounded-2xl border border-amber-200/50 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5 p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500/85 dark:text-amber-400/80">A Vencer</p>
            <div className="p-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 text-amber-650 dark:text-amber-450">
              <Calendar className="h-4 w-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-650 dark:text-amber-450 mt-1">{formatCurrency(metrics.totalAVencer)}</p>
        </div>

        {/* A Pagar */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">A Pagar</p>
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400">
              <Wallet className="h-4 w-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-1">{formatCurrency(metrics.totalAPagar)}</p>
        </div>

        {/* Pagos */}
        <div className="rounded-2xl border border-emerald-200/50 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/5 p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500/85 dark:text-emerald-450/85">Pagos</p>
            <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-650 dark:text-emerald-400 mt-1">{formatCurrency(metrics.totalPagos)}</p>
        </div>

        {/* Total Geral */}
        <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-300">Total Geral</p>
            <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <DollarSign className="h-4 w-4 stroke-[2.2]" />
            </div>
          </div>
          <p className={`text-xl font-bold mt-1 ${metrics.totalGeral >= 0 ? "text-emerald-650 dark:text-emerald-450" : "text-red-650 dark:text-red-400"}`}>
            {formatCurrency(metrics.totalGeral)}
          </p>
        </div>
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

      {/* Barra de Ações em Lote */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {selectedIds.length} {selectedIds.length === 1 ? "lançamento selecionado" : "lançamentos selecionados"}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={() => handleBulkClear(true)}
              className="bg-emerald-650 hover:bg-emerald-700 text-white flex-1 sm:flex-initial h-8 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              Liquidar selecionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkClear(false)}
              className="border-zinc-300 dark:border-zinc-850 bg-transparent text-zinc-750 dark:text-zinc-350 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex-1 sm:flex-initial h-8 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Marcar como Pendente
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 h-8 text-xs rounded-lg cursor-pointer"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

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
                  <TableHead className="w-10 px-3 text-center">
                    <input 
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 focus:ring-zinc-950 cursor-pointer"
                      checked={paginatedTransactions.length > 0 && paginatedTransactions.every(tx => selectedIds.includes(tx.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead className="px-4 text-xs font-medium w-32">Nº Documento</TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Vencimento {renderSortArrow("date")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 transition-colors"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      Descrição {renderSortArrow("description")}
                    </div>
                  </TableHead>
                  <TableHead className="px-4 text-xs font-medium w-32">Status</TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 transition-colors"
                    onClick={() => handleSort("categoryName")}
                  >
                    <div className="flex items-center gap-1">
                      Categoria {renderSortArrow("categoryName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 transition-colors"
                    onClick={() => handleSort("accountName")}
                  >
                    <div className="flex items-center gap-1">
                      Conta {renderSortArrow("accountName")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right text-xs font-medium cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 px-2 transition-colors"
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
                {paginatedTransactions.map((tx, idx) => {
                  const isInc = tx.type === "income";
                  const isTrans = tx.type === "transfer";
                  const dateStr = formatDate(tx.date);

                  const nextTx = paginatedTransactions[idx + 1];
                  const isLastOfToday = !nextTx || formatDate(nextTx.date) !== dateStr;

                  // Status badge calculations
                  const isCleared = tx.isCleared;
                  const txDate = new Date(tx.date);
                  const isPast = txDate < today;

                  let statusText = "";
                  let badgeClass = "";

                  if (isCleared) {
                    statusText = tx.type === "income" ? "RECEBIDO" : "PAGO";
                    badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30";
                  } else {
                    if (isPast) {
                      statusText = "VENCIDO";
                      badgeClass = "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-200/50 dark:border-red-900/30";
                    } else {
                      statusText = "A VENCER";
                      badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
                    }
                  }

                  return (
                    <React.Fragment key={tx.id}>
                      <TableRow className="border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 h-8">
                        <TableCell className="w-10 px-3 text-center">
                          <input 
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 focus:ring-zinc-950 cursor-pointer"
                            checked={selectedIds.includes(tx.id)}
                            onChange={(e) => handleSelectOne(tx.id, e.target.checked)}
                          />
                        </TableCell>
                        {/* 1. Nº Documento */}
                        <TableCell className="py-1 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {tx.documentNumber || "-"}
                        </TableCell>

                        {/* 2. Vencimento */}
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

                        {/* 4. Status Badge */}
                        <TableCell className="py-1 px-4 text-xs">
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold ${badgeClass}`}>
                            {statusText}
                          </span>
                        </TableCell>

                        {/* 5. Categoria */}
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

                        {/* 6. Conta */}
                        <TableCell className="py-1 text-xs text-zinc-500 dark:text-zinc-400">{tx.accountName}</TableCell>

                        {/* 7. Valor */}
                        <TableCell className={`text-right py-1 text-xs font-normal ${
                          isInc 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : isTrans 
                              ? "text-zinc-500" 
                              : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {isInc ? "+" : isTrans ? "" : "-"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(tx.amount))}
                        </TableCell>

                        {/* 8. Saldo */}
                        {showBalances && (
                          <TableCell className="text-right py-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                            {computedTxBalances[tx.id] !== undefined
                              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(computedTxBalances[tx.id])
                              : "-"}
                          </TableCell>
                        )}

                        {/* 9. Ações */}
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
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-3 rounded-b-xl flex items-center justify-between text-zinc-500 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">Itens por página:</span>
              <div className="flex items-center gap-2">
                {[15, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      pageSize === size
                        ? "bg-[#0B4F83] text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {(() => {
                const pageButtons = [];
                const maxVisiblePages = 5;

                const addPageButton = (page: number) => {
                  pageButtons.push(
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 flex items-center justify-center text-xs font-semibold rounded transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-[#0B4F83] text-white"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                };

                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) {
                    addPageButton(i);
                  }
                } else {
                  addPageButton(1);
                  let start = Math.max(2, currentPage - 1);
                  let end = Math.min(totalPages - 1, currentPage + 1);

                  if (currentPage <= 3) {
                    end = 4;
                  }
                  if (currentPage >= totalPages - 2) {
                    start = totalPages - 3;
                  }

                  if (start > 2) {
                    pageButtons.push(<span key="ellipsis-1" className="text-xs text-zinc-450 px-1 select-none">...</span>);
                  }

                  for (let i = start; i <= end; i++) {
                    addPageButton(i);
                  }

                  if (end < totalPages - 1) {
                    pageButtons.push(<span key="ellipsis-2" className="text-xs text-zinc-450 px-1 select-none">...</span>);
                  }

                  addPageButton(totalPages);
                }

                return (
                  <>
                    {pageButtons}
                    <button
                      type="button"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-zinc-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* 1. Modal de Criação (Novo Lançamento) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            <DialogDescription>Insira os detalhes da transação financeira.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Nº Documento</label>
                <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Ex: NF-12345, Fatura..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Descrição</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Mercado, Academia, Salário..." required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Tipo</label>
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

              {type === "transfer" ? (
                <div>
                  <label className="text-xs font-semibold text-zinc-550 block mb-1">Conta Destino</label>
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
                  <label className="text-xs font-semibold text-zinc-550 block mb-1">Categoria</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Data de Vencimento</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Valor (R$)</label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input 
                  type="checkbox" 
                  id="isClearedForm" 
                  checked={isClearedForm} 
                  onChange={(e) => setIsClearedForm(e.target.checked)} 
                  className="rounded border-zinc-350 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="isClearedForm" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  Lançamento pago/recebido (Liquidado)
                </label>
              </div>
            </div>

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
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800 cursor-pointer"
                    />
                    <label htmlFor="isInstallment" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Compra parcelada</label>
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
                    className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 dark:border-zinc-800 cursor-pointer"
                  />
                  <label htmlFor="isRecurring" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">Lançamento recorrente fixo</label>
                </div>

                {isRecurring && (
                  <div className="pl-5">
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Frequência</label>
                    <Select value={recurrencePeriod} onValueChange={(v: any) => setRecurrencePeriod(v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue>
                          {recurrencePeriod === "weekly" ? "Semanal" : recurrencePeriod === "monthly" ? "Mensal" : recurrencePeriod === "yearly" ? "Anual" : ""}
                        </SelectValue>
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
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
            <DialogDescription>Modifique as propriedades deste lançamento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Nº Documento</label>
                <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Ex: NF-12345, Fatura..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Descrição</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Tipo</label>
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

              {type === "transfer" ? (
                <div>
                  <label className="text-xs font-semibold text-zinc-550 block mb-1">Conta Destino</label>
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
                  <label className="text-xs font-semibold text-zinc-550 block mb-1">Categoria</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Data de Vencimento</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Conta / Cartão</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-550 block mb-1">Valor (R$)</label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
            </div>
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
