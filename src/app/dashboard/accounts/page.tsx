"use client";

import { useEffect, useState } from "react";
import { getBankAccounts, createBankAccount, deleteBankAccount, updateBankAccount } from "@/app/actions/accounts";
import { getAccountTypes } from "@/app/actions/account-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Check, Wallet, CreditCard as CreditCardIcon, Landmark, PiggyBank } from "lucide-react";
import BankLogo, { getBankDetails } from "@/components/BankLogo";
import BankSelector from "@/components/BankSelector";
import { listarBancos, obterPreset } from "@/lib/bancos-brasil/core.js";
import { toast } from "sonner";

type BankAccount = {
  id: string;
  name: string;
  accountTypeId: string;
  accountType: {
    id: string;
    name: string;
    type: "checking" | "savings" | "credit_card" | "investment" | "cash";
    icon: string;
    color: string;
  };
  initialBalance: string;
  creditLimit: string | null;
  closingDay: number | null;
  dueDay: number | null;
  color: string;
  institution: string;
  agency: string | null;
  accountNumber: string | null;
  accountDigit: string | null;
};

const BANK_NAMES: Record<string, string> = {
  nubank: "Nubank",
  itau: "Itaú",
  bradesco: "Bradesco",
  santander: "Santander",
  bancodobrasil: "Banco do Brasil",
  caixa: "Caixa Econômica",
  inter: "Inter",
  c6: "C6 Bank",
  xp: "XP Investimentos",
  btg: "BTG Pactual",
  sicoob: "Sicoob",
  sicredi: "Sicredi",
  mercadopago: "Mercado Pago",
  picpay: "PicPay",
  cora: "Cora",
  infinitepay: "InfinitePay",
  pagbank: "PagBank",
  digio: "Digio",
  neon: "Neon",
  pan: "Banco Pan",
  safra: "Safra",
  wise: "Wise",
  paypal: "PayPal",
  stripe: "Stripe",
  stone: "Stone",
  next: "Next",
  original: "Banco Original",
  rico: "Rico",
  revolut: "Revolut",
  bs2: "BS2",
  bv: "Banco BV",
  efibank: "EFI Bank",
  ton: "Ton",
  iugu: "Iugu",
  asaas: "Asaas",
  ngcash: "NG.CASH",
  avenue: "Avenue",
  nomad: "Nomad",
  mercantil: "Mercantil",
  bmg: "Banco BMG",
  agibank: "Agibank"
};

const INSTITUTIONS = (() => {
  const list = listarBancos().map((id) => {
    const preset = obterPreset(id);
    return {
      id,
      name: BANK_NAMES[id] || (id.charAt(0).toUpperCase() + id.slice(1)),
      color: preset?.fundo || "#71717a"
    };
  });
  list.push({
    id: "generic",
    name: "Outro / Personalizado",
    color: "#71717a"
  });
  return list.sort((a, b) => {
    if (a.id === "generic") return 1;
    if (b.id === "generic") return -1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
})();

const formatCurrencyBRL = (val: string) => {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "R$ 0,00";
  const num = parseFloat(digits) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
};

const parseCurrencyToFloat = (formatted: string) => {
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return 0;
  return parseFloat(digits) / 100;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [accountTypesList, setAccountTypesList] = useState<any[]>([]);
  const [defaultTypeId, setDefaultTypeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states (Create)
  const [name, setName] = useState("");
  const [accountTypeId, setAccountTypeId] = useState("");
  const [initialBalance, setInitialBalance] = useState("R$ 0,00");
  const [creditLimit, setCreditLimit] = useState("R$ 1.000,00");
  const [closingDay, setClosingDay] = useState("5");
  const [dueDay, setDueDay] = useState("15");
  const [institution, setInstitution] = useState("generic");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [color, setColor] = useState("#71717a");

  // Edit Form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(null);
  const [editName, setEditName] = useState("");
  const [editAccountTypeId, setEditAccountTypeId] = useState("");
  const [editInitialBalance, setEditInitialBalance] = useState("R$ 0,00");
  const [editCreditLimit, setEditCreditLimit] = useState("R$ 1.000,00");
  const [editClosingDay, setEditClosingDay] = useState("5");
  const [editDueDay, setEditDueDay] = useState("15");
  const [editInstitution, setEditInstitution] = useState("generic");
  const [editAgency, setEditAgency] = useState("");
  const [editAccountNumber, setEditAccountNumber] = useState("");
  const [editAccountDigit, setEditAccountDigit] = useState("");
  const [editColor, setEditColor] = useState("#71717a");

  // Derived types
  const selectedTypeInfo = accountTypesList.find(t => t.id === accountTypeId);
  const type = selectedTypeInfo ? selectedTypeInfo.type : "checking";

  const editSelectedTypeInfo = accountTypesList.find(t => t.id === editAccountTypeId);
  const editType = editSelectedTypeInfo ? editSelectedTypeInfo.type : "checking";

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  const openCreateDialog = () => {
    setName("");
    setAccountTypeId(defaultTypeId);
    setInitialBalance("R$ 0,00");
    setCreditLimit("R$ 1.000,00");
    setClosingDay("5");
    setDueDay("15");
    setInstitution("generic");
    setAgency("");
    setAccountNumber("");
    setAccountDigit("");
    setColor("#71717a");
    setIsDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setActiveAccount(account);
    setEditName(account.name);
    setEditAccountTypeId(account.accountTypeId);
    
    const balNum = parseFloat(account.initialBalance || "0");
    setEditInitialBalance(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balNum));
    
    const limNum = parseFloat(account.creditLimit || "1000");
    setEditCreditLimit(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(limNum));
    
    setEditClosingDay(account.closingDay ? String(account.closingDay) : "5");
    setEditDueDay(account.dueDay ? String(account.dueDay) : "15");
    setEditInstitution(account.institution || "generic");
    setEditAgency(account.agency || "");
    setEditAccountNumber(account.accountNumber || "");
    setEditAccountDigit(account.accountDigit || "");
    setEditColor(account.color || "#71717a");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;
    try {
      const balFloat = parseCurrencyToFloat(editInitialBalance);
      const limFloat = parseCurrencyToFloat(editCreditLimit);
      
      await updateBankAccount(activeAccount.id, {
        name: editName,
        accountTypeId: editAccountTypeId,
        initialBalance: balFloat.toFixed(2),
        creditLimit: editType === "credit_card" ? limFloat.toFixed(2) : undefined,
        closingDay: editType === "credit_card" ? parseInt(editClosingDay) : undefined,
        dueDay: editType === "credit_card" ? parseInt(editDueDay) : undefined,
        institution: editInstitution,
        agency: ["checking", "savings", "investment"].includes(editType) ? editAgency : undefined,
        accountNumber: ["checking", "savings", "investment"].includes(editType) ? editAccountNumber : undefined,
        accountDigit: ["checking", "savings", "investment"].includes(editType) ? editAccountDigit : undefined,
        color: editColor,
      });
      setIsEditOpen(false);
      toast.success("Conta atualizada com sucesso!");
      loadAccounts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar conta.");
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
      const [data, types] = await Promise.all([getBankAccounts(), getAccountTypes()]);
      setAccounts(data as BankAccount[]);
      setAccountTypesList(types);
      if (types.length > 0) {
        const checking = types.find(t => t.type === "checking") || types[0];
        setDefaultTypeId(checking.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar as contas.");
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
      const balFloat = parseCurrencyToFloat(initialBalance);
      const limFloat = parseCurrencyToFloat(creditLimit);

      await createBankAccount({
        name,
        accountTypeId,
        initialBalance: balFloat.toFixed(2),
        creditLimit: type === "credit_card" ? limFloat.toFixed(2) : undefined,
        closingDay: type === "credit_card" ? parseInt(closingDay) : undefined,
        dueDay: type === "credit_card" ? parseInt(dueDay) : undefined,
        institution,
        agency: ["checking", "savings", "investment"].includes(type) ? agency : undefined,
        accountNumber: ["checking", "savings", "investment"].includes(type) ? accountNumber : undefined,
        accountDigit: ["checking", "savings", "investment"].includes(type) ? accountDigit : undefined,
        color,
      });
      setIsDialogOpen(false);
      toast.success("Conta cadastrada com sucesso!");
      loadAccounts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cadastrar conta.");
    }
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta conta? Todas as transações vinculadas serão apagadas.',
      async () => {
        try {
          await deleteBankAccount(id);
          toast.success("Conta excluída com sucesso!");
          await loadAccounts();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao excluir conta.");
        }
      }
    );
  };

  const formatBRL = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  const handleInstitutionChange = (val: string, isEdit = false) => {
    const selected = INSTITUTIONS.find(inst => inst.id === val);
    if (selected) {
      if (isEdit) {
        setEditInstitution(val);
        setEditColor(selected.color);
        const wasPredefined = INSTITUTIONS.some(i => i.name === editName) || editName === "";
        if (wasPredefined) {
          setEditName(selected.id === "generic" ? "" : selected.name);
        }
      } else {
        setInstitution(val);
        setColor(selected.color);
        const wasPredefined = INSTITUTIONS.some(i => i.name === name) || name === "";
        if (wasPredefined) {
          setName(selected.id === "generic" ? "" : selected.name);
        }
      }
    }
  };

  return (
  <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Contas e Cartões</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie seus cartões de crédito e saldos de contas bancárias.</p>
        </div>

        <Button onClick={openCreateDialog} className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Conta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Carregando contas...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-4">Nenhuma conta cadastrada ainda.</p>
          <Button onClick={openCreateDialog} variant="outline" className="border-zinc-200 dark:border-zinc-800">
            Adicione sua primeira conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const isCredit = account.accountType?.type === "credit_card";
            return (
              <Card key={account.id} className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 relative overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BankLogo institution={account.institution} type={account.accountType?.type || "checking"} className="h-8 w-8" />
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{account.name}</CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-wider font-medium mt-0.5">{account.accountType?.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 w-8 cursor-pointer"
                        onClick={() => openEditDialog(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 h-8 w-8 cursor-pointer"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 flex flex-col justify-between flex-1">
                  {isCredit ? (
                    <div className="space-y-3 w-full">
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
                    <div className="space-y-3 w-full">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Saldo</span>
                        <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{formatBRL(account.initialBalance)}</span>
                      </div>

                      {["checking", "savings", "investment"].includes(account.accountType?.type || "checking") && (account.agency || account.accountNumber) && (
                        <div className="text-[10px] font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1 rounded border border-zinc-100 dark:border-zinc-900/30 self-start">
                          {account.agency ? `Ag: ${account.agency}` : ""}
                          {account.agency && account.accountNumber ? " • " : ""}
                          {account.accountNumber ? `Cc: ${account.accountNumber}` : ""}
                          {account.accountDigit ? `-${account.accountDigit}` : ""}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>

    {/* Create Dialog */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nova Conta Financeira</DialogTitle>
          <DialogDescription>Preencha os dados abaixo para cadastrar uma nova conta ou cartão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          {/* Campo Instituição em Linha Única */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Instituição Financeira</label>
            <BankSelector value={institution} onValueChange={(v) => handleInstitutionChange(v, false)} type={type} />
          </div>

          {/* Campo Apelido da Conta em Linha Única */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Apelido da Conta</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Minha Conta Principal, Cartão Black..." required className="h-10" />
          </div>

          {/* Tipo de Conta */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Tipo de Conta</label>
            <Select value={accountTypeId} onValueChange={(v) => v && setAccountTypeId(v)}>
              <SelectTrigger className="!w-full h-10 text-xs">
                <SelectValue placeholder="Selecione o tipo de conta">
                  {accountTypesList.find(t => t.id === accountTypeId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 rounded-xl">
                {accountTypesList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seção Condicional de Campos e Saldo */}
          {["checking", "savings", "investment"].includes(type) && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Agência</label>
                <Input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="1234" className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Número Conta</label>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="56789" className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Dígito (DV)</label>
                <Input value={accountDigit} onChange={(e) => setAccountDigit(e.target.value)} placeholder="0" maxLength={2} className="h-10" />
              </div>
              
              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Atual</label>
                <Input 
                  type="text" 
                  value={initialBalance} 
                  onChange={(e) => setInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {type === "credit_card" && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Limite Total</label>
                <Input 
                  type="text" 
                  value={creditLimit} 
                  onChange={(e) => setCreditLimit(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Fechamento (Dia)</label>
                <Input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} required className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Vencimento (Dia)</label>
                <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required className="h-10" />
              </div>

              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Utilizado</label>
                <Input 
                  type="text" 
                  value={initialBalance} 
                  onChange={(e) => setInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {type === "cash" && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Atual</label>
                <Input 
                  type="text" 
                  value={initialBalance} 
                  onChange={(e) => setInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {/* Color Picker dots */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-zinc-500 block mb-2">Cor de Identificação</label>
            <div className="flex flex-wrap gap-2.5">
              {INSTITUTIONS.map((inst) => {
                const isSelected = color === inst.color;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setColor(inst.color)}
                    className="h-7 w-7 rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
                    style={{ 
                      backgroundColor: inst.color,
                      borderColor: isSelected ? "currentColor" : "transparent",
                      boxShadow: isSelected ? `0 0 0 2px bg-white, 0 0 0 4px ${inst.color}` : "none"
                    }}
                    title={inst.name}
                  >
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full h-10 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold cursor-pointer">
              Salvar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Edit Dialog */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Conta Financeira</DialogTitle>
          <DialogDescription>Modifique as propriedades desta conta ou cartão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          {/* Campo Instituição em Linha Única */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Instituição Financeira</label>
            <BankSelector value={editInstitution} onValueChange={(v) => handleInstitutionChange(v, true)} type={editType} />
          </div>

          {/* Campo Apelido da Conta em Linha Única */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Apelido da Conta</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="h-10" />
          </div>

          {/* Tipo de Conta */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Tipo de Conta</label>
            <Select value={editAccountTypeId} onValueChange={(v) => v && setEditAccountTypeId(v)}>
              <SelectTrigger className="!w-full h-10 text-xs">
                <SelectValue placeholder="Selecione o tipo de conta">
                  {accountTypesList.find(t => t.id === editAccountTypeId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 rounded-xl">
                {accountTypesList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seção Condicional de Campos e Saldo */}
          {["checking", "savings", "investment"].includes(editType) && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Agência</label>
                <Input value={editAgency} onChange={(e) => setEditAgency(e.target.value)} placeholder="1234" className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Número Conta</label>
                <Input value={editAccountNumber} onChange={(e) => setEditAccountNumber(e.target.value)} placeholder="56789" className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Dígito (DV)</label>
                <Input value={editAccountDigit} onChange={(e) => setEditAccountDigit(e.target.value)} placeholder="0" maxLength={2} className="h-10" />
              </div>
              
              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Atual</label>
                <Input 
                  type="text" 
                  value={editInitialBalance} 
                  onChange={(e) => setEditInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {editType === "credit_card" && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Limite Total</label>
                <Input 
                  type="text" 
                  value={editCreditLimit} 
                  onChange={(e) => setEditCreditLimit(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Fechamento (Dia)</label>
                <Input type="number" min="1" max="31" value={editClosingDay} onChange={(e) => setEditClosingDay(e.target.value)} required className="h-10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1.5">Vencimento (Dia)</label>
                <Input type="number" min="1" max="31" value={editDueDay} onChange={(e) => setEditDueDay(e.target.value)} required className="h-10" />
              </div>

              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Utilizado</label>
                <Input 
                  type="text" 
                  value={editInitialBalance} 
                  onChange={(e) => setEditInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {editType === "cash" && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div className="col-start-3 col-end-4 text-right">
                <label className="text-xs font-semibold text-zinc-500 block mb-1.5 text-right">Saldo Atual</label>
                <Input 
                  type="text" 
                  value={editInitialBalance} 
                  onChange={(e) => setEditInitialBalance(formatCurrencyBRL(e.target.value))} 
                  required 
                  className="h-10 text-right font-bold w-full"
                />
              </div>
            </div>
          )}

          {/* Color Picker dots */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-zinc-500 block mb-2">Cor de Identificação</label>
            <div className="flex flex-wrap gap-2.5">
              {INSTITUTIONS.map((inst) => {
                const isSelected = editColor === inst.color;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setEditColor(inst.color)}
                    className="h-7 w-7 rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
                    style={{ 
                      backgroundColor: inst.color,
                      borderColor: isSelected ? "currentColor" : "transparent",
                      boxShadow: isSelected ? `0 0 0 2px bg-white, 0 0 0 4px ${inst.color}` : "none"
                    }}
                    title={inst.name}
                  >
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full h-10 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold cursor-pointer">
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
