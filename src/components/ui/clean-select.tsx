"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export interface CleanSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType; 
  color?: string; 
}

interface CleanSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: CleanSelectOption[];
  placeholder?: string;
  searchable?: boolean;
  prefix?: string;
  disabled?: boolean;
}

export function CleanSelect({ value, onValueChange, options, placeholder = "Selecione...", searchable = false, prefix, disabled = false }: CleanSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase().trim();
    return options.filter(o => o.label.toLowerCase().includes(term));
  }, [options, search]);

  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value);
  }, [options, value]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-9 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 flex items-center justify-between bg-transparent text-left focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {SelectedIcon && (
            <SelectedIcon 
              className="h-3.5 w-3.5 flex-shrink-0" 
              style={selectedOption.color ? { color: selectedOption.color } : { color: "currentColor" }}
            />
          )}
          <span className={`text-xs truncate flex items-center ${!selectedOption ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
            {prefix && <span className="text-zinc-400 dark:text-zinc-500 font-medium mr-1.5">{prefix}</span>}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[105%] left-0 right-0 z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-lg p-2 space-y-2 max-h-[300px] flex flex-col">
          {searchable && (
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
          )}

          <div className="space-y-1 overflow-y-auto pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const OptIcon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer ${
                      value === opt.value
                        ? "bg-zinc-50 dark:bg-zinc-900"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {OptIcon && (
                        <OptIcon 
                          className="h-3.5 w-3.5 flex-shrink-0" 
                          style={opt.color ? { color: opt.color } : { color: "currentColor" }}
                        />
                      )}
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {opt.label}
                      </span>
                    </div>
                    {value === opt.value && (
                      <Check className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-zinc-500">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
