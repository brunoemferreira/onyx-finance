"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { getUserId } from "./accounts";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// 1. Obter status de assinatura do usuário
export async function getUserSubscription() {
  const userId = await getUserId();
  try {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!sub) return null;

    const isActive =
      sub.status === "active" ||
      sub.status === "trialing" ||
      (sub.status === "past_due" && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date());

    return {
      ...sub,
      isActive: !!isActive,
    };
  } catch (error) {
    console.error("Erro ao carregar assinatura:", error);
    return null;
  }
}

// 2. Criar Sessão de Checkout (Stripe)
export async function createCheckoutSession() {
  const userId = await getUserId();
  
  try {
    // Busca e-mail do usuário
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("Usuário não encontrado.");

    // Verifica se já tem registro no banco com customer ID
    let [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    
    let stripeCustomerId = sub?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Cria cliente no Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      // Cria registro base
      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId,
        status: "incomplete",
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Onyx Finance Premium",
              description: "Acesso ilimitado a contas, cartões e parcelamentos na Onyx Finance",
            },
            unit_amount: 1990, // R$ 19,90
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/dashboard?checkout=success`,
      cancel_url: `${APP_URL}/dashboard/billing?checkout=canceled`,
      metadata: { userId },
    });

    return { url: session.url };
  } catch (error) {
    console.error("Erro ao iniciar sessão do Stripe:", error);
    throw new Error("Não foi possível iniciar o checkout.");
  }
}

// 3. Criar Sessão do Portal de Assinante (Stripe Billing Portal)
export async function createPortalSession() {
  const userId = await getUserId();
  try {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    if (!sub || !sub.stripeCustomerId) {
      throw new Error("Assinatura não localizada.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${APP_URL}/dashboard/billing`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Erro ao abrir portal do Stripe:", error);
    throw new Error("Não foi possível carregar o gerenciador de assinatura.");
  }
}

// Helper para validar limites do plano grátis (Middleware/Paywall)
export async function checkPlanLimits(
  checkType: "accounts" | "transactions",
  currentCount: number
) {
  const sub = await getUserSubscription();
  if (sub?.isActive) return true; // Premium tem acesso total

  if (checkType === "accounts") {
    return currentCount < 2; // Plano Grátis limite de 2 contas/cartões
  }
  if (checkType === "transactions") {
    return currentCount < 50; // Plano Grátis limite de 50 transações por mês
  }

  return false;
}
