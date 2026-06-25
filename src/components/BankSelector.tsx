"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import BankLogo from "./BankLogo";
import { Search, ChevronDown, Check } from "lucide-react";
import { listarBancos, obterPreset } from "@/lib/bancos-brasil/core.js";

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

const POPULAR_BANKS = ["nubank", "itau", "bradesco", "santander", "bancodobrasil", "caixa", "inter", "c6"];

interface BankSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  type?: string;
}

export default function BankSelector({ value, onValueChange, type }: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const allInstitutions = useMemo(() => {
    const list = listarBancos().map((id) => {
      const preset = obterPreset(id);
      return {
        id,
        name: BANK_NAMES[id] || (id.charAt(0).toUpperCase() + id.slice(1)),
        color: preset?.fundo || "#71717a"
      };
    });

    // Add generic
    list.push({
      id: "generic",
      name: "Outro / Personalizado",
      color: "#71717a"
    });

    // Sort alphabetically by name (excluding generic which goes to the bottom)
    return list.sort((a, b) => {
      if (a.id === "generic") return 1;
      if (b.id === "generic") return -1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, []);

  const popularBanks = useMemo(() => {
    // Keep popular list in specified order
    const orderedPopular: typeof allInstitutions = [];
    POPULAR_BANKS.forEach(popId => {
      const found = allInstitutions.find(b => b.id === popId);
      if (found) orderedPopular.push(found);
    });
    return orderedPopular;
  }, [allInstitutions]);

  const filteredInstitutions = useMemo(() => {
    if (!search.trim()) return allInstitutions;
    const term = search.toLowerCase().trim();
    return allInstitutions.filter(b => b.name.toLowerCase().includes(term) || b.id.includes(term));
  }, [allInstitutions, search]);

  const selectedInst = useMemo(() => {
    return allInstitutions.find(i => i.id === value) || allInstitutions.find(i => i.id === "generic");
  }, [allInstitutions, value]);

  const handleSelect = (id: string) => {
    onValueChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-16 border border-zinc-250 dark:border-zinc-850 rounded-xl px-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30 text-left focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
      >
        <div className="flex items-center gap-3">
          <BankLogo institution={selectedInst?.id} type={type} className="h-9 w-9 rounded-lg" />
          <div>
            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm block leading-tight">
              {selectedInst?.name}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
              Instituição selecionada
            </span>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-zinc-400 dark:text-zinc-650 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[105%] left-0 right-0 z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl p-4 space-y-4 max-h-[380px] overflow-y-auto">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-600" />
            <input
              type="text"
              placeholder="Buscar instituição financeira..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-250 dark:border-zinc-850 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Quick Shortcuts (Popular banks) - Only show if not searching */}
          {!search && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
                Bancos Populares
              </span>
              <div className="grid grid-cols-4 gap-2">
                {popularBanks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleSelect(bank.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center gap-1.5 hover:bg-zinc-55 dark:hover:bg-zinc-900 cursor-pointer ${
                      value === bank.id
                        ? "border-zinc-850 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900"
                        : "border-zinc-100 dark:border-zinc-900/60 bg-transparent"
                    }`}
                  >
                    <BankLogo institution={bank.id} className="h-7 w-7 rounded-md" />
                    <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-350 truncate max-w-full">
                      {bank.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of banks */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider block">
              {search ? "Resultados da Busca" : "Todas as Instituições"}
            </span>
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleSelect(bank.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer ${
                      value === bank.id
                        ? "bg-zinc-50 dark:bg-zinc-900"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BankLogo institution={bank.id} className="h-7 w-7 rounded-md" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {bank.name}
                      </span>
                    </div>
                    {value === bank.id && (
                      <Check className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">
                  Nenhum banco encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
