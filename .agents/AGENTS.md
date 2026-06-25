# Diretrizes e Regras do Onyx Finance

## 🐳 Regra de Atualização em Produção (CRÍTICA)

- **Preservação do Ambiente de Produção:** O contêiner de produção do Docker e o banco de dados **nunca** devem ser apagados, destruídos, removidos ou restaurados do zero (`reset`, `down -v`, etc.).
- **Atualizações Incrementais:** Todas as alterações no ambiente (seja build do projeto, alterações no Docker Compose ou migrações do banco de dados) devem ser aplicadas de forma incremental (ex: `npx drizzle-kit push`, `docker compose up --build -d` sem remover volumes). Isso garante a integridade contínua de dados de usuários e configurações.

## 📘 Regra de Documentação de Habilidades (CRÍTICA)

- **Atualização do Documento de Skills:** Toda vez que houver atualização de uma nova funcionalidade no sistema, o documento de skills [docs/skills.md](file:///d:/workspace/web-finance/docs/skills.md) deve ser atualizado para listar e detalhar essa nova capacidade do projeto.

