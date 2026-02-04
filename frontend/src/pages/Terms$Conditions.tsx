import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-12">
                {/* Title */}
                <section className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Termos &amp; Condições</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Leia atentamente os termos que regem o uso da Eleven Auto Parts. Ao utilizar nossos serviços, você concorda com todas as cláusulas descritas abaixo.
                    </p>
                </section>

                {/* Content */}
                <section className="space-y-8 prose prose-sm max-w-4xl mx-auto">
                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar ou utilizar o site Eleven Auto Parts, você concorda em cumprir e estar vinculado a estes Termos e Condições, bem como a todas as leis e regulamentos aplicáveis.
                    </p>

                    <h2>2. Modificações</h2>
                    <p>
                        Reservamo-nos o direito de modificar estes termos a qualquer momento. Quaisquer alterações serão publicadas nesta página e entrarão em vigor imediatamente após a publicação.
                    </p>

                    <h2>3. Uso do Site</h2>
                    <p>
                        Você concorda em usar o site apenas para fins legais e de acordo com estas diretrizes. É proibido violar direitos de propriedade intelectual, enviar conteúdo ofensivo ou realizar atividades que comprometam a segurança da plataforma.
                    </p>

                    <h2>4. Política de Privacidade</h2>
                    <p>
                        Nosso tratamento de dados pessoais está descrito na <a href="/privacy$policy" className="text-primary underline">Política de Privacidade</a>. Ao utilizar o site, você aceita as práticas descritas nela.
                    </p>

                    <h2>5. Responsabilidade</h2>
                    <p>
                        A Eleven Auto Parts não se responsabiliza por danos diretos, indiretos ou consequenciais resultantes do uso ou da incapacidade de usar o site.
                    </p>

                    <h2>6. Lei Aplicável</h2>
                    <p>
                        Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais competentes de São Paulo, SP.
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default TermsConditions;
