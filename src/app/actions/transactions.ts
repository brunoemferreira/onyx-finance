"use server";

import { db } from "@/db";
import { transactions, bankAccounts, categories } from "@/db/schema";
import { getUserId } from "./accounts";
import { eq, and, desc, sql as drizzleSql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addMonthsUTC } from "@/lib/utils";

// 1. Listar todas as transações com joins para nomes de conta e categoria
export async function getTransactions() {
  const userId = await getUserId();
  try {
    return await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        isCleared: transactions.isCleared,
        isInstallment: transactions.isInstallment,
        currentInstallment: transactions.currentInstallment,
        totalInstallments: transactions.totalInstallments,
        isRecurring: transactions.isRecurring,
        recurrencePeriod: transactions.recurrencePeriod,
        parentId: transactions.parentId,
        accountName: bankAccounts.name,
        accountId: bankAccounts.id,
        categoryName: categories.name,
        categoryId: categories.id,
        toAccountName: drizzleSql<string | null>`(SELECT name FROM bank_account WHERE id = ${transactions.toAccountId})`,
        documentNumber: transactions.documentNumber,
        paymentMethod: transactions.paymentMethod,
        notes: transactions.notes,
        receiptUrl: transactions.receiptUrl,
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  } catch (error) {
    console.error("Erro ao obter transações:", error);
    throw new Error("Não foi possível listar as transações.");
  }
}

// Helper para atualizar o saldo da conta
async function updateAccountBalance(accountId: string, amountChange: number) {
  await db.execute(
    drizzleSql`UPDATE bank_account SET initial_balance = initial_balance + ${amountChange} WHERE id = ${accountId}`
  );
}

// 2. Criar Transação (Suporta Simples, Transferência, Parcelamento e Recorrência)
export async function createTransaction(data: {
  description: string;
  amount: string; // Ex: "150.00"
  type: "income" | "expense" | "transfer";
  date: string; // ISO string
  accountId: string;
  categoryId?: string;
  toAccountId?: string;
  isInstallment?: boolean;
  totalInstallments?: number;
  isRecurring?: boolean;
  recurrencePeriod?: "none" | "weekly" | "monthly" | "yearly";
  isCleared?: boolean;
  documentNumber?: string;
  paymentMethod?: string;
  notes?: string;
  receiptUrl?: string;
}) {
  const userId = await getUserId();
  // Parse date as UTC midnight to avoid local timezone shifts
  const [y, m, d] = data.date.split("-").map(Number);
  const baseDate = new Date(Date.UTC(y, m - 1, d));
  const numAmount = parseFloat(data.amount);
  const isCleared = data.isCleared ?? false;
  
  try {
    // Caso 1: Lançamento Parcelado (Instalment)
    if (data.isInstallment && data.totalInstallments && data.totalInstallments > 1) {
      const parentId = crypto.randomUUID();
      const installmentAmount = (numAmount / data.totalInstallments).toFixed(2);
      
      const insertPromises = [];
      for (let i = 1; i <= data.totalInstallments; i++) {
        const installmentDate = addMonthsUTC(baseDate, i - 1);

        insertPromises.push(
          db.insert(transactions).values({
            userId,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            amount: installmentAmount,
            type: data.type,
            date: installmentDate,
            description: `${data.description} (${i}/${data.totalInstallments})`,
            isInstallment: true,
            currentInstallment: i,
            totalInstallments: data.totalInstallments,
            parentId,
            isCleared: i === 1 ? isCleared : false,
            documentNumber: data.documentNumber || null,
            paymentMethod: data.paymentMethod || null,
            notes: data.notes || null,
            receiptUrl: data.receiptUrl || null,
          })
        );
      }

      await Promise.all(insertPromises);

      // Atualiza o saldo apenas com a primeira parcela se ela for liquidada
      if (isCleared) {
        const factor = data.type === "income" ? 1 : -1;
        await updateAccountBalance(data.accountId, parseFloat(installmentAmount) * factor);
      }
    }
    // Caso 2: Lançamento Recorrente (Simulação de 12 meses adiantados)
    else if (data.isRecurring && data.recurrencePeriod && data.recurrencePeriod !== "none") {
      const parentId = crypto.randomUUID();
      const insertPromises = [];
      
      // Criamos a primeira hoje (efetivada) e as 11 próximas agendadas (não efetivadas)
      for (let i = 0; i < 12; i++) {
        let recurringDate = new Date(baseDate);
        if (data.recurrencePeriod === "weekly") {
          recurringDate.setDate(baseDate.getDate() + (i * 7));
        } else if (data.recurrencePeriod === "monthly") {
          recurringDate = addMonthsUTC(baseDate, i);
        } else if (data.recurrencePeriod === "yearly") {
          recurringDate.setFullYear(baseDate.getFullYear() + i);
        }

        insertPromises.push(
          db.insert(transactions).values({
            userId,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            amount: data.amount,
            type: data.type,
            date: recurringDate,
            description: data.description,
            isRecurring: true,
            recurrencePeriod: data.recurrencePeriod,
            parentId,
            isCleared: i === 0 ? isCleared : false,
            documentNumber: data.documentNumber || null,
            paymentMethod: data.paymentMethod || null,
            notes: data.notes || null,
            receiptUrl: data.receiptUrl || null,
          })
        );
      }

      await Promise.all(insertPromises);

      // Atualiza o saldo da conta com a primeira recorrência se for liquidada
      if (isCleared) {
        const factor = data.type === "income" ? 1 : -1;
        await updateAccountBalance(data.accountId, numAmount * factor);
      }
    }
    // Caso 3: Lançamento Simples ou Transferência
    else {
      const [newTx] = await db.insert(transactions).values({
        userId,
        accountId: data.accountId,
        categoryId: data.type === "transfer" ? null : data.categoryId || null,
        toAccountId: data.type === "transfer" ? data.toAccountId : null,
        amount: data.amount,
        type: data.type,
        date: baseDate,
        description: data.description,
        isCleared: isCleared,
        documentNumber: data.documentNumber || null,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
        receiptUrl: data.receiptUrl || null,
      }).returning();

      // Ajusta Saldos se for liquidado
      if (newTx.isCleared) {
        if (data.type === "transfer" && data.toAccountId) {
          // Retira da de origem, adiciona na de destino
          await updateAccountBalance(data.accountId, -numAmount);
          await updateAccountBalance(data.toAccountId, numAmount);
        } else {
          const factor = data.type === "income" ? 1 : -1;
          await updateAccountBalance(data.accountId, numAmount * factor);
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    throw new Error("Não foi possível criar o lançamento.");
  }
}

// 3. Atualizar Transação
export async function updateTransaction(
  id: string,
  data: {
    description: string;
    amount: string;
    type: "income" | "expense" | "transfer";
    date: string;
    accountId: string;
    categoryId?: string;
    toAccountId?: string;
    documentNumber?: string;
    paymentMethod?: string;
    notes?: string;
    receiptUrl?: string;
    editMode?: "single" | "future" | "all";
  }
) {
  const userId = await getUserId();
  // Parse date as UTC midnight to avoid local timezone shifts
  const [y, m, d] = data.date.split("-").map(Number);
  const baseDate = new Date(Date.UTC(y, m - 1, d));
  const numAmount = parseFloat(data.amount);

  try {
    // 1. Busca transação antiga para reverter saldos
    const [oldTx] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (!oldTx) throw new Error("Lançamento não encontrado.");

    let targetTxs = [oldTx];

    // Se houver parentId e o modo não for single, buscamos as outras parcelas
    if (oldTx.parentId && data.editMode && data.editMode !== "single") {
      const allSeries = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.parentId, oldTx.parentId), eq(transactions.userId, userId)));
      
      if (data.editMode === "future") {
        targetTxs = allSeries.filter(t => t.currentInstallment && oldTx.currentInstallment && t.currentInstallment >= oldTx.currentInstallment);
      } else if (data.editMode === "all") {
        targetTxs = allSeries;
      }
    }

    // Processar cada transação alvo
    for (const tx of targetTxs) {
      const txOldAmount = parseFloat(tx.amount);

      // Reverte saldo antigo
      if (tx.isCleared) {
        if (tx.type === "transfer" && tx.toAccountId) {
          await updateAccountBalance(tx.accountId, txOldAmount);
          await updateAccountBalance(tx.toAccountId, -txOldAmount);
        } else {
          const factor = tx.type === "income" ? -1 : 1;
          await updateAccountBalance(tx.accountId, txOldAmount * factor);
        }
      }

      // Calcula a nova data preservando o mês da parcela original
      const txDate = new Date(tx.date);
      // Mantemos o ano e mês originais, e atualizamos o dia pelo novo dia escolhido (cuidando para não ultrapassar o último dia do mês)
      const txYear = txDate.getUTCFullYear();
      const txMonth = txDate.getUTCMonth();
      // Encontrar o último dia do mês original para evitar overflow
      const lastDayOfMonth = new Date(Date.UTC(txYear, txMonth + 1, 0)).getUTCDate();
      const newDay = Math.min(d, lastDayOfMonth);
      const newTxDate = new Date(Date.UTC(txYear, txMonth, newDay));

      // 2. Executa a atualização
      await db
        .update(transactions)
        .set({
          description: data.description,
          amount: data.amount,
          type: data.type,
          date: newTxDate,
          accountId: data.accountId,
          categoryId: data.type === "transfer" ? null : data.categoryId || null,
          toAccountId: data.type === "transfer" ? data.toAccountId : null,
          documentNumber: data.documentNumber || null,
          paymentMethod: data.paymentMethod || null,
          notes: data.notes || null,
          receiptUrl: data.receiptUrl || null,
        })
        .where(and(eq(transactions.id, tx.id), eq(transactions.userId, userId)));

      // 3. Aplica o novo saldo
      if (tx.isCleared) {
        if (data.type === "transfer" && data.toAccountId) {
          await updateAccountBalance(data.accountId, -numAmount);
          await updateAccountBalance(data.toAccountId, numAmount);
        } else {
          const factor = data.type === "income" ? 1 : -1;
          await updateAccountBalance(data.accountId, numAmount * factor);
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    
    // Retorna a transação original atualizada
    const [updatedOriginal] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    return updatedOriginal;
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    throw new Error("Não foi possível atualizar o lançamento.");
  }
}

// 4. Excluir Transação
export async function deleteTransaction(id: string, deleteMode: "single" | "future" | "all" | boolean = false) {
  const userId = await getUserId();
  try {
    // Busca a transação antes de excluir
    const [tx] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (!tx) throw new Error("Transação não encontrada.");

    let targetTxs = [tx];
    
    // Converte deleteMode antigo (boolean) para a nova API
    const mode = typeof deleteMode === "boolean" ? (deleteMode ? "all" : "single") : deleteMode;

    if (tx.parentId && mode !== "single") {
      const allSeries = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.parentId, tx.parentId), eq(transactions.userId, userId)));
      
      if (mode === "future") {
        targetTxs = allSeries.filter(t => t.currentInstallment && tx.currentInstallment && t.currentInstallment >= tx.currentInstallment);
      } else if (mode === "all") {
        targetTxs = allSeries;
      }
    }

    // Reverte saldo de TODAS as transações a serem deletadas
    for (const t of targetTxs) {
      if (t.isCleared) {
        const numAmount = parseFloat(t.amount);
        if (t.type === "transfer" && t.toAccountId) {
          await updateAccountBalance(t.accountId, numAmount);
          await updateAccountBalance(t.toAccountId, -numAmount);
        } else {
          const factor = t.type === "income" ? -1 : 1;
          await updateAccountBalance(t.accountId, numAmount * factor);
        }
      }
      
      // Deleta do DB
      await db
        .delete(transactions)
        .where(and(eq(transactions.id, t.id), eq(transactions.userId, userId)));
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    throw new Error("Não foi possível excluir o lançamento.");
  }
}

// 5. Alternar status de liquidação (Pendente <-> Liquidado)
export async function toggleTransactionClear(id: string) {
  const userId = await getUserId();
  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);

    if (!tx) throw new Error("Transação não encontrada.");
    
    const newCleared = !tx.isCleared;

    // Efetiva no banco
    await db
      .update(transactions)
      .set({ isCleared: newCleared })
      .where(eq(transactions.id, id));

    // Deduz ou devolve do saldo
    const numAmount = parseFloat(tx.amount);
    if (newCleared) {
      // Passou a ser liquidado
      if (tx.type === "transfer" && tx.toAccountId) {
        await updateAccountBalance(tx.accountId, -numAmount);
        await updateAccountBalance(tx.toAccountId, numAmount);
      } else {
        const factor = tx.type === "income" ? 1 : -1;
        await updateAccountBalance(tx.accountId, numAmount * factor);
      }
    } else {
      // Desfez a liquidação (passou a ser pendente)
      if (tx.type === "transfer" && tx.toAccountId) {
        await updateAccountBalance(tx.accountId, numAmount);
        await updateAccountBalance(tx.toAccountId, -numAmount);
      } else {
        const factor = tx.type === "income" ? -1 : 1;
        await updateAccountBalance(tx.accountId, numAmount * factor);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar status da transação:", error);
    throw new Error("Não foi possível atualizar o status.");
  }
}

// 6. Liquidar transações em lote
export async function clearTransactionsBulk(ids: string[], isCleared: boolean) {
  const userId = await getUserId();
  try {
    const txs = await db
      .select()
      .from(transactions)
      .where(and(inArray(transactions.id, ids), eq(transactions.userId, userId)));

    for (const tx of txs) {
      if (tx.isCleared !== isCleared) {
        await db
          .update(transactions)
          .set({ isCleared })
          .where(eq(transactions.id, tx.id));

        const numAmount = parseFloat(tx.amount);
        if (isCleared) {
          if (tx.type === "transfer" && tx.toAccountId) {
            await updateAccountBalance(tx.accountId, -numAmount);
            await updateAccountBalance(tx.toAccountId, numAmount);
          } else {
            const factor = tx.type === "income" ? 1 : -1;
            await updateAccountBalance(tx.accountId, numAmount * factor);
          }
        } else {
          if (tx.type === "transfer" && tx.toAccountId) {
            await updateAccountBalance(tx.accountId, numAmount);
            await updateAccountBalance(tx.toAccountId, -numAmount);
          } else {
            const factor = tx.type === "income" ? -1 : 1;
            await updateAccountBalance(tx.accountId, numAmount * factor);
          }
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao liquidar lançamentos em lote:", error);
    throw new Error("Não foi possível liquidar os lançamentos em lote.");
  }
}
