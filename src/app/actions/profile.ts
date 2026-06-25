"use server";

import { db } from "@/db";
import { users, bankAccounts, categories, transactions } from "@/db/schema";
import { getUserId } from "./accounts";
import { getCategories } from "./categories";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const userId = await getUserId();
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("Usuário não encontrado.");

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash
    };
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    throw new Error("Não foi possível carregar o perfil.");
  }
}

export async function updateUserProfileImage(url: string) {
  const userId = await getUserId();
  try {
    await db
      .update(users)
      .set({ image: url })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar avatar no banco:", error);
    throw new Error("Não foi possível atualizar o avatar.");
  }
}

export async function uploadProfileImage(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("Nenhum arquivo enviado");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define upload directory in public/uploads/
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  // Ensure the directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Generate unique filename to avoid overwrites
  const ext = path.extname(file.name);
  const baseName = `avatar_${userId}_${Date.now()}`;
  const uniqueName = `${baseName}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  // Return public relative path
  return {
    success: true,
    url: `/api/uploads/${uniqueName}`
  };
}

export async function resetUserData() {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    // Delete all transactions
    await db.delete(transactions).where(eq(transactions.userId, userId));

    // Delete all bank accounts
    await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));

    // Delete all user categories
    await db.delete(categories).where(eq(categories.userId, userId));

    // Trigger categories re-seeding by calling getCategories() so they are immediately available
    await getCategories();

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar dados do usuário:", error);
    throw new Error("Não foi possível resetar os dados.");
  }
}
