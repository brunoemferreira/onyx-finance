"use server";

import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "./accounts";

export async function uploadReceipt(formData: FormData) {
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
  const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueName = `${baseName}_${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  // Return public relative path
  return {
    success: true,
    url: `/api/uploads/${uniqueName}`,
    fileName: file.name
  };
}
