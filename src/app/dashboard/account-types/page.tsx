"use client";

import React, { useEffect, useState } from "react";
import { getAccountTypes, createAccountType, updateAccountType, deleteAccountType } from "@/app/actions/account-types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CleanSelect } from "@/components/ui/clean-select";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Landmark, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  HelpCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  Coins,
  Briefcase,
  Shield,
  Gem,
  Banknote,
  Receipt,
  Scale,
  Store
} from "lucide-react";

type AccountType = {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit_card" | "investment" | "cash";
  icon: string;
  color: string;
  userId: string;
  createdAt: Date;
};

const iconOptions = [
  { value: "landmark", label: "Banco / Instituição", icon: Landmark },
  { value: "piggy-bank", label: "Cofrinho / Poupança", icon: PiggyBank },
  { value: "credit-card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "trending-up", label: "Investimento", icon: TrendingUp },
  { value: "wallet", label: "Carteira / Dinheiro", icon: Wallet },
  { value: "coins", label: "Moedas / Rendimento", icon: Coins },
  { value: "briefcase", label: "Negócios / PJ", icon: Briefcase },
  { value: "shield", label: "Reserva / Proteção", icon: Shield },
  { value: "gem", label: "Bens / Metais", icon: Gem },
  { value: "banknote", label: "Dinheiro Físico", icon: Banknote },
  { value: "receipt", label: "Contas / Despesas", icon: Receipt },
  { value: "scale", label: "Balanço / Contabilidade", icon: Scale },
  { value: "store", label: "Comércio / Loja", icon: Store },
];

const colorOptions = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#22c55e", label: "Verde" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#71717a", label: "Cinza" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#eab308", label: "Amarelo" },
];

const typeTranslations: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  credit_card: "Cartão de Crédito",
  investment: "Investimento",
  cash: "Dinheiro em Espécie",
};

const getIconComponent = (iconName: string) => {
  const match = iconOptions.find(opt => opt.value === iconName);
  return match ? match.icon : Wallet;
};

export default function AccountTypesPage() {
  const [typesList, setTypesList] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeType, setActiveType] = useState<AccountType | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"checking" | "savings" | "credit_card" | "investment" | "cash">("checking");
  const [icon, setIcon] = useState("landmark");
  const [color, setColor] = useState("#3b82f6");

  const loadAccountTypes = async () => {
    try {
      const list = await getAccountTypes();
      setTypesList(list as AccountType[]);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar os tipos de conta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountTypes();
  }, []);

  const openCreateDialog = () => {
    setName("");
    setType("checking");
    setIcon("landmark");
    setColor("#3b82f6");
    setIsCreateOpen(true);
  };

  const openEditDialog = (t: AccountType) => {
    setActiveType(t);
    setName(t.name);
    setType(t.type);
    setIcon(t.icon);
    setColor(t.color);
    setIsEditOpen(true);
  };

  const openConfirm = (t: AccountType) => {
    setActiveType(t);
    setIsConfirmOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, preencha o nome do tipo de conta.");
      return;
    }
    try {
      await createAccountType({ name, type, icon, color });
      setIsCreateOpen(false);
      toast.success("Tipo de conta criado com sucesso!");
      loadAccountTypes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar tipo de conta.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;
    if (!name.trim()) {
      toast.error("Por favor, preencha o nome do tipo de conta.");
      return;
    }
    try {
      await updateAccountType(activeType.id, { name, type, icon, color });
      setIsEditOpen(false);
      toast.success("Tipo de conta atualizado com sucesso!");
      loadAccountTypes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar tipo de conta.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeType) return;
    try {
      await deleteAccountType(activeType.id);
      setIsConfirmOpen(false);
      toast.success("Tipo de conta excluído com sucesso!");
      loadAccountTypes();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível excluir o tipo de conta. Certifique-se de que nenhuma conta está usando este tipo atualmente.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tipos de Conta</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Personalize os tipos de contas e cartões disponíveis para o seu perfil.</p>
        </div>

        <Button onClick={openCreateDialog} className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Tipo de Conta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Carregando tipos de conta...</div>
      ) : typesList.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-4">Nenhum tipo de conta cadastrado.</p>
          <Button onClick={openCreateDialog} variant="outline" className="border-zinc-200 dark:border-zinc-800">
            Adicionar Tipo de Conta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {typesList.map((t) => {
            const IconComp = getIconComponent(t.icon);
            return (
              <Card key={t.id} className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 relative overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-xl text-white flex items-center justify-center"
                      style={{ backgroundColor: t.color }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold truncate">{t.name}</CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-wider font-medium mt-0.5">
                        Base: {typeTranslations[t.type]}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 w-8 cursor-pointer"
                      onClick={() => openEditDialog(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 h-8 w-8 cursor-pointer"
                      onClick={() => openConfirm(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Criar Tipo de Conta</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                Defina um novo tipo de conta personalizado para agrupar e gerenciar seus saldos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">Nome</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Cartão de Benefícios, Investimento Internacional" 
                  className="rounded-xl border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">Comportamento Base</label>
                <CleanSelect 
                  value={type} 
                  onValueChange={(val: any) => setType(val)}
                  options={[
                    { value: "checking", label: "Conta Corrente (Saldos / Transações padrão)" },
                    { value: "savings", label: "Poupança (Reserva financeira)" },
                    { value: "credit_card", label: "Cartão de Crédito (Limite / Faturas / Vencimento)" },
                    { value: "investment", label: "Investimento (Saldos vinculados a ativos)" },
                    { value: "cash", label: "Dinheiro em Espécie (Carteira física)" }
                  ]}
                  placeholder="Selecione um comportamento"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block">Ícone</label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIcon(opt.value)}
                        className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 dark:text-zinc-400"
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="h-4.5 w-4.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block">Cor</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: opt.value }}
                    >
                      {color === opt.value && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-zinc-200 dark:border-zinc-800 cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer">
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Editar Tipo de Conta</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                Altere as configurações do tipo de conta selecionado.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">Nome</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="rounded-xl border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">Comportamento Base</label>
                <CleanSelect 
                  value={type} 
                  onValueChange={(val: any) => setType(val)}
                  options={[
                    { value: "checking", label: "Conta Corrente (Saldos / Transações padrão)" },
                    { value: "savings", label: "Poupança (Reserva financeira)" },
                    { value: "credit_card", label: "Cartão de Crédito (Limite / Faturas / Vencimento)" },
                    { value: "investment", label: "Investimento (Saldos vinculados a ativos)" },
                    { value: "cash", label: "Dinheiro em Espécie (Carteira física)" }
                  ]}
                  placeholder="Selecione um comportamento"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block">Ícone</label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIcon(opt.value)}
                        className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 dark:text-zinc-400"
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="h-4.5 w-4.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider block">Cor</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: opt.value }}
                    >
                      {color === opt.value && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl border-zinc-200 dark:border-zinc-800 cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog 
        open={isConfirmOpen}
        setOpen={setIsConfirmOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o tipo de conta "${activeType?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
