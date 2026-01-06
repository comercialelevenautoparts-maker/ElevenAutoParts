import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqCategories = ['TODOS', 'PEDIDOS', 'ENVIO', 'TROCAS/DEVOLUÇÕES', 'SUPORTE'];

const faqItems = [
  {
    question: 'Posso alterar meu pedido após a confirmação?',
    answer: 'Sim, você pode alterar seu pedido em até 2 horas após a confirmação, desde que ainda não tenha sido despachado.',
    category: 'PEDIDOS',
  },
  {
    question: 'Como faço um pedido na Eleven Auto Parts?',
    answer: 'Navegue pelo nosso site, adicione os produtos ao carrinho e finalize a compra com seu método de pagamento preferido.',
    category: 'PEDIDOS',
  },
  {
    question: 'Como rastrear meu pedido?',
    answer: 'Após o envio, você receberá um código de rastreamento por e-mail para acompanhar sua entrega em tempo real.',
    category: 'ENVIO',
  },
  {
    question: 'Como criar uma conta na Eleven Auto Parts?',
    answer: 'Clique em "Entrar" > "Criar Conta", preencha com e-mail, CPF e senha. Confira garantias! Histórico de compras e rastreamento fácil.',
    category: 'SUPORTE',
  },
  {
    question: 'Quais formas de pagamento vocês aceitam?',
    answer: 'Aceitamos cartões de crédito, débito, PIX e boleto bancário.',
    category: 'PEDIDOS',
  },
  {
    question: 'Posso cancelar a assinatura da newsletter?',
    answer: 'Sim, você pode cancelar a qualquer momento clicando no link de descadastro no rodapé dos nossos e-mails.',
    category: 'SUPORTE',
  },
  {
    question: 'Há taxas extras em devoluções?',
    answer: 'Não, as devoluções dentro do prazo de 30 dias são gratuitas.',
    category: 'TROCAS/DEVOLUÇÕES',
  },
  {
    question: 'Onde fazem troca de peças?',
    answer: 'Realizamos trocas em nossa loja física e também oferecemos logística reversa para trocas online.',
    category: 'TROCAS/DEVOLUÇÕES',
  },
  {
    question: 'Qual é a política de frete?',
    answer: 'Oferecemos frete grátis para compras acima de R$200. Para valores menores, o frete é calculado pelo CEP.',
    category: 'ENVIO',
  },
  {
    question: 'Meus dados estão seguros na Eleven Auto Parts?',
    answer: 'Sim, utilizamos criptografia SSL e seguimos todas as normas da LGPD para proteger seus dados.',
    category: 'SUPORTE',
  },
  {
    question: 'Posso aferir os dados da minha conta?',
    answer: 'Sim, você pode acessar e editar seus dados a qualquer momento no painel "Minha Conta".',
    category: 'SUPORTE',
  },
];

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQ = activeCategory === 'TODOS'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <section className="container mx-auto px-4 py-16 mt-24">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="section-title">TEM PERGUNTAS? NÓS TEMOS AS RESPOSTAS.</h2>
          <span className="section-subtitle">FAQ</span>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Facilitamos sua experiência com uma base completa. Nosso FAQ cobre tudo o que você precisa saber sobre como comprar com segurança e praticidade na Eleven Auto Parts.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {faqCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFAQ.map((item, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
            >
              <span className="font-medium text-sm pr-4">{item.question}</span>
              {openIndex === index ? (
                <Minus className="w-4 h-4 flex-shrink-0 text-primary" />
              ) : (
                <Plus className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
