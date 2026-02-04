import { useState } from 'react';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useFAQs } from '@/hooks/useFAQs';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import FAQSection from '@/components/home/FAQSection';

const Support = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const { data: faqs } = useFAQs();

  const tabs = ['TODOS', 'PEDIDOS', 'ENVIO', 'TROCAS/DEVOLUÇÕES', 'SUPORTE'];
  const filteredFaqs = faqs?.filter((faq) =>
    activeTab === 'todos' || faq.categoria.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Support Header */}
        <section className="mb-12">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">ATENDIMENTO</p>
          <h1 className="text-3xl font-bold text-primary mb-6">SUPORTE</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Assistência 24 horas por dia, 7 dias por semana para compras sem complicações
            e satisfação em compras para o cliente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">comercial.elevenautoparts@outlook.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">+55 11 91732-1666</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">São Paulo, SP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Return Policy */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">POLÍTICA DE DEVOLUÇÃO</h2>
              <p className="text-muted-foreground text-sm">DEVOLUÇÕES</p>
            </div>
            <Link to="/return-policy">
              <Button variant="outline" className="flex items-center gap-2">
                Leia a Política de Devolução <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground mb-6">
            Conheça nossa política de devolução sem complicações, criada para garantir sua satisfação em todas as compras.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Elegibilidade</h3>
              <p className="text-sm text-muted-foreground">
                Os itens devem estar lacrados, com as etiquetas originais, e devolvidos em até 30 dias após a entrega.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Processo</h3>
              <p className="text-sm text-muted-foreground">
                Inicie as devoluções através da nossa Central de Devoluções para um processo rápido e eficiente.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Reembolso</h3>
              <p className="text-sm text-muted-foreground">
                O reembolso será processado para o método de pagamento original em até 7 a 10 dias úteis.
              </p>
            </div>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">POLÍTICA DE CANCELAMENTO</h2>
              <p className="text-muted-foreground text-sm">CANCELAMENTO</p>
            </div>
            <Link to="/cancellation-policy">
              <Button variant="outline" className="flex items-center gap-2">
                Leia a Política de Cancelamento <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Janela de cancelamento</h3>
              <p className="text-sm text-muted-foreground">
                Os pedidos podem ser cancelados até 24 horas antes à sua realização, com reembolso integral.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Processo de cancelamento</h3>
              <p className="text-sm text-muted-foreground">
                Acesse nossa seção de Gerenciamento de Pedidos para cancelar sua pedido sem complicações.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-2">Cronograma de reembolso</h3>
              <p className="text-sm text-muted-foreground">
                Os reembolsos de pedidos cancelados são processados em até 5-7 dias úteis.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Support;
