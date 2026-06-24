import { pgTable, uuid, text, timestamp, numeric, pgEnum, boolean, integer, primaryKey } from "drizzle-orm/pg-core";

// Enums para consistência de dados
export const accountTypeEnum = pgEnum("account_type", ["checking", "savings", "credit_card", "investment", "cash"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "trialing", "past_due", "canceled", "incomplete"]);
export const recurrencePeriodEnum = pgEnum("recurrence_period", ["none", "weekly", "monthly", "yearly"]);

// ==========================================
// 1. NextAuth Schema Tables (Adapter)
// ==========================================

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    }
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositeKey: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    }
  ]
);

// ==========================================
// 2. Regras de Negócio e Finanças
// ==========================================

// Contas Bancárias e Cartões de Crédito (Renomeado para evitar conflito com 'account' do NextAuth)
export const bankAccounts = pgTable("bank_account", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").default("checking").notNull(),
  initialBalance: numeric("initial_balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  
  // Específicos para Cartão de Crédito
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }), // Limite total do cartão
  closingDay: integer("closing_day"), // Dia do fechamento da fatura (ex: 5)
  dueDay: integer("due_day"), // Dia do vencimento da fatura (ex: 15)
  
  // Detalhes da Instituição Financeira e da Conta
  institution: text("institution").default("generic").notNull(),
  agency: text("agency"),
  accountNumber: text("account_number"),
  accountDigit: text("account_digit"),
  
  color: text("color").default("#27272a").notNull(), // Tons de cinza por padrão (zinc-800)
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categorias de Transações
export const categories = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  icon: text("icon").default("tag").notNull(),
  color: text("color").default("#52525b").notNull(), // Tons de cinza padrão (zinc-600)
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // null para globais
  parentId: uuid("parent_id").references((): any => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transações Financeiras (Suporta Parcelamento, Recorrência e Faturas de Cartão)
export const transactions = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: uuid("account_id").references(() => bankAccounts.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  description: text("description").notNull(),
  
  // Controle de Parcelamento e Recorrência
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrencePeriod: recurrencePeriodEnum("recurrence_period").default("none").notNull(),
  
  // Parcelamento
  isInstallment: boolean("is_installment").default(false).notNull(),
  currentInstallment: integer("current_installment"), // Ex: Parcela 3
  totalInstallments: integer("total_installments"), // de 12
  parentId: uuid("parent_id"), // Agrupa parcelas ou recorrências geradas a partir de uma mesma origem
  
  // Para transferências
  toAccountId: uuid("to_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  
  isCleared: boolean("is_cleared").default(true).notNull(), // Efetivado / Pago
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// SaaS - Assinaturas e Planos (Stripe Integration)
export const subscriptions = pgTable("subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique().notNull(),
  stripeCustomerId: text("stripe_customer_id").unique().notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
