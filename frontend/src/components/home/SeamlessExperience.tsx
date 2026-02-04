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
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-12 text-left">
        <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mb-3">
          <span className="section-subtitle text-[10px] md:text-sm lg:order-2">COMO FUNCIONA?</span>
          <h2 className="section-title text-[clamp(16px,5vw,24px)] lg:text-4xl lg:order-1">SEAMLESS EXPERIENCE.</h2>
        </div>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Na Eleven Auto Parts, fizemos uma jornada simples e rápida para você encontrar, comprar e receber suas peças. Do clique até a entrega – tudo em poucos passos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-row lg:flex-col items-start gap-4 lg:gap-0 text-left">
            <div className="text-6xl md:text-7xl font-bold text-gray-300 shrink-0 lg:mb-4 w-20 lg:w-auto leading-none">
              {step.number}
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1 lg:mb-2 text-[clamp(15px,4vw,18px)] lg:text-lg">{step.title}</h3>
              <p className="text-muted-foreground text-[clamp(11px,3.2vw,13px)] lg:text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeamlessExperience;
