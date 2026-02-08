import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, RefreshCcw, CreditCard } from 'lucide-react';

const ReturnPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-12">
                {/* Title */}
                <section className="mb-8 md:mb-12 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">Política de Devolução</h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Conheça nossa política de devolução sem complicações, criada para garantir sua satisfação em todas as compras na Eleven Auto Parts.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 max-w-5xl mx-auto">
                    <div className="bg-card border border-border rounded-xl p-6 lg:p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 lg:mb-5">
                            <Package className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg lg:text-lg mb-2">Elegibilidade</h3>
                        <p className="text-[13px] lg:text-sm text-muted-foreground">
                            Os itens devem estar lacrados, com as etiquetas originais, e devolvidos em até 30 dias após a entrega.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 lg:p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 lg:mb-5">
                            <RefreshCcw className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg lg:text-lg mb-2">Processo</h3>
                        <p className="text-[13px] lg:text-sm text-muted-foreground">
                            Inicie as devoluções através da nossa Central de Devoluções para um processo rápido e eficiente.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 lg:p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 lg:mb-5">
                            <CreditCard className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg lg:text-lg mb-2">Reembolso</h3>
                        <p className="text-[13px] lg:text-sm text-muted-foreground">
                            O reembolso será processado para o método de pagamento original em até 7 a 10 dias úteis.
                        </p>
                    </div>
                </div>

                {/* Detailed Content */}
                <section className="prose prose-sm max-w-4xl mx-auto space-y-8 md:space-y-12 px-2 md:px-0">
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold">1. Condições Gerais de Devolução</h2>
                        <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                            Para que a devolução seja aceita, o produto deve estar em sua embalagem original, sem sinais de uso ou instalação, e acompanhado de todos os acessórios e manuais. Peças instaladas ou com marcas de montagem não serão aceitas para devolução, exceto em casos de defeito de fabricação.
                        </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold">2. Prazos</h2>
                        <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                            O cliente tem o direito de desistir da compra ou solicitar a troca em até 30 dias corridos a partir da data de recebimento do pedido, conforme as normas do Código de Defesa do Consumidor brasileiro.
                        </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold">3. Custos de Envio</h2>
                        <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                            A primeira devolução ou troca de cada pedido é gratuita. A Eleven Auto Parts fornecerá uma etiqueta de postagem para que o envio seja realizado sem custos adicionais através de agências dos Correios ou transportadoras parceiras.
                        </p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold">4. Análise Técnica</h2>
                        <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                            Todos os produtos devolvidos passam por uma análise técnica em nosso centro de distribuição. Este processo pode levar até 5 dias úteis após o recebimento do item. Caso seja detectado mau uso ou instalação incorreta, a devolução poderá ser recusada e o produto reenviado ao cliente.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default ReturnPolicy;
