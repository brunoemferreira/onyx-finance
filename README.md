# Onyx Finance — Gestão Financeira Monocromática

Onyx Finance é um sistema premium de controle e gestão financeira pessoal. Focado em uma estética limpa, moderna e monocromática, a plataforma oferece ferramentas eficientes e simplificadas para o acompanhamento individual de fluxos de caixa, contas bancárias, cartões de crédito, lançamentos recorrentes e relatórios consolidados em tempo real.

---

## 🚀 Funcionalidades Principais

*   **Dashboard Consolidado:** Visão resumida de receitas, despesas, saldos das contas e gráficos interativos de evolução financeira.
*   **Gestão de Lançamentos (Transações):**
    *   Cadastro estruturado de receitas, despesas e transferências entre contas.
    *   Campos específicos como data de vencimento, número de documento e descrição.
    *   Categorização inteligente (com ícones customizados e cores discretas).
    *   **Controle de Status Preciso:** Classificação clara dos lançamentos como `A VENCER`, `VENCIDO` (data ultrapassada e não liquidada) e `RECEBIDO` / `PAGO` (concluídos).
    *   **Liquidação em Lote:** Seleção de múltiplas transações diretamente na tabela para marcar como concluídas ou pendentes simultaneamente.
    *   **Paginação e Filtros Dinâmicos:** Filtros por tipo, conta, categoria e status, com paginação ajustável (15, 50 ou 100 itens por página).
*   **Contas e Cartões:** Controle completo sobre diferentes saldos e limites de cartões.
*   **Lançamentos Recorrentes e Parcelamentos:** Criação de séries fixas (mensais, semanais ou anuais) e controle de parcelamentos de despesas.
*   **Autenticação Segura:** Autenticação completa integrada utilizando NextAuth.js.
*   **Interface Premium:** Temas claro e escuro, com suporte a micro-animações, design minimalista monocromático e ícones definidos em alta fidelidade.

---

## 🛠️ Tecnologias & Arquitetura

O projeto utiliza um ecossistema moderno e robusto voltado para alta performance e facilidade de manutenção:

### Core Framework & Stack
*   **Framework:** [Next.js](https://nextjs.org/) (App Router com TypeScript)
*   **Estilização:** TailwindCSS & Tailwind Merge para customização estética flexível.
*   **Componentes UI:** Componentes baseados em Radix UI (instalados via Shadcn/UI) para acessibilidade e comportamento nativo.
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) para mapeamento relacional, queries seguras e migrações incrementais (`drizzle-kit`).
*   **Autenticação:** [NextAuth.js](https://next-auth.js.org/)

### Padrões de Projeto (Design Patterns)
*   **Server Actions:** Toda a lógica de leitura, criação, alteração e exclusão de transações e contas é processada via Server Actions nativos do Next.js, eliminando a necessidade de expor APIs REST tradicionais e reduzindo o boilerplate de comunicação cliente-servidor.
*   **Componentes Declarativos (React Hooks):** Gerenciamento de estados locais dinâmicos de interface (filtros, seleção em lote, paginação) usando hooks de React estruturados de forma limpa.
*   **Acoplamento Flexível de Banco (Schema-First):** Utilização de Drizzle schemas centralizados ([schema.ts](file:///d:/workspace/web-finance/src/db/schema.ts)) para sincronização automática de tipos entre o banco e o TypeScript.
*   **Estética Monocromática e Consistência Visual:** Aplicação estrita de paletas de cinza (`zinc`) com toques de cor de alta saturação controladas para representar status críticos (verde para consolidado, amarelo para pendente e vermelho para vencido).

---

## 💻 Como Rodar em Ambiente de Desenvolvimento

### Pré-requisitos
*   **Node.js** (versão 20 ou superior)
*   **Docker** (para subir o banco de dados de desenvolvimento localmente, opcional)

### Passo a Passo

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto contendo as credenciais de banco, segredos do NextAuth e credenciais OAuth. Exemplo:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/web-finance
    NEXTAUTH_SECRET=sua_chave_secreta_aqui
    NEXTAUTH_URL=http://localhost:3002

    # Provedores OAuth (Opcional - Necessário para Login Social)
    GITHUB_CLIENT_ID=seu_client_id_do_github
    GITHUB_CLIENT_SECRET=seu_client_secret_do_github
    GOOGLE_CLIENT_ID=seu_client_id_do_google
    GOOGLE_CLIENT_SECRET=seu_client_secret_do_google
    ```

### 🔑 Configuração de Autenticação Social

Para habilitar a autenticação social no Onyx Finance, siga as instruções de configuração para cada provedor desejado:

#### GitHub OAuth App
1. Acesse as **Developer Settings** do seu GitHub em: `Settings > Developer settings > OAuth Apps > New OAuth App`.
2. Configure o formulário com os seguintes valores:
   - **Application Name:** Onyx Finance
   - **Homepage URL:** `http://localhost:3002` (ou seu domínio de produção)
   - **Authorization callback URL:** `http://localhost:3002/api/auth/callback/github`
3. Clique em **Register application**.
4. Copie o **Client ID** e gere um novo **Client Secret** para preencher as variáveis `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`.

#### Google OAuth Client
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie ou selecione um projeto existente.
3. Vá em **APIs & Services > Credentials** e configure a **OAuth consent screen** caso ainda não o tenha feito.
4. Crie uma nova credencial escolhendo **OAuth client ID**:
   - **Application type:** Web application
   - **Name:** Onyx Finance
   - **Authorized JavaScript origins:** `http://localhost:3002` (ou seu domínio de produção)
   - **Authorized redirect URIs:** `http://localhost:3002/api/auth/callback/google`
5. Clique em **Create** e copie os valores gerados para preencher as variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

3.  **Iniciar o Banco de Dados localmente:**
    Caso deseje rodar apenas o banco PostgreSQL pelo Docker local:
    ```bash
    docker compose up -d postgres
    ```

4.  **Executar Migrações e Sincronizar o Banco:**
    Use o drizzle-kit para aplicar a estrutura de tabelas ao banco de dados:
    ```bash
    npx drizzle-kit push
    ```

5.  **Iniciar servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse [http://localhost:3002](http://localhost:3002) no seu navegador.

---

## 🐳 Como Subir em Produção via Container Docker

O projeto está totalmente containerizado utilizando Docker e Docker Compose, dividindo-se entre a aplicação Next.js e o banco PostgreSQL.

### ⚠️ Regra de Atualização Crítica
> [!IMPORTANT]
> **Preservação do Ambiente de Produção:** O banco de dados e os contêineres em produção **nunca** devem ser limpos, recriados do zero ou removidos com comandos destrutivos (como `down -v`). As atualizações devem ser aplicadas **incrementalmente** para preservar dados e transações reais dos usuários.

### Instruções para Deploy

1.  **Certifique-se de que o `.env` de produção esteja configurado** na máquina host.
2.  **Atualizar e Inicializar a Aplicação:**
    Para fazer o rebuild da imagem Next.js com as últimas alterações de código e colocá-la em execução mantendo as configurações e volumes do banco de dados intactos, execute:
    ```bash
    docker compose up --build -d
    ```
3.  **Aplicar Migrações de Banco Incrementalmente:**
    Se houver atualizações na estrutura de tabelas (novas colunas, índices, etc.), execute o drizzle-kit a partir da máquina de build para aplicar as modificações de forma incremental sem risco de perda de dados:
    ```bash
    npx drizzle-kit push
    ```

Os serviços expostos no Docker Compose são:
- **`web-finance-app`**: Servidor Node contendo o bundle Next.js de produção.
- **`web-finance-postgres`**: Banco de dados relacional PostgreSQL com volumes persistentes estruturados no diretório de dados do Docker.
