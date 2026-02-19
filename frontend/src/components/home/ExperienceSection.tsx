import { Shield, Headphones, Layers, Truck, Globe, Leaf, Mouse } from 'lucide-react';
import experienceBg from '@/assets/experience-bg.jpg';

const features = [
  {
    icon: Shield,
    title: 'Tecnologia Aerodinâmica Ecoflex',
    description: 'Desenvolvida para máxima eficiência e limpeza silenciosa.',
  },
  {
    icon: Headphones,
    title: 'Especialistas em Limpadores Automotivos',
    description: 'Atendimento técnico para indicar o modelo ideal para seu carro.',
  },
  {
    icon: Layers,
    title: 'Busca Inteligente por Veículo',
    description: 'Encontre rapidamente a medida e o conector correto para seu carro.',
  },
  {
    icon: Truck,
    title: 'Entrega Rápida',
    description: 'Envio rápido para todo o Brasil com rastreamento.',
  },
  {
    icon: Globe,
    title: 'Durabilidade Superior',
    description: 'Desenvolvida com materiais de alta resistência e desempenho constante, garantindo mais tempo de uso antes da troca.',
  },
  {
    icon: Leaf,
    title: 'Sistema com Troca de Refil',
    description: 'Menos descarte plástico a cada substituição.',
  },
];

const ExperienceSection = () => {
  return (
    <section className="container mx-auto px-4 py-8 lg:py-12 mt-12 lg:mt-0">
      <div className="w-full">
        {/* Header with image */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 mb-12">
          <div className="lg:w-1/3 w-full">
            <img
              src={experienceBg}
              alt="Eleven Auto Parts Experience"
              className="rounded-2xl shadow-elevated w-full object-cover aspect-video"
            />
          </div>
          <div className="lg:w-2/3 text-left w-full">
            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mb-3">
              <span className="section-subtitle text-[10px] md:text-sm lg:order-2">SOBRE NÓS</span>
              <h2 className="font-medium text-primary text-[clamp(16px,5vw,24px)] lg:text-4xl lg:order-1">ELEVEN AUTO PARTS</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Inovação que eleva o padrão das palhetas automotivas.

              Na Eleven, acreditamos que segurança e economia podem caminhar juntas.
              Por isso desenvolvemos o sistema Ecoflex: uma solução inteligente que permite a troca apenas do refil, reduzindo desperdício e aumentando a durabilidade.

              Não vendemos apenas palhetas.
              Oferecemos tecnologia, compatibilidade precisa e uma escolha mais consciente para o seu veículo.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-golden-light flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-12 md:mt-24 animate-bounce">
        <Mouse className="w-6 h-6 md:w-8 md:h-8 text-primary" />
      </div>
    </section>
  );
};

export default ExperienceSection;
