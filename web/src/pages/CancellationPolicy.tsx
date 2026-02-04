import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Clock, Archive, Wallet } from 'lucide-react';

const CancellationPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-12">
                {/* Title */}
                <section className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Política de Cancelamento</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Entenda como funciona o cancelamento de pedidos na Eleven Auto Parts e os prazos para estorno.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Janela de cancelamento</h3>
                        <p className="text-muted-foreground">
                            Os pedidos podem ser cancelados até 24 horas antes à sua realização, com reembolso integral.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Archive className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Processo</h3>
                        <p className="text-muted-foreground">
                            Acesse nossa seção de Gerenciamento de Pedidos para cancelar sua pedido sem complicações.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Estorno</h3>
                        <p className="text-muted-foreground">
                            Os reembolsos de pedidos cancelados são processados em até 5-7 dias úteis.
                        </p>
                    </div>
                </div>

                {/* Detailed Content */}
                <section className="prose prose-sm max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">1. Cancelamento Antes do Envio</h2>
                        <p className="text-muted-foreground">
                            Caso seu pedido ainda não tenha sido despachado, o cancelamento pode ser feito de forma imediata através do painel "Meus Pedidos". O valor total da compra, incluindo o frete, será estornado integralmente.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">2. Pedidos em Trânsito</h2>
                        <p className="text-muted-foreground">
                            Se o pedido já foi enviado, o cancelamento não poderá ser realizado de forma imediata. Nesse caso, solicitamos que recuse a entrega no ato do recebimento. Após o retorno da mercadoria ao nosso centro de distribuição, processaremos o estorno.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">3. Reembolso por Método de Pagamento</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Cartão de Crédito:</strong> O estorno será visualizado em até duas faturas subsequentes, dependendo da operadora do cartão.</li>
                            <li><strong>PIX:</strong> O valor será devolvido para a mesma conta de origem em até 48 horas úteis.</li>
                            <li><strong>Boleto Bancário:</strong> Entraremos em contato para solicitar os dados bancários para depósito, com prazo de até 5 dias úteis.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">4. Itens Personalizados ou Sob Encomenda</h2>
                        <p className="text-muted-foreground">
                            Para itens marcados como "Personalizados" ou "Sob Encomenda", o pedido só poderá ser cancelado se a produção ainda não tiver sido iniciada. Caso contrário, poderá haver retenção de uma porcentagem do valor para cobrir custos de produção.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default CancellationPolicy;
