# Plano de Implementação - Onyx Finance

Este documento serve como o roteiro (roadmap) oficial de desenvolvimento do projeto Onyx Finance. Ele será consultado e atualizado constantemente à medida que novas fases e requisitos forem definidos.

---

## 📅 Fases do Projeto

### **Fase 1: Fundações e Infraestrutura (Concluída)**
- [x] Setup do Next.js (usando Turbopack, Tailwind CSS e componentes Base UI).
- [x] Configuração do banco de dados relacional com **Drizzle ORM** (PostgreSQL rodando via Docker).
- [x] Configuração base do **NextAuth.js** (preparado para logins via Google e GitHub, e login simulado em ambiente de desenvolvimento).

### **Fase 2: Regra de Negócio e Funcionalidades Core (Concluída)**
- [x] Modelagem das entidades financeiras principais: contas/cartões (`bank_accounts`), categorias (`categories`) e transações (`transactions`).
- [x] Desenvolvimento do dashboard principal com agregações automáticas de saldo total, receitas/despesas e gráficos (fluxo de caixa e pizza por categoria com `Recharts`).
- [x] Controle de transações suportando transferências entre contas, parcelamento de compras e recorrências automáticas.

### **Fase 3: Ajustes Finos, Usabilidade e Auditoria (Concluída)**
- [x] Correção de fuso horário em lançamentos (padronização para UTC Midnight no salvamento e visualização).
- [x] Aplicação de responsividade completa no layout do dashboard, tabelas e formulários.
- [x] Inclusão de formatação monetária local brasileira (**BRL**) e tradução de tipos de contas.
- [x] Inclusão da visualização opcional de saldo corrente (calculado linha por linha retroativamente) com toggle no painel de transações.
- [x] Criação da interface para edição completa de contas e cartões de crédito.

### **Fase 4: Autenticação, Perfil e Logout (Concluída)**
- [x] **Proteção de Rotas:** Implementar middleware do NextAuth para proteger todas as subrotas do `/dashboard` e redirecionar usuários não autenticados.
- [x] **Página de Login:** Criar uma página de login personalizada e visualmente refinada (acessível via `/login` ou `/auth/signin`) oferecendo botões de login social via Google e GitHub.
- [x] **Fluxo de Logout:** Adicionar botão "Sair" (Logout) no rodapé do menu lateral do dashboard, integrado à função `signOut` do NextAuth.
- [x] **Dados de Perfil:** Atualizar a barra lateral para exibir dinamicamente o nome, e-mail e foto do usuário vindo da sessão real ativa.
- [x] **Página de Perfil:** Criar uma página de perfil dedicada (ex: `/dashboard/profile`) permitindo visualizar as informações cadastrais do usuário e histórico da conta.

### **Fase 6: Integração SaaS e Stripe (Fase Final)**
- [ ] **Assinatura Premium:** Implementar fluxo de checkout via Stripe Checkout para o plano Premium.
- [ ] **Portal do Assinante:** Habilitar portal Stripe Billing para gerenciamento de faturamento e cancelamento.
- [ ] **Webhooks do Stripe:** Configurar rota de webhooks para escutar eventos de criação, alteração ou cancelamento de assinaturas e sincronizar com o banco de dados.
- [ ] **Paywall & Limites:** Integrar middleware de verificação para limitar os recursos do plano básico (máximo de 2 contas, 50 transações por mês).
