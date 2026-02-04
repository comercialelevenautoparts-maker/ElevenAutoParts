import { Search, CreditCard, Truck, Package } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Encontre a Peça Certa',
    description: 'Selecione marca, modelo e ano do seu veículo. Nossa pesquisa inteligente garante compatibilidade.',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Checkout Seguro',
    description: 'Adicione ao carrinho, escolha pagamento: PIX com desconto, 4x no cartão ou boleto. Finalize com segurança total.',
  },
  {
    number: '03',
    icon: Truck,
    title: 'Envio Rápido',
    description: '90% das peças saem na mesma hora ou no máximo dia, com rastreamento para você acompanhar cada passo.',
  },
  {
    number: '04',
    icon: Package,
    title: 'Receba com Confiança',
    description: 'Peça empacotada com o máximo de cuidado. Garantia de troca ou devolução grátis por razões de arrependimento / até 30 dias após recebimento.',
  },
];

const SeamlessExperience = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="section-title">SEAMLESS EXPERIENCE.</h2>
          <span className="section-subtitle">COMO FUNCIONA?</span>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Na Eleven Auto Parts, fizemos uma jornada simples e rápida para você encontrar, comprar e receber suas peças. Do clique até a entrega – tudo em poucos passos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className="text-6xl md:text-7xl font-bold text-gray-300 mb-4">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeamlessExperience;
