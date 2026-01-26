import { useNavigate } from 'react-router-dom';
import { Mouse } from 'lucide-react';
import horizontalVideo from '@/assets/videos/eleven-horizontal.mov';
import verticalVideo from '@/assets/videos/eleven-vertical.mov';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/produtos');
  };

  return (
    <section className="container mx-auto px-4 py-8 md:py-16 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              ELEVE SEU CARRO COM <span className="text-primary"><br />ELEVEN AUTO PARTS</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg">
              Explore o mundo das peças automotivas na AutoParts, onde qualidade encontra preço justo. Descubra as melhores palhetas para limpeza, acessórios e peças de reposição com promoções exclusivas para manter seu veículo em perfeito estado.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex items-center gap-2 text-sm md:text-base"
              onClick={handleBuyNow}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Comprar agora
            </button>
            <button className="nav-link text-sm md:text-base" onClick={() => navigate('/suporte')}>
              Fale conosco
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
            <div>
              <div className="text-xl md:text-3xl font-bold text-foreground">MAIS DE 1000</div>
              <p className="text-xs md:text-sm text-muted-foreground">Clientes que já foram atendidos</p>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold text-foreground">99%</div>
              <p className="text-xs md:text-sm text-muted-foreground">Taxa de Satisfação do Cliente</p>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold text-foreground">24/7</div>
              <p className="text-xs md:text-sm text-muted-foreground">Conveniência nas compras</p>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold text-foreground">30 DIAS</div>
              <p className="text-xs md:text-sm text-muted-foreground">Devolução sem complicações</p>
            </div>
          </div>
        </div>

        {/* Right - Video Showcase */}
        <div className="relative aspect-[6/10] md:aspect-[16/11] w-full group p-[3px] rounded-[32px] overflow-hidden">
          {/* Rotating Border Effect (Visible on Hover) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_35%,#DFB956_50%,transparent_65%,transparent_100%)] animate-rotate opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="relative w-full h-full overflow-hidden rounded-3xl bg-black transition-all duration-500 group-hover:scale-[1.005]">
            {/* Desktop Video (Horizontal) */}
            <video
              className="hidden md:block w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={horizontalVideo} type="video/mp4" />
            </video>

            {/* Mobile Video (Vertical) */}
            <video
              className="block md:hidden w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={verticalVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-24 animate-bounce">
        <Mouse className="w-8 h-8 text-[#DFB956]" />
      </div>
    </section >
  );
};

export default HeroSection;
