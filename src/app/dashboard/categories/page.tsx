"use client";

import React, { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Home, 
  Car, 
  PartyPopper, 
  Briefcase, 
  TrendingUp, 
  Utensils, 
  Tag,
  Lock,
  Globe,
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
  Check,
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
  Calendar,
  Smile
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  userId: string | null;
  parentId: string | null;
};

const iconOptions = [
  { value: "tag", label: "Geral", icon: Tag },
  { value: "utensils", label: "Alimentação", icon: Utensils },
  { value: "home", label: "Moradia", icon: Home },
  { value: "car", label: "Transporte", icon: Car },
  { value: "party-popper", label: "Lazer", icon: PartyPopper },
  { value: "briefcase", label: "Salário / Trabalho", icon: Briefcase },
  { value: "trending-up", label: "Investimentos", icon: TrendingUp },
  { value: "shopping-bag", label: "Compras", icon: ShoppingBag },
  { value: "coffee", label: "Café / Lanches", icon: Coffee },
  { value: "clapperboard", label: "Cinema / Diversão", icon: Clapperboard },
  { value: "dumbbell", label: "Academia", icon: Dumbbell },
  { value: "heart-pulse", label: "Saúde", icon: HeartPulse },
  { value: "graduation-cap", label: "Educação", icon: GraduationCap },
  { value: "plane", label: "Viagem", icon: Plane },
  { value: "bus", label: "Transporte Público", icon: Bus },
  { value: "wrench", label: "Serviços", icon: Wrench },
  { value: "wifi", label: "Internet / TV", icon: Wifi },
  { value: "lightbulb", label: "Luz / Energia", icon: Lightbulb },
  { value: "phone", label: "Telefone / Celular", icon: Phone },
  { value: "shield", label: "Seguros", icon: Shield },
  { value: "gift", label: "Presentes", icon: Gift },
  { value: "piggy-bank", label: "Poupança / Reserva", icon: PiggyBank },
  { value: "coins", label: "Outros Rendimentos", icon: Coins },
  { value: "shirt", label: "Vestuário", icon: Shirt },
  { value: "sparkles", label: "Beleza / Estética", icon: Sparkles },
  { value: "paw-print", label: "Pets / Animais", icon: PawPrint },
  { value: "baby", label: "Crianças / Bebês", icon: Baby },
  { value: "stethoscope", label: "Consultas / Exames", icon: Stethoscope },
  { value: "receipt", label: "Impostos / Taxas", icon: Receipt },
  { value: "heart", label: "Doações / Caridade", icon: Heart },
  { value: "book-open", label: "Livros / Cursos", icon: BookOpen },
  { value: "gamepad-2", label: "Jogos / Games", icon: Gamepad2 },
  { value: "plug", label: "Utilidades domésticas", icon: Plug },
  { value: "store", label: "Lojas / Comércio", icon: Store },
  { value: "hammer", label: "Reforma / Obras", icon: Hammer },
  { value: "smartphone", label: "Eletrônicos / Apps", icon: Smartphone },
  { value: "music", label: "Música / Streaming", icon: Music },
  { value: "wine", label: "Bebidas / Bares", icon: Wine },
  { value: "flame", label: "Gás / Aquecimento", icon: Flame },
  { value: "trash", label: "Limpeza / Condomínio", icon: Trash },
  { value: "tv", label: "Assinaturas / Lazer", icon: Tv },
  { value: "user", label: "Pessoal / Cuidados", icon: User },
  { value: "users", label: "Família / Dependentes", icon: Users },
  { value: "camera", label: "Fotografia / Lazer", icon: Camera },
  { value: "scissors", label: "Salão / Barbearia", icon: Scissors },
  { value: "map-pin", label: "Localização / Turismo", icon: MapPin },
  { value: "ticket", label: "Eventos / Ingressos", icon: Ticket },
  { value: "bike", label: "Bicicleta / Mobilidade", icon: Bike },
  { value: "shield-alert", label: "Emergências / Multas", icon: ShieldAlert },
  { value: "sparkle", label: "Lavanderia / Limpeza", icon: Sparkle },
  { value: "dollar-sign", label: "Empréstimos / Receitas", icon: DollarSign },
  { value: "award", label: "Premiações / Bônus", icon: Award },
  { value: "wallet", label: "Dinheiro / Carteira", icon: Wallet },
  { value: "credit-card", label: "Tarifas de Cartão", icon: CreditCard },
  { value: "book", label: "Leitura / Livraria", icon: Book },
  { value: "laptop", label: "Tecnologia / Hardware", icon: Laptop },
  { value: "activity", label: "Monitoramento / Saúde", icon: Activity },
  { value: "key", label: "Aluguel / Imóveis", icon: Key },
  { value: "compass", label: "Exploração / Viagens", icon: Compass },
  { value: "calendar", label: "Mensalidades / Assinaturas", icon: Calendar },
  { value: "smile", label: "Bem-estar / Lazer", icon: Smile },
];

const colorOptions = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f87171", label: "Vermelho Claro" },
  { value: "#f97316", label: "Laranja" },
  { value: "#fb923c", label: "Laranja Claro" },
  { value: "#f59e0b", label: "Âmbar" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#84cc16", label: "Lima" },
  { value: "#22c55e", label: "Verde" },
  { value: "#10b981", label: "Esmeralda" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#0ea5e9", label: "Sky" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#6366f1", label: "Índigo" },
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#d946ef", label: "Fúcsia" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#71717a", label: "Cinza" },
];

const getCategoryIcon = (iconName: string) => {
  const match = iconOptions.find(opt => opt.value === iconName);
  return match ? match.icon : Tag;
};

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [icon, setIcon] = useState("tag");
  const [color, setColor] = useState("#71717a");
  const [parentId, setParentId] = useState<string>("none");

  const loadCategories = async () => {
    try {
      const list = await getCategories();
      setCategoriesList(list as Category[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateDialog = (preSelectedParentId?: string) => {
    setName("");
    setType("expense");
    setIcon("tag");
    setColor("#ef4444");
    setParentId(preSelectedParentId || "none");
    
    if (preSelectedParentId) {
      const parent = categoriesList.find(c => c.id === preSelectedParentId);
      if (parent) {
        setType(parent.type);
        setColor(parent.color);
      }
    }
    
    setIsCreateOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setActiveCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setParentId(cat.parentId || "none");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (cat: Category) => {
    setActiveCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({ 
        name, 
        type, 
        icon, 
        color, 
        parentId: parentId === "none" ? null : parentId 
      });
      setIsCreateOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    try {
      await updateCategory(activeCategory.id, { 
        name, 
        type, 
        icon, 
        color, 
        parentId: parentId === "none" ? null : parentId 
      });
      setIsEditOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeCategory) return;
    try {
      await deleteCategory(activeCategory.id);
      setIsDeleteOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Separar categorias principais (sem pai) das subcategorias
  const parentCategories = categoriesList.filter(c => !c.parentId);
  const subcategories = categoriesList.filter(c => c.parentId);

  // Filtrar categorias principais com base na tab ativa
  const filteredParents = parentCategories.filter((cat) => {
    if (filterType !== "all" && cat.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Categorias</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Organize suas finanças com categorias e subcategorias.</p>
        </div>

        <Button 
          onClick={() => openCreateDialog()} 
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 h-9"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-900 pb-px">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            filterType === "all"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterType("income")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            filterType === "income"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
          }`}
        >
          Receitas
        </button>
        <button
          onClick={() => setFilterType("expense")}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            filterType === "expense"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
          }`}
        >
          Despesas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">Carregando categorias...</div>
      ) : filteredParents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-900">
          <p className="text-zinc-500 text-sm">Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredParents.map((cat) => {
            const CatIcon = getCategoryIcon(cat.icon);
            const children = subcategories.filter(sub => sub.parentId === cat.id);
            return (
              <Card key={cat.id} className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/50 flex flex-col justify-between">
                <CardContent className="p-4 flex flex-col flex-1 gap-4">
                  {/* Header da Categoria Pai */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ 
                          backgroundColor: `${cat.color}20`, 
                          borderColor: cat.color,
                          color: cat.color 
                        }}
                      >
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">{cat.name}</span>
                        <span className={`self-start inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold mt-0.5 ${
                          cat.type === "income" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" 
                            : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                        }`}>
                          {cat.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-7 w-7 rounded-lg"
                        onClick={() => openCreateDialog(cat.id)}
                        title="Adicionar Subcategoria"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 h-7 w-7 rounded-lg"
                        onClick={() => openEditDialog(cat)}
                        title="Editar Categoria"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/20 h-7 w-7 rounded-lg"
                        onClick={() => openDeleteDialog(cat)}
                        title="Excluir Categoria"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Subcategorias */}
                  <div className="flex-1 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900/50">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Subcategorias</div>
                    {children.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-650 italic">Sem subcategorias</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {children.map(sub => {
                          const SubIcon = getCategoryIcon(sub.icon);
                          return (
                            <div key={sub.id} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900/20 group">
                              <div className="flex items-center gap-2 min-w-0">
                                <SubIcon className="h-3.5 w-3.5 text-zinc-450 shrink-0" style={{ color: sub.color }} />
                                <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{sub.name}</span>
                              </div>
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                <button 
                                  onClick={() => openEditDialog(sub)}
                                  className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-0.5 rounded"
                                  title="Editar Subcategoria"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => openDeleteDialog(sub)}
                                  className="text-zinc-400 hover:text-red-500 p-0.5 rounded"
                                  title="Excluir Subcategoria"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* modal de criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Nova Categoria / Subcategoria</DialogTitle>
            <DialogDescription>Crie uma categoria principal ou subcategoria vinculada.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Supermercado, Aluguel, Cinema..." required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Categoria Pai (Opcional)</label>
                <Select value={parentId} onValueChange={(v) => {
                  const val = v || "none";
                  setParentId(val);
                  if (val !== "none") {
                    const parent = categoriesList.find(c => c.id === val);
                    if (parent) {
                      setType(parent.type);
                      setColor(parent.color);
                    }
                  }
                }}>
                  <SelectTrigger className="!w-full h-8 text-xs">
                    <SelectValue>
                      {parentId === "none" ? "Nenhuma (Categoria Principal)" : parentCategories.find(c => c.id === parentId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs font-semibold">Nenhuma (Categoria Principal)</SelectItem>
                    {parentCategories.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo</label>
                <Select 
                  value={type} 
                  onValueChange={(v: any) => setType(v)}
                  disabled={parentId !== "none"}
                >
                  <SelectTrigger className="!w-full h-8 text-xs">
                    <SelectValue>{type === 'expense' ? 'Despesa' : 'Receita'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Despesa</SelectItem>
                    <SelectItem value="income" className="text-xs">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seletor Visual de Bolinhas Coloridas */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-2">Cor</label>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => {
                  const isSelected = color === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      disabled={parentId !== "none"}
                      onClick={() => setColor(c.value)}
                      className={`h-7 w-7 rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
                        parentId !== "none" ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      style={{ 
                        backgroundColor: c.value,
                        borderColor: isSelected ? "currentColor" : "transparent",
                        boxShadow: isSelected ? `0 0 0 2px bg-white, 0 0 0 4px ${c.value}` : "none"
                      }}
                      title={c.label}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                      )}
                    </button>
                  );
                })}
              </div>
              {parentId !== "none" && (
                <span className="text-[10px] text-zinc-400 mt-1 block">As subcategorias herdam a cor da categoria pai.</span>
              )}
            </div>

            {/* Seletor de Ícones (35 opções, rolável) */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Ícone</label>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-36 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIcon(opt.value)}
                        className={`h-9 w-full rounded-lg flex items-center justify-center border transition-colors ${
                          isSelected 
                            ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:border-zinc-50"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                        }`}
                        title={opt.label}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="h-8 text-xs">Cancelar</Button>
              <Button type="submit" className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 h-8 text-xs">Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* modal de edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Editar Categoria / Subcategoria</DialogTitle>
            <DialogDescription>Modifique os detalhes do registro selecionado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Categoria Pai (Opcional)</label>
                <Select value={parentId} onValueChange={(v) => {
                  const val = v || "none";
                  setParentId(val);
                  if (val !== "none") {
                    const parent = categoriesList.find(c => c.id === val);
                    if (parent) {
                      setType(parent.type);
                      setColor(parent.color);
                    }
                  }
                }}>
                  <SelectTrigger className="!w-full h-8 text-xs">
                    <SelectValue>
                      {parentId === "none" ? "Nenhuma (Categoria Principal)" : parentCategories.find(c => c.id === parentId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs font-semibold">Nenhuma (Categoria Principal)</SelectItem>
                    {/* Evitar que a própria categoria seja selecionada como pai */}
                    {parentCategories.filter(p => p.id !== activeCategory?.id).map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Tipo</label>
                <Select 
                  value={type} 
                  onValueChange={(v: any) => setType(v)}
                  disabled={parentId !== "none"}
                >
                  <SelectTrigger className="!w-full h-8 text-xs">
                    <SelectValue>{type === 'expense' ? 'Despesa' : 'Receita'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense" className="text-xs">Despesa</SelectItem>
                    <SelectItem value="income" className="text-xs">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seletor Visual de Bolinhas Coloridas */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-2">Cor</label>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => {
                  const isSelected = color === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      disabled={parentId !== "none"}
                      onClick={() => setColor(c.value)}
                      className={`h-7 w-7 rounded-full border transition-all hover:scale-110 flex items-center justify-center cursor-pointer ${
                        parentId !== "none" ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      style={{ 
                        backgroundColor: c.value,
                        borderColor: isSelected ? "currentColor" : "transparent",
                        boxShadow: isSelected ? `0 0 0 2px bg-white, 0 0 0 4px ${c.value}` : "none"
                      }}
                      title={c.label}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                      )}
                    </button>
                  );
                })}
              </div>
              {parentId !== "none" && (
                <span className="text-[10px] text-zinc-400 mt-1 block">As subcategorias herdam a cor da categoria pai.</span>
              )}
            </div>

            {/* Seletor de Ícones (35 opções, rolável) */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 block mb-1">Ícone</label>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-36 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = icon === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIcon(opt.value)}
                        className={`h-9 w-full rounded-lg flex items-center justify-center border transition-colors ${
                          isSelected 
                            ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:border-zinc-50"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                        }`}
                        title={opt.label}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-8 text-xs">Cancelar</Button>
              <Button type="submit" className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 h-8 text-xs">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* modal de exclusão */}
      <ConfirmDialog
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        title="Excluir Registro"
        description={`Tem certeza que deseja excluir "${activeCategory?.name}"? Se for uma categoria pai, todas as suas subcategorias também serão deletadas de forma definitiva.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
