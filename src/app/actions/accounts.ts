"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bankAccounts, accountTypes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Obtém o ID do usuário autenticado
export async function getUserId() {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  throw new Error("Não autenticado.");
}

// 1. Listar contas e cartões do usuário com o Tipo de Conta associado
export async function getBankAccounts() {
  const userId = await getUserId();
  try {
    const results = await db
      .select({
        id: bankAccounts.id,
        name: bankAccounts.name,
        initialBalance: bankAccounts.initialBalance,
        creditLimit: bankAccounts.creditLimit,
        closingDay: bankAccounts.closingDay,
        dueDay: bankAccounts.dueDay,
        institution: bankAccounts.institution,
        agency: bankAccounts.agency,
        accountNumber: bankAccounts.accountNumber,
        accountDigit: bankAccounts.accountDigit,
        color: bankAccounts.color,
        userId: bankAccounts.userId,
        accountTypeId: bankAccounts.accountTypeId,
        createdAt: bankAccounts.createdAt,
      })
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId));

    // Fetch the account types for these accounts
    const userTypes = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.userId, userId));

    // Map them together
    return results.map(acc => {
      const typeInfo = userTypes.find(t => t.id === acc.accountTypeId);
      return {
        ...acc,
        accountType: typeInfo ? {
          id: typeInfo.id,
          name: typeInfo.name,
          type: typeInfo.type,
          icon: typeInfo.icon,
          color: typeInfo.color,
        } : {
          id: acc.accountTypeId,
          name: "Desconhecido",
          type: "checking" as const,
          icon: "landmark",
          color: "#71717a",
        }
      };
    });
  } catch (error) {
    console.error("Erro ao obter contas bancárias:", error);
    throw new Error("Não foi possível listar as contas.");
  }
}

// 2. Criar nova conta ou cartão
export async function createBankAccount(data: {
  name: string;
  accountTypeId: string;
  initialBalance: string;
  creditLimit?: string;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  institution?: string;
  agency?: string;
  accountNumber?: string;
  accountDigit?: string;
}) {
  const userId = await getUserId();
  try {
    // Buscar o tipo de conta para validações e regras
    const [accType] = await db
      .select()
      .from(accountTypes)
      .where(and(eq(accountTypes.id, data.accountTypeId), eq(accountTypes.userId, userId)));

    if (!accType) {
      throw new Error("Tipo de conta inválido ou não pertencente ao usuário.");
    }

    const isCreditCard = accType.type === "credit_card";
    const isBankLike = ["checking", "savings", "investment"].includes(accType.type);

    const [newAccount] = await db.insert(bankAccounts).values({
      name: data.name,
      initialBalance: data.initialBalance,
      creditLimit: isCreditCard ? data.creditLimit : null,
      closingDay: isCreditCard ? data.closingDay : null,
      dueDay: isCreditCard ? data.dueDay : null,
      institution: data.institution || "generic",
      agency: isBankLike ? (data.agency || null) : null,
      accountNumber: isBankLike ? (data.accountNumber || null) : null,
      accountDigit: isBankLike ? (data.accountDigit || null) : null,
      color: data.color || "#27272a",
      accountTypeId: data.accountTypeId,
      userId: userId,
    }).returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    return newAccount;
  } catch (error) {
    console.error("Erro ao criar conta bancária:", error);
    throw new Error(error instanceof Error ? error.message : "Não foi possível criar a conta.");
  }
}

// 3. Atualizar conta
export async function updateBankAccount(
  id: string,
  data: {
    name: string;
    accountTypeId: string;
    initialBalance: string;
    creditLimit?: string;
    closingDay?: number;
    dueDay?: number;
    color?: string;
    institution?: string;
    agency?: string;
    accountNumber?: string;
    accountDigit?: string;
  }
) {
  const userId = await getUserId();
  try {
    // Buscar o tipo de conta para validações e regras
    const [accType] = await db
      .select()
      .from(accountTypes)
      .where(and(eq(accountTypes.id, data.accountTypeId), eq(accountTypes.userId, userId)));

    if (!accType) {
      throw new Error("Tipo de conta inválido ou não pertencente ao usuário.");
    }

    const isCreditCard = accType.type === "credit_card";
    const isBankLike = ["checking", "savings", "investment"].includes(accType.type);

    const [updated] = await db
      .update(bankAccounts)
      .set({
        name: data.name,
        initialBalance: data.initialBalance,
        creditLimit: isCreditCard ? data.creditLimit : null,
        closingDay: isCreditCard ? data.closingDay : null,
        dueDay: isCreditCard ? data.dueDay : null,
        institution: data.institution || "generic",
        agency: isBankLike ? (data.agency || null) : null,
        accountNumber: isBankLike ? (data.accountNumber || null) : null,
        accountDigit: isBankLike ? (data.accountDigit || null) : null,
        color: data.color || "#27272a",
        accountTypeId: data.accountTypeId,
      })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    return updated;
  } catch (error) {
    console.error("Erro ao atualizar conta bancária:", error);
    throw new Error(error instanceof Error ? error.message : "Não foi possível atualizar a conta.");
  }
}

// 4. Excluir conta
export async function deleteBankAccount(id: string) {
  const userId = await getUserId();
  try {
    await db
      .delete(bankAccounts)
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta bancária:", error);
    throw new Error("Não foi possível excluir a conta.");
  }
}
