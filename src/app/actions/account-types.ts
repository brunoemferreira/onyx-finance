"use server";

import { db } from "@/db";
import { accountTypes } from "@/db/schema";
import { getUserId } from "./accounts";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Obter todos os tipos de conta do usuário (semeia padrões se vazio)
export async function getAccountTypes() {
  const userId = await getUserId();
  try {
    let list = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.userId, userId));

    // Se o usuário não tem nenhum tipo de conta personalizado, semeia os padrões
    if (list.length === 0) {
      const defaults = [
        { name: "Conta Corrente", type: "checking", icon: "landmark", color: "#3b82f6" },
        { name: "Poupança", type: "savings", icon: "piggy-bank", color: "#22c55e" },
        { name: "Cartão de Crédito", type: "credit_card", icon: "credit-card", color: "#ec4899" },
        { name: "Investimento", type: "investment", icon: "trending-up", color: "#06b6d4" },
        { name: "Dinheiro em Espécie", type: "cash", icon: "wallet", color: "#71717a" }
      ];

      await db.insert(accountTypes).values(
        defaults.map(d => ({
          name: d.name,
          type: d.type,
          icon: d.icon,
          color: d.color,
          userId: userId,
        }))
      );

      // Re-busca a lista após semear
      list = await db
        .select()
        .from(accountTypes)
        .where(eq(accountTypes.userId, userId));
    }

    return list;
  } catch (error) {
    console.error("Erro ao obter tipos de conta:", error);
    throw new Error("Não foi possível listar os tipos de conta.");
  }
}

// 2. Criar novo tipo de conta personalizado
export async function createAccountType(data: {
  name: string;
  type: "checking" | "savings" | "credit_card" | "investment" | "cash";
  icon?: string;
  color?: string;
}) {
  const userId = await getUserId();
  try {
    const [newType] = await db
      .insert(accountTypes)
      .values({
        name: data.name,
        type: data.type,
        icon: data.icon || "wallet",
        color: data.color || "#71717a",
        userId: userId,
      })
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/account-types");
    return newType;
  } catch (error) {
    console.error("Erro ao criar tipo de conta:", error);
    throw new Error("Não foi possível criar o tipo de conta.");
  }
}

// 3. Atualizar tipo de conta personalizado
export async function updateAccountType(
  id: string,
  data: {
    name: string;
    type: "checking" | "savings" | "credit_card" | "investment" | "cash";
    icon?: string;
    color?: string;
  }
) {
  const userId = await getUserId();
  try {
    const [updated] = await db
      .update(accountTypes)
      .set({
        name: data.name,
        type: data.type,
        icon: data.icon || "wallet",
        color: data.color || "#71717a",
      })
      .where(and(eq(accountTypes.id, id), eq(accountTypes.userId, userId)))
      .returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/account-types");
    return updated;
  } catch (error) {
    console.error("Erro ao atualizar tipo de conta:", error);
    throw new Error("Não foi possível atualizar o tipo de conta.");
  }
}

// 4. Excluir tipo de conta personalizado
export async function deleteAccountType(id: string) {
  const userId = await getUserId();
  try {
    await db
      .delete(accountTypes)
      .where(and(eq(accountTypes.id, id), eq(accountTypes.userId, userId)));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/account-types");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir tipo de conta:", error);
    throw new Error("Não foi possível excluir o tipo de conta. Certifique-se de que não há nenhuma conta ativa utilizando este tipo.");
  }
}
