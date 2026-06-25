"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { success: false, error: "O e-mail é obrigatório." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Security practice: do not leak if email exists or not
    if (!user) {
      console.log(`[RESET PASSWORD] E-mail ${normalizedEmail} não cadastrado na base de dados.`);
      return { success: true };
    }

    // Check if user is OAuth-only
    if (!user.passwordHash) {
      console.log(`[RESET PASSWORD] Usuário ${normalizedEmail} está cadastrado via OAuth (Google/GitHub).`);
      return { success: true };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpires: expires,
      })
      .where(eq(users.id, user.id));

    // Construct reset link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    console.log("=========================================");
    console.log(`[RESET PASSWORD] Solicitação para: ${normalizedEmail}`);
    console.log(`[RESET PASSWORD] URL de redefinição: ${resetUrl}`);
    console.log("=========================================");

    // Attempt to send email if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpPort === "465",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Onyx Finance" <${smtpUser}>`,
          to: normalizedEmail,
          subject: "Recuperação de Senha - Onyx Finance",
          text: `Olá, ${user.name || "Usuário"}.\n\nVocê solicitou a redefinição de senha para sua conta no Onyx Finance.\n\nPara redefinir sua senha, acesse o link abaixo:\n\n${resetUrl}\n\nEste link é válido por 1 hora.\n\nSe você não solicitou esta alteração, ignore este e-mail.`,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <h2 style="color: #09090b; font-weight: bold; margin-bottom: 20px;">Onyx Finance</h2>
            <p>Olá, <strong>${user.name || "Usuário"}</strong>.</p>
            <p>Você solicitou a redefinição de senha para sua conta no Onyx Finance.</p>
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #09090b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole o link no seu navegador:</p>
            <p style="word-break: break-all; color: #71717a;">${resetUrl}</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
            <p style="font-size: 12px; color: #71717a;">Este link expirará em 1 hora. Se você não solicitou esta redefinição, nenhuma ação é necessária.</p>
          </div>`,
        });
        console.log(`[RESET PASSWORD] E-mail enviado com sucesso para ${normalizedEmail}`);
      } catch (emailErr) {
        console.error("[RESET PASSWORD] Erro ao enviar e-mail por SMTP:", emailErr);
      }
    } else {
      console.log("[RESET PASSWORD] Envio de SMTP desabilitado. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS em seu arquivo .env");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na solicitação de reset de senha:", error);
    return { success: false, error: "Ocorreu um erro ao processar sua solicitação." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token) {
      return { success: false, error: "Token de redefinição inválido." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "A senha deve ter no mínimo 6 caracteres." };
    }

    // Find user with token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (!user) {
      return { success: false, error: "Token de redefinição inválido ou expirado." };
    }

    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return { success: false, error: "Token de redefinição expirado." };
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword);

    // Update password and clear token columns
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return { success: false, error: "Ocorreu um erro ao redefinir sua senha." };
  }
}
