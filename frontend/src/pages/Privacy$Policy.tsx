import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Title */}
                <section className="mb-8 md:mb-12 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">Política de Privacidade</h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Esta política descreve como coletamos, usamos e protegemos seus dados pessoais ao utilizar a Eleven Auto Parts.
                    </p>
                </section>

                {/* Content */}
                <section className="space-y-6 md:space-y-8 prose prose-sm max-w-4xl mx-auto px-2 md:px-0">
                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">1. Coleta de Dados</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Coletamos informações que você nos fornece ao criar uma conta, fazer um pedido ou se inscrever em nossa newsletter. Isso inclui nome, e‑mail, telefone, endereço e dados de pagamento.
                    </p>

                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">2. Uso dos Dados</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Utilizamos seus dados para processar pedidos, melhorar a experiência de compra, enviar comunicações promocionais (quando consentido) e cumprir obrigações legais.
                    </p>

                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">3. Compartilhamento</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Não vendemos seus dados a terceiros. Podemos compartilhar informações com parceiros logísticos e de pagamento estritamente para a execução dos serviços solicitados.
                    </p>

                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">4. Segurança</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Aplicamos criptografia SSL, armazenamos senhas com hash e seguimos as normas da LGPD para proteger suas informações.
                    </p>

                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">5. Direitos do Usuário</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através da seção "Minha Conta" ou entrando em contato conosco.
                    </p>

                    <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">6. Alterações nesta Política</h2>
                    <p className="text-[13px] md:text-base text-muted-foreground leading-relaxed">
                        Poderemos atualizar esta política periodicamente. As alterações serão publicadas nesta página com a data da última atualização.
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
