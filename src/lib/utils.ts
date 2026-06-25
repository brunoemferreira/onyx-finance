import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addMonthsUTC(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const currentMonth = d.getUTCMonth();
  d.setUTCMonth(currentMonth + months);

  const expectedMonthResult = (currentMonth + months) % 12;
  const adjustedExpectedMonth = expectedMonthResult < 0 ? expectedMonthResult + 12 : expectedMonthResult;

  if (d.getUTCMonth() !== adjustedExpectedMonth) {
    d.setUTCDate(0); // Volta para o último dia do mês esperado
  }
  return d;
}
