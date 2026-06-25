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
- **Reposicionamento do Perfil no Header**: Acesso ao perfil e informações de usuário removido do menu lateral (sidebar) e consolidado no canto superior direito do header, contendo Avatar, Nome e E-mail com ícone dropdown.
- **Menu Dropdown Interativo**: Ao clicar no bloco de perfil no header, abre-se um menu suspenso contendo links para "Meu Perfil", "Assinatura" e o botão "Sair".
- **Página de Perfil (`/dashboard/profile`)**: Exibição detalhada de informações cadastrais do usuário (nome, e-mail, foto, status do perfil e data de criação).
- **Upload de Fotos Customizadas para Contas Locais**: Se o usuário se cadastrou por e-mail e senha (Credentials), a página de perfil permite que ele suba e altere sua foto de perfil de forma interativa. Contas sociais (Google/GitHub OAuth) herdam e travam a imagem importada do provedor.

### 3. Filtros Avançados & Navegação Cronológica
- **Navegador Mensal por Setas**: Barra de navegação `< Mês Ano >` que avança/retrocede 1 mês a cada clique de forma dinâmica tanto na listagem de lançamentos quanto na tela de dashboard (sincronizando todos os gráficos).
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
- **Interface de Parcelamento Aprimorada**: A seção de repetição foi renomeada para **"Parcelamento"** (e label para **"Tipo"**), contendo uma visualização prévia em formato de tabela que indica o valor exato rateado individual de cada parcela em R$.
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

### 9. Cards de Resumos Premium & Gráficos Avançados
- **Painéis de Resumo Interativos**: Cards de Receitas, Despesas e Saldo no topo do Dashboard com design de sub-cards coloridos e expansíveis (gavetas "Ver detalhes" / "Ocultar detalhes").
- **Visualização de Saldo Previsto**: Cálculo dinâmico de saldo futuro (`Saldo Bancário Atual + Receitas Pendentes - Despesas Pendentes`).
- **Modo Privacidade (Olho)**: Funcionalidade global que mascara todos os valores e saldos dos cards substituindo os números por `R$ ••••` ao clicar no ícone do olho.
- **Gráfico de Despesas Multitabs**: O card de despesas por categoria suporta quatro abas superiores ("Todas", "Receitas", "Despesas", "Não Pagas"), exibe o total acumulado do período no centro da rosca, mostra o período de datas de forma textual e lista a porcentagem representativa de cada categoria.

### 10. Sistema Padronizado de Toasts & Feedback Visual
- **Biblioteca de Toasts (`sonner`)**: Implementação global do componente `<Toaster />` no layout raiz, fornecendo notificações animadas e estilizadas para interações do usuário.
- **Substituição de Alertas Nativos**: Remoção completa de caixas de diálogo síncronas `alert(...)` do navegador, substituindo-as por toasts de sucesso e erro na alteração de foto de perfil, uploads de comprovantes de transações e checkouts de assinatura do Stripe.
- **Ajuste de Limite de Upload (Server Actions)**: Configuração do Next.js para aceitar payloads de até 4 MB para Server Actions (`experimental.serverActions.bodySizeLimit: "4mb"`), resolvendo a limitação padrão de 1 MB e garantindo que o upload de fotos de perfil e comprovantes de transação ocorra com sucesso mesmo com arquivos grandes.

### 11. Recuperação e Redefinição de Senha Segura (Credentials)
- **Token Criptográfico Temporário**: Geração de tokens de uso único e temporários (`crypto.randomBytes`) com expiração de 1 hora salvos nas colunas `reset_token` e `reset_token_expires` do banco de dados PostgreSQL.
- **Proteção contra Enumeração de E-mail**: O fluxo de solicitação de recuperação de senha retorna uma resposta de sucesso genérica no frontend, impedindo que terceiros consigam deduzir quais endereços de e-mail estão cadastrados no sistema.
- **Ambiente de Testes Otimizado (Console Log)**: Quando as credenciais de SMTP não estão parametrizadas no `.env`, o sistema imprime o link de redefinição contendo o token diretamente nos logs do terminal do Docker, agilizando testes locais e validações rápidas.
- **Integração SMTP (nodemailer)**: Suporte pronto para disparar e-mails formatados em HTML e texto claro em produção, bastando parametrizar as variáveis SMTP em seu arquivo de variáveis de ambiente.
- **Interface Segura**: Páginas dedicadas `/forgot-password` e `/reset-password` integradas ao design system escuro e responsivo do Onyx Finance, incluindo validações de senha robustas e notificações via Toast.

### 12. Seletor Premium de Instituições Financeiras (Combobox Pesquisável)
- **Mais de 40 Bancos Integrados**: Listagem automática de todas as instituições financeiras e fintechs atuantes no Brasil com base na biblioteca local do projeto.
- **Barra de Busca Inteligente**: Caixa de texto com filtro instantâneo por digitação que localiza bancos por nome ou palavra-chave de forma extremamente rápida.
- **Atalhos de Bancos Populares**: Seção superior com grid de ícones dos 8 bancos mais utilizados (Nubank, Itaú, Bradesco, etc.) permitindo seleção instantânea com um único clique.
- **Consistência Visual com Logotipos**: Exibição integrada do logotipo em alta definição do banco selecionado em todos os cards de contas e no formulário de criação/edição.
- **Fechamento e Foco Inteligentes**: Interface flutuante que se fecha automaticamente ao selecionar um item ou ao clicar fora da área do seletor.
