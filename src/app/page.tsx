import Link from "next/link";
import { ArrowRight, BarChart3, CreditCard, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <span className="text-white dark:text-black font-black text-sm">O</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-zinc-900 dark:text-zinc-50">Onyx<span className="font-light text-zinc-500">Finance</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Planos</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Código</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                Acessar App
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
                Registrar-se <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-20 md:py-32 px-4 overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-transparent to-transparent dark:from-zinc-900/30 -z-10" />
        <div className="container mx-auto max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
            Lançamento Oficial SaaS
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 leading-tight max-w-3xl">
            Sua vida financeira sob controle. Com elegância.
          </h1>
          
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mb-8 leading-relaxed">
            Uma plataforma de finanças pessoais completa. Gerencie contas, cartões de crédito com fechamento inteligente, orçamentos mensais e parcelas recorrentes. Tudo em uma interface monocromática minimalista.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm">
            <Link href="/dashboard" className="w-full">
              <Button size="lg" className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200">
                Começar Grátis
              </Button>
            </Link>
            <a href="#features" className="w-full">
              <Button size="lg" variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">
                Ver Funcionalidades
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 bg-zinc-50 dark:bg-zinc-950/40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Tudo o que você precisa para dominar suas finanças
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Desenvolvido para pessoas exigentes que valorizam velocidade, precisão e uma interface limpa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50 mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-2">Cartões de Crédito Inteligentes</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Configure o dia de fechamento, vencimento e limite de crédito. O sistema calcula automaticamente o saldo da fatura atual e o limite disponível.
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50 mb-4">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-2">Recorrências e Parcelas</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Crie despesas parceladas (ex: 12x) ou assinaturas mensais. O sistema gerencia as datas e projeta seus fluxos futuros automaticamente.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-zinc-50 mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-2">Orçamentos Dinâmicos</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Defina metas de gastos por categoria para cada mês e acompanhe o progresso com barras visuais limpas e alertas inteligentes de limites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Planos Simples e Transparentes
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Escolha o plano ideal para suas necessidades. Comece gratuitamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="flex flex-col p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background relative">
              <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50 mb-2">Básico</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Para quem está começando a organizar as contas.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">R$0</span>
                <span className="text-zinc-500">/mês</span>
              </div>
              
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 mb-8 flex-1">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-50" /> Até 2 Contas ou Cartões</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-50" /> Registro Manual de Transações</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-50" /> Até 50 Transações mensais</li>
                <li className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 line-through"><Zap className="h-4 w-4" /> Planejamentos (Budgets) mensais</li>
              </ul>

              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">
                  Começar Agora
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col p-8 rounded-xl border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-950 text-zinc-50 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-zinc-100 text-zinc-900 text-xs px-2 py-0.5 rounded font-semibold">
                Popular
              </div>
              <h3 className="font-bold text-xl mb-2">Premium</h3>
              <p className="text-sm text-zinc-400 mb-6">Controle absoluto para suas finanças pessoais avançadas.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">R$19</span>
                <span className="text-zinc-400">,90/mês</span>
              </div>

              <ul className="space-y-3 text-sm text-zinc-300 mb-8 flex-1">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-100" /> Contas e Cartões Ilimitados</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-100" /> Lançamentos Parcelados & Recorrentes</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-100" /> Transações ilimitadas</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-100" /> Planejamento e Metas por Categoria</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-100" /> Exportação completa (CSV/OFX)</li>
              </ul>

              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
                  Assinar Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-sm">
          <div>
            © {new Date().getFullYear()} Onyx Finance. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Termos</a>
            <a href="#" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
