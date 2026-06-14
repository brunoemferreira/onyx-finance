"use client";

import { useEffect, useState } from "react";
import { getBankAccounts, createBankAccount, deleteBankAccount, updateBankAccount } from "@/app/actions/accounts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Wallet, CreditCard as CreditCardIcon, Landmark, PiggyBank } from "lucide-react";

type BankAccount = {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit_card" | "investment" | "cash";
  initialBalance: string;
  creditLimit: string | null;
  closingDay: number | null;
  dueDay: number | null;
  color: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"checking" | "savings" | "credit_card" | "investment" | "cash">("checking");
  const [initialBalance, setInitialBalance] = useState("0");
  const [creditLimit, setCreditLimit] = useState("1000");
  const [closingDay, setClosingDay] = useState("5");
  const [dueDay, setDueDay] = useState("15");

  // Edit Form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"checking" | "savings" | "credit_card" | "investment" | "cash">("checking");
  const [editInitialBalance, setEditInitialBalance] = useState("0");
  const [editCreditLimit, setEditCreditLimit] = useState("1000");
  const [editClosingDay, setEditClosingDay] = useState("5");
  const [editDueDay, setEditDueDay] = useState("15");

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  const openEditDialog = (account: BankAccount) => {
    setActiveAccount(account);
    setEditName(account.name);
    setEditType(account.type);
    setEditInitialBalance(account.initialBalance);
    setEditCreditLimit(account.creditLimit || "1000");
    setEditClosingDay(account.closingDay ? String(account.closingDay) : "5");
    setEditDueDay(account.dueDay ? String(account.dueDay) : "15");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;
    try {
      await updateBankAccount(activeAccount.id, {
        name: editName,
        type: editType,
        initialBalance: editInitialBalance || "0",
        creditLimit: editType === "credit_card" ? editCreditLimit : undefined,
        closingDay: editType === "credit_card" ? parseInt(editClosingDay) : undefined,
        dueDay: editType === "credit_card" ? parseInt(editDueDay) : undefined,
        color: editType === "credit_card" ? "#18181b" : "#27272a",
      });
      setIsEditOpen(false);
      loadAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const openConfirm = (title: string, desc: string, action: () => Promise<void>) => {
    setConfirmTitle(title);
    setConfirmDesc(desc);
    setConfirmAction(() => action);
    setIsConfirmOpen(true);
  };

  const loadAccounts = async () => {
    try {
      const data = await getBankAccounts();
      setAccounts(data as BankAccount[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBankAccount({
        name,
        type,
        initialBalance: initialBalance || "0",
        creditLimit: type === "credit_card" ? creditLimit : undefined,
        closingDay: type === "credit_card" ? parseInt(closingDay) : undefined,
        dueDay: type === "credit_card" ? parseInt(dueDay) : undefined,
        color: type === "credit_card" ? "#18181b" : "#27272a",
      });
      setIsDialogOpen(false);
      // Reset form
      setName("");
      setType("checking");
      setInitialBalance("0");
      loadAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta conta? Todas as transações vinculadas serão apagadas.',
      async () => {
        await deleteBankAccount(id);
        await loadAccounts();
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "credit_card": return <CreditCardIcon className="h-5 w-5" />;
      case "savings": return <PiggyBank className="h-5 w-5" />;
      case "checking": return <Landmark className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const translateType = (type: string) => {
    switch (type) {
      case "credit_card": return "Cartão de Crédito";
      case "savings": return "Poupança";
      case "checking": return "Conta Corrente";
      case "investment": return "Investimento";
      case "cash": return "Dinheiro Físico";
      default: return type;
    }
  };

  const formatBRL = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  return (
  <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Contas e Cartões</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie seus cartões de crédito e saldos de contas bancárias.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 px-4 py-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Conta
          </DialogTrigger>
          <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <DialogHeader>
              <DialogTitle>Nova Conta Financeira</DialogTitle>
              <DialogDescription>Preencha os dados abaixo para cadastrar uma nova conta ou cartão.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Nome da Conta / Banco</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank, Itaú..." required />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo de Conta</label>
                <Select value={type} onValueChange={(v) => v && setType(v as any)}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>{translateType(type)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="cash">Dinheiro Físico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">
                  {type === "credit_card" ? "Saldo Inicial Utilizado" : "Saldo Atual (R$)"}
                </label>
                <Input type="number" step="0.01" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} required />
              </div>

              {type === "credit_card" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Limite Total (R$)</label>
                    <Input type="number" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Fechamento (Dia)</label>
                    <Input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Vencimento (Dia)</label>
                    <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit" className="w-full mt-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
                  Salvar Conta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Carregando contas...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-4">Nenhuma conta cadastrada ainda.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-zinc-200 dark:border-zinc-800">
            Adicione sua primeira conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const isCredit = account.type === "credit_card";
            return (
              <Card key={account.id} className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 relative overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        {getIcon(account.type)}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{account.name}</CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-wider font-medium mt-0.5">{translateType(account.type)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 w-8"
                        onClick={() => openEditDialog(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 h-8 w-8"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {isCredit ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Fatura Atual</span>
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(account.initialBalance)}</span>
                      </div>
                      
                      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-zinc-950 dark:bg-zinc-50 h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (parseFloat(account.initialBalance) / parseFloat(account.creditLimit || "1")) * 100)}%` 
                          }} 
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Limite Usado: {formatBRL(account.initialBalance)}</span>
                        <span>Total: {formatBRL(account.creditLimit || "0")}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-500">
                        <div>Fechamento: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Dia {account.closingDay}</span></div>
                        <div>Vencimento: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Dia {account.dueDay}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Saldo</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(account.initialBalance)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>

    {/* Edit Dialog */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle>Editar Conta Financeira</DialogTitle>
          <DialogDescription>Modifique as propriedades desta conta ou cartão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1">Nome da Conta / Banco</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo de Conta</label>
            <Select value={editType} onValueChange={(v) => v && setEditType(v as any)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue>{translateType(editType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="cash">Dinheiro Físico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1">
              {editType === "credit_card" ? "Saldo Inicial Utilizado" : "Saldo Atual (R$)"}
            </label>
            <Input type="number" step="0.01" value={editInitialBalance} onChange={(e) => setEditInitialBalance(e.target.value)} required />
          </div>

          {editType === "credit_card" && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Limite Total (R$)</label>
                <Input type="number" step="0.01" value={editCreditLimit} onChange={(e) => setEditCreditLimit(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Fechamento (Dia)</label>
                <Input type="number" min="1" max="31" value={editClosingDay} onChange={(e) => setEditClosingDay(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Vencimento (Dia)</label>
                <Input type="number" min="1" max="31" value={editDueDay} onChange={(e) => setEditDueDay(e.target.value)} required />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full mt-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
              Atualizar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={isConfirmOpen}
      setOpen={setIsConfirmOpen}
      title={confirmTitle}
      description={confirmDesc}
      onConfirm={async () => {
        if (confirmAction) await confirmAction();
      }}
    />
    </>
  );
}
