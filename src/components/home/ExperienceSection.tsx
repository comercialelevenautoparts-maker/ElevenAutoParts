import { Shield, Headphones, Layers, Truck, Globe, Leaf, Mouse } from 'lucide-react';
import experienceBg from '@/assets/experience-bg.jpg';

const features = [
  {
    icon: Shield,
    title: 'Qualidade em Cada Peça',
    description: 'Trabalhamos com marcas líderes no setor de auto peças, garantindo a qualidade, durabilidade e a originalidade de todo nosso catálogo.',
  },
  {
    icon: Headphones,
    title: 'Atendimento Personalizado',
    description: 'Nossa equipe está pronta no centro de São Paulo, atendendo pessoas de norte a sul do país de maneira rápida e precisa.',
  },
  {
    icon: Layers,
    title: 'Compatibilidade Inteligente',
    description: 'Site de vender, acessar o veículo e te mostrar um catálogo exibindo todas as peças de Limpador, filtros e lubrificantes para seu veículo.',
  },
  {
    icon: Truck,
    title: 'Entrega Rápida e Precisa',
    description: 'Mais do que uma loja, somos especialistas em logística com entrega expressa e rastreamento. Você acompanha sua encomenda em tempo real por todo o Brasil.',
  },
  {
    icon: Globe,
    title: 'Catálogo Global',
    description: 'Acesso a um inventário extenso com Limpadores da Ásia, Exportamos para mais de 10 países com marcas conhecidas e confiáveis.',
  },
  {
    icon: Leaf,
    title: 'Compromisso com Sustentabilidade',
    description: 'A Eleven Auto Parts apoia práticas ecológicas, com embalagens recicláveis e parcerias com fornecedores responsáveis e conscientes.',
  },
];

const ExperienceSection = () => {
  return (
    <section className="container mx-auto px-4 py-12 mt-24">
      <div className="container mx-auto px-4">
        {/* Header with image */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
          <div className="lg:w-1/3">
            <img
              src={experienceBg}
              alt="Eleven Auto Parts Experience"
              className="rounded-2xl shadow-elevated w-full object-cover aspect-video"
            />
          </div>
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl md:text-4xl font-medium text-[#DFB956]">ELEVEN AUTO PARTS EXPERIENCE</h2>
              <span className="section-subtitle">SOBRE NÓS</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Na Eleven Auto Parts, somos movidos pela paixão por automóveis e pelo compromisso com nosso atendimento,
              nossa jornada só está completa quando você é atendido bem. Com uma curadoria de peças
              automotivas de alta qualidade e um atendimento que coloca você no centro, trazemos a experiência
              completa. Conheça o que você precisa na hora de cuidar do seu limpador com confiança e excelência –
              juntos criamos para acelerar sua experiência em autopeças com Eleven – pois a cada detalhamento do seu carro com a importância.
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

      <div className="flex justify-center mt-24 animate-bounce">
        <Mouse className="w-8 h-8 text-[#DFB956]" />
      </div>
    </section>
  );
};

export default ExperienceSection;
