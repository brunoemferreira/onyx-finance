"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { bankAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Função auxiliar para obter ou criar o usuário Demo (facilitando testes e simulação sem travar o app)
async function getOrCreateMockUser() {
  const existing = await db.select().from(users).where(eq(users.email, "demo@onyx.finance")).limit(1);
  if (existing.length > 0) return existing[0].id;

  const [newUser] = await db.insert(users).values({
    name: "Usuário Demo",
    email: "demo@onyx.finance",
  }).returning();
  return newUser.id;
}

// Obtém o ID do usuário autenticado ou do mock
export async function getUserId() {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  return await getOrCreateMockUser();
}

// 1. Listar contas e cartões do usuário
export async function getBankAccounts() {
  const userId = await getUserId();
  try {
    return await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
  } catch (error) {
    console.error("Erro ao obter contas bancárias:", error);
    throw new Error("Não foi possível listar as contas.");
  }
}

// 2. Criar nova conta ou cartão
export async function createBankAccount(data: {
  name: string;
  type: "checking" | "savings" | "credit_card" | "investment" | "cash";
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
    const [newAccount] = await db.insert(bankAccounts).values({
      name: data.name,
      type: data.type,
      initialBalance: data.initialBalance,
      creditLimit: data.type === "credit_card" ? data.creditLimit : null,
      closingDay: data.type === "credit_card" ? data.closingDay : null,
      dueDay: data.type === "credit_card" ? data.dueDay : null,
      institution: data.institution || "generic",
      agency: data.agency || null,
      accountNumber: data.accountNumber || null,
      accountDigit: data.accountDigit || null,
      color: data.color || "#27272a",
      userId: userId,
    }).returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    return newAccount;
  } catch (error) {
    console.error("Erro ao criar conta bancária:", error);
    throw new Error("Não foi possível criar a conta.");
  }
}

// 3. Atualizar conta
export async function updateBankAccount(
  id: string,
  data: {
    name: string;
    type: "checking" | "savings" | "credit_card" | "investment" | "cash";
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
    const [updated] = await db
      .update(bankAccounts)
      .set({
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
        creditLimit: data.type === "credit_card" ? data.creditLimit : null,
        closingDay: data.type === "credit_card" ? data.closingDay : null,
        dueDay: data.type === "credit_card" ? data.dueDay : null,
        institution: data.institution || "generic",
        agency: data.agency || null,
        accountNumber: data.accountNumber || null,
        accountDigit: data.accountDigit || null,
        color: data.color || "#27272a",
      })
      .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    return updated;
  } catch (error) {
    console.error("Erro ao atualizar conta bancária:", error);
    throw new Error("Não foi possível atualizar a conta.");
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
