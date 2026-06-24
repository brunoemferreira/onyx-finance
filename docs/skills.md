# Onyx Finance - Habilidades & Funcionalidades do Projeto

Este documento serve como repositório centralizado de todas as funcionalidades, regras de negócios e capacidades arquiteturais (skills) implementadas no sistema Onyx Finance. Ele deve ser atualizado continuamente à medida que novas capacidades forem incorporadas.

---

## 🛠️ Habilidades Técnicas & Funcionalidades

### 1. Autenticação Segura & Proteção de Rotas (NextAuth v5)
- **Middleware de Proteção**: Interceptação automática de qualquer tentativa de acesso a `/dashboard/:path*`. Redireciona usuários não autenticados para `/login`.
- **Provedores de Login**: Integração completa com Google e GitHub OAuth.
- **Ambiente de Desenvolvimento (Modo Demo)**: Provedor de credenciais simulado ("Acessar Modo Demonstração") que gera uma sessão NextAuth local legítima para testes ágeis sem chaves de API externas.
- **Root Provider**: Wrapping global da aplicação com `SessionProvider` para compartilhar a sessão com todos os Client Components.

### 2. Controle de Sessão no Painel & Perfil do Usuário
- **Sidebar Dinâmica (Desktop & Mobile)**: Exibição em tempo real do avatar do usuário, nome e e-mail. Integração do botão **Sair (Sign Out)** limpando o cookie de sessão e redirecionando para a landing page.
- **Página de Perfil (`/dashboard/profile`)**: Exibição detalhada de informações do usuário (nome, e-mail, foto, plano ativo e tempo de assinatura).

### 3. Filtros Avançados & Navegação Cronológica
- **Navegador Mensal por Setas**: Barra de navegação `< Mês Ano >` que avança/retrocede 1 mês a cada clique de forma dinâmica.
- **Filtros Combinados**: Filtros instantâneos por **Tipo** (Receitas, Despesas, Transferências), **Conta/Cartão**, **Categoria** e **Status** (Liquidado, Pendente).
- **Reset de Filtros**: Botão contextual "Limpar Filtros" para restaurar todos os dropdowns ao estado padrão.
- **Alinhamento Responsivo**: Filtros alinhados à esquerda utilizando layout flexível que evita deformações ou alongamentos em telas grandes.
- **Ordenação Interativa**: Cabeçalhos da tabela clicáveis e ordenáveis para **Data** (campo padrão de ordenação), **Descrição**, **Categoria**, **Conta** e **Valor** (com setas indicativas de direção ASC/DESC).

### 4. Cálculo Histórico de Saldo (Running Balance) & Layout da Tabela
- **Layout de Colunas Reorganizado**: Estrutura das linhas ordenada em: `Status`, `Data`, `Descrição`, `Categoria`, `Conta` e `Valor` (e `Saldo` opcional).
- **Indicadores de Tipo no Status**: O ícone circular de fluxo (Receita, Despesa ou Transferência) foi movido da coluna de Descrição para a coluna de **Status**, sendo exibido ao lado do selo de Liquidado/Pendente.
- **Cabeçalho Simplificado**: O título da coluna de contas foi simplificado de `Conta/Cartão` para apenas `Conta`.
- **Ícones de Categoria**: 
  - Exibição de ícones representativos (como `Home` para Moradia, `Car` para Transporte, `Utensils` para Alimentação, etc.) diretamente nos selos de categorias das transações na tabela.
  - Seleção visual de categorias nos formulários de **Novo Lançamento** e **Editar Lançamento** exibindo o ícone correspondente ao lado do nome da categoria no dropdown.
- **Centralização de Ações**: O botão de liquidação rápida de status (Check/Undo) foi agrupado na coluna final de Ações junto com os botões de Edição e Exclusão.
- **Abatimento Dinâmico**: A coluna "Saldo" na tabela de transações não mostra o saldo final estático, mas reconstrói o saldo cronológico linha a linha conforme as transações ocorreram no passado.
- **Lógica Reversa**: Computa os saldos anteriores revertendo operações liquidadas a partir do saldo final da conta (subtrai receitas limpas, adiciona despesas limpas, e ajusta transferências entre contas de origem/destino).
- **Filtro de Visualização**: Opção "Mostrar Saldo da Conta" no topo da listagem para exibir/ocultar esta coluna sob demanda.
- **Saldo Previsto Diário**: Exibição de uma linha de rodapé/resumo diário abaixo dos lançamentos de cada dia, calculando e listando o saldo projetado total consolidado (soma de todas as contas) no final daquele dia, posicionado exatamente abaixo da coluna de Valor.

### 5. Gestão de Contas e Cartões
- **Múltiplos Tipos de Contas**: Suporte a Contas Correntes e Cartões de Crédito.
- **Controle de Saldo Inicial**: Cadastro de fundos iniciais por conta para calibração de cálculos.
- **Visualização de Contas na Listagem (Badges Coloridas)**: Exibição do nome da conta na tabela de transações utilizando um selo (badge) estilizado dinamicamente com a cor cadastrada da conta (usando fallback cinza caso não haja cor definida), mantendo consistência com o estilo visual do sistema.

### 6. Lançamentos com Parcelas e Recorrência
- **Parcelamento Inteligente**: Criação de transações divididas em múltiplas parcelas vinculadas, com cálculo automático da parcela ativa (ex: `1/12`, `2/12`).
- **Recorrência Fixa**: Lançamentos automáticos baseados em periodicidade (semanal, mensal, anual) para despesas ou receitas fixas.

### 7. Gestão e CRUD Completo de Categorias & Subcategorias
- **Página de Categorias (`/dashboard/categories`)**: Interface dedicada e responsiva para gerenciar categorias financeiras estruturadas hierarquicamente.
- **Seeding Personalizado & Subcategorias Padrão**: Cópia individualizada de categorias e subcategorias padrões (como `Alimentação > Supermercado`, `Moradia > Aluguel`, etc.) é gerada para cada usuário em seu primeiro acesso, garantindo que tudo comece completo e 100% customizável.
- **CRUD Completo de Subcategorias**: Possibilidade de criar subcategorias vinculadas a uma categoria pai, atualizar seus dados e excluí-las. Exclusão de categoria pai remove em cascata.
- **Seletor Visual de Cores (Bolinhas)**: Escolha de cores simplificada por bolinhas coloridas interativas (20 opções selecionáveis) com marcadores de seleção (`Check`), removendo menus suspensos.
- **Customização Avançada (62 Ícones)**: Escolha expandida de 62 ícones temáticos de receitas e despesas organizados em uma paleta seletora rolável e otimizada.
- **Consistência Visual de Cores**: As cores selecionadas pelo usuário para suas categorias são automaticamente sincronizadas e exibidas em tempo real nos selos de transações (nas páginas de lançamentos e do painel principal) e nas fatias/legendas do gráfico de despesas do Dashboard.
- **Seleção Hierárquica nos Lançamentos**: O menu de seleção de categoria na tela de lançamentos exibe de forma clara e identada a árvore hierárquica (ex: `Moradia > Energia / Luz` ou `↳ Energia / Luz`).

### 8. Upload e Anexo de Comprovantes
- **Upload Seguro**: Ação de servidor (`uploadReceipt`) que salva arquivos de comprovantes na pasta `/public/uploads` com validação de tamanho máximo de 3 MB e higienização/renomeação inteligente contra conflitos.
- **Rota de API Protegida (`/api/uploads/[filename]`)**: Rota que valida a sessão do usuário via NextAuth antes de servir os arquivos, prevenindo vulnerabilidades de Path Traversal e garantindo privacidade dos dados.
- **Visualização Rápida**: Ícone de clipe de papel contextualizado na linha de lançamentos que direciona o usuário autenticado para a visualização direta do anexo.

