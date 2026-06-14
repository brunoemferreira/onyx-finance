"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { getUserId } from "./accounts";
import { eq, or, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Obter todas as categorias personalizadas do usuário (semeia padrões personalizadas se vazio)
export async function getCategories() {
  const userId = await getUserId();
  try {
    let list = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    // Se o usuário não tem nenhuma categoria de sua autoria, semeia as padrões personalizadas para ele (incluindo subcategorias)
    if (list.length === 0) {
      const defaultCategories = [
        { 
          name: "Alimentação", 
          type: "expense" as const, 
          icon: "utensils", 
          color: "#ef4444",
          subcategories: [
            { name: "Supermercado", icon: "shopping-bag" },
            { name: "Restaurantes", icon: "coffee" },
            { name: "Lanches", icon: "coffee" }
          ]
        },
        { 
          name: "Moradia", 
          type: "expense" as const, 
          icon: "home", 
          color: "#3b82f6",
          subcategories: [
            { name: "Aluguel", icon: "home" },
            { name: "Energia / Luz", icon: "lightbulb" },
            { name: "Água / Internet", icon: "wifi" }
          ]
        },
        { 
          name: "Transporte", 
          type: "expense" as const, 
          icon: "car", 
          color: "#f97316",
          subcategories: [
            { name: "Combustível", icon: "car" },
            { name: "Uber / Táxi", icon: "bus" },
            { name: "Manutenção", icon: "wrench" }
          ]
        },
        { 
          name: "Lazer", 
          type: "expense" as const, 
          icon: "party-popper", 
          color: "#8b5cf6",
          subcategories: [
            { name: "Cinema / Shows", icon: "clapperboard" },
            { name: "Viagens", icon: "plane" },
            { name: "Presentes", icon: "gift" }
          ]
        },
        { 
          name: "Saúde", 
          type: "expense" as const, 
          icon: "heart-pulse", 
          color: "#ec4899",
          subcategories: [
            { name: "Consultas / Exames", icon: "heart-pulse" },
            { name: "Farmácia", icon: "heart-pulse" },
            { name: "Academia", icon: "dumbbell" }
          ]
        },
        { 
          name: "Salário", 
          type: "income" as const, 
          icon: "briefcase", 
          color: "#22c55e",
          subcategories: [
            { name: "Salário Fixo", icon: "briefcase" },
            { name: "Freelance", icon: "coins" }
          ]
        },
        { 
          name: "Investimentos", 
          type: "income" as const, 
          icon: "trending-up", 
          color: "#06b6d4",
          subcategories: [
            { name: "Dividendos", icon: "trending-up" },
            { name: "Renda Fixa", icon: "piggy-bank" }
          ]
        },
      ];

      for (const parent of defaultCategories) {
        const [insertedParent] = await db
          .insert(categories)
          .values({
            name: parent.name,
            type: parent.type,
            icon: parent.icon,
            color: parent.color,
            userId: userId,
            parentId: null,
          })
          .returning();

        if (parent.subcategories.length > 0) {
          await db.insert(categories).values(
            parent.subcategories.map(sub => ({
              name: sub.name,
              type: parent.type,
              icon: sub.icon,
              color: parent.color,
              userId: userId,
              parentId: insertedParent.id, // Linked to the parent!
            }))
          );
        }
      }

      // Re-busca a lista após semear
      list = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId));
    }

    return list;
  } catch (error) {
    console.error("Erro ao obter categorias:", error);
    throw new Error("Não foi possível listar as categorias.");
  }
}

// 2. Criar nova categoria personalizada
export async function createCategory(data: {
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  parentId?: string | null;
}) {
  const userId = await getUserId();
  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        type: data.type,
        icon: data.icon || "tag",
        color: data.color || "#52525b",
        userId: userId,
        parentId: data.parentId || null,
      })
      .returning();

    revalidatePath("/dashboard");
    return newCategory;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    throw new Error("Não foi possível criar a categoria.");
  }
}

// 3. Excluir categoria personalizada do usuário
export async function deleteCategory(id: string) {
  const userId = await getUserId();
  try {
    await db
      .delete(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId) // Garante que o usuário não exclua categorias globais
        )
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    throw new Error("Não foi possível excluir a categoria.");
  }
}

// 4. Atualizar categoria personalizada do usuário
export async function updateCategory(id: string, data: {
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  parentId?: string | null;
}) {
  const userId = await getUserId();
  try {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        parentId: data.parentId || null,
      })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId) // Garante que o usuário só edite suas próprias categorias
        )
      )
      .returning();

    revalidatePath("/dashboard");
    return updatedCategory;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw new Error("Não foi possível atualizar a categoria.");
  }
}
