import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ filename: string }> | { filename: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Não autorizado. Faça login para acessar este comprovante.", { status: 401 });
  }

  const resolvedParams = await props.params;
  const filename = resolvedParams.filename;

  // Prevent path traversal attacks
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Nome de arquivo inválido", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const fileBuffer = await fs.readFile(filePath);

    // Determine standard mime type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return new NextResponse("Arquivo não encontrado", { status: 404 });
  }
}
