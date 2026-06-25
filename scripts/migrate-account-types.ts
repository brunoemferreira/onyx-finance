import { db } from "../src/db";
import { users, bankAccounts, accountTypes } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando migração de tipos de conta...");

  // 1. Get all users
  const allUsers = await db.select().from(users);
  console.log(`Encontrados ${allUsers.length} usuários.`);

  for (const user of allUsers) {
    console.log(`Processando usuário: ${user.email} (${user.id})`);

    // 2. Check if user already has default account types
    const existingTypes = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.userId, user.id));

    let checkingId = "";
    let savingsId = "";
    let creditCardId = "";
    let investmentId = "";
    let cashId = "";

    const defaults = [
      { name: "Conta Corrente", type: "checking", icon: "landmark", color: "#3b82f6" },
      { name: "Poupança", type: "savings", icon: "piggy-bank", color: "#22c55e" },
      { name: "Cartão de Crédito", type: "credit_card", icon: "credit-card", color: "#ec4899" },
      { name: "Investimento", type: "investment", icon: "trending-up", color: "#06b6d4" },
      { name: "Dinheiro em Espécie", type: "cash", icon: "wallet", color: "#71717a" }
    ];

    if (existingTypes.length === 0) {
      console.log(`Semeando tipos padrão para ${user.email}...`);
      for (const item of defaults) {
        const [inserted] = await db
          .insert(accountTypes)
          .values({
            name: item.name,
            type: item.type,
            icon: item.icon,
            color: item.color,
            userId: user.id,
          })
          .returning();

        if (item.type === "checking") checkingId = inserted.id;
        else if (item.type === "savings") savingsId = inserted.id;
        else if (item.type === "credit_card") creditCardId = inserted.id;
        else if (item.type === "investment") investmentId = inserted.id;
        else if (item.type === "cash") cashId = inserted.id;
      }
    } else {
      console.log(`Tipos de conta já existem para ${user.email}. Mapeando IDs...`);
      existingTypes.forEach(t => {
        if (t.type === "checking") checkingId = t.id;
        else if (t.type === "savings") savingsId = t.id;
        else if (t.type === "credit_card") creditCardId = t.id;
        else if (t.type === "investment") investmentId = t.id;
        else if (t.type === "cash") cashId = t.id;
      });
    }

    // 3. Find user bank accounts
    const userAccounts = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, user.id));

    console.log(`Atualizando ${userAccounts.length} contas para o usuário ${user.email}...`);

    for (const acc of userAccounts) {
      // Map old enum type to new account type ID
      let targetId = checkingId; // default fallback

      const oldType = (acc as any).type;
      if (oldType === "savings" && savingsId) targetId = savingsId;
      else if (oldType === "credit_card" && creditCardId) targetId = creditCardId;
      else if (oldType === "investment" && investmentId) targetId = investmentId;
      else if (oldType === "cash" && cashId) targetId = cashId;

      await db
        .update(bankAccounts)
        .set({
          accountTypeId: targetId,
        })
        .where(eq(bankAccounts.id, acc.id));

      console.log(`Conta "${acc.name}" (tipo anterior: ${oldType}) atualizada para novo Tipo de Conta ID: ${targetId}`);
    }
  }

  console.log("Migração concluída com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
