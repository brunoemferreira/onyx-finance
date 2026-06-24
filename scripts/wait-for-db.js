const postgres = require('postgres');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não configurada.");
  process.exit(1);
}

const client = postgres(url, { max: 1, connect_timeout: 5 });

async function check() {
  console.log("Conectando ao banco de dados...");
  for (let i = 0; i < 30; i++) {
    try {
      await client`SELECT 1`;
      console.log("Banco de dados está pronto!");
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log("Banco de dados ainda não está pronto, aguardando...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error("Banco de dados não respondeu a tempo.");
  process.exit(1);
}

check();
