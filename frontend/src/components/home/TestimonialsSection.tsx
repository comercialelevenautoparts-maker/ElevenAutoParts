import { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Interfaces Unificadas
interface Review {
  id: string | number;
  name: string;
  rating: number;
  text: string;
  source: 'google' | 'local';
  date?: string;
  photo?: string;
}

// 1. Função para buscar do Backend (Google via Proxy)
const fetchReviews = async (): Promise<Review[]> => {
  try {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const url = `${apiBase.replace(/\/$/, '')}/api/reviews`;

    console.log(`📡 Buscando depoimentos em: ${url}`);
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar depoimentos:", error);
    return [];
  }
};

const TestimonialsSection = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['allReviews'],
    queryFn: fetchReviews,
    staleTime: 1000 * 60 * 60, // 1 hora de cache no frontend
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowPrev(scrollLeft > 10);
      setShowNext(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [reviews]);

  const scrollNext = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isMobile = window.innerWidth < 1024;
      const scrollAmount = isMobile
        ? window.innerWidth * 0.92 + 24
        : (container.clientWidth / 3);
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isMobile = window.innerWidth < 1024;
      const scrollAmount = isMobile
        ? window.innerWidth * 0.92 + 24
        : (container.clientWidth / 3);
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Carregando depoimentos reais do Google...
        </div>
      </section>
    );
  }

  const displayedReviews = reviews;

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
        <div className="text-left flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mb-3">
            <span className="section-subtitle text-[10px] md:text-sm lg:order-2">DEPOIMENTOS</span>
            <h2 className="section-title text-[clamp(16px,5vw,24px)] lg:text-4xl lg:order-1">O QUE NOSSOS CLIENTES DIZEM</h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Na Eleven Auto Parts, nossos clientes são o verdadeiro motor do nosso negócio. Confira os depoimentos reais de quem já acelerou com nossos peças.
          </p>
        </div>

        <a
          href="https://www.google.com/maps/place/Eleven+Auto+Parts/@-23.6303026,-46.9118679,17z/data=!4m6!3m5!1s0x94cfa9d29a29d8cf:0x7c95903baebfaa5!8m2!3d-23.6303026!4d-46.9118679!16s%2Fg%2F11yxm7hfrk?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary hidden lg:flex items-center justify-center gap-2 w-full lg:w-auto lg:whitespace-nowrap text-sm md:text-base lg:self-end"
        >
          Ver todos as avaliações
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {displayedReviews.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-primary/20">
          <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum depoimento encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Em breve, as avaliações de nossos clientes do Google serão exibidas aqui!
          </p>
        </div>
      ) : (
        <div className="relative -mx-4 md:mx-0">
          <div
            ref={containerRef}
            className="flex items-stretch gap-6 md:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-[4vw] md:px-1 scroll-px-[4vw] md:scroll-px-1"
          >
            {displayedReviews.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-[92vw] md:min-w-[45vw] lg:min-w-[380px] lg:max-w-[420px] min-h-[280px] bg-white dark:bg-muted/50 rounded-2xl p-6 shadow-sm border border-border/50 relative flex flex-col group hover:shadow-md transition-shadow snap-center lg:snap-start"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-primary" />

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {testimonial.photo ? (
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=EBB14E&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-inner">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                      <img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="Google" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground leading-tight">{testimonial.name}</h4>
                    <div className="flex gap-0.5 items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Google</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed flex-1 italic">
                  "{testimonial.text}"
                </p>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground/70 font-medium">
                  <span>Avaliação verificada</span>
                  <span>{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Navigation Buttons - Mobile and Desktop (if > 3 reviews) */}
          {(showPrev && (displayedReviews.length > 3 || window.innerWidth < 1024)) && (
            <button
              onClick={scrollPrev}
              className="absolute left-1 lg:-left-6 top-[calc(50%-8px)] -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-border text-primary rounded-full shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95"
              aria-label="Ver avaliação anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {(showNext && (displayedReviews.length > 3 || window.innerWidth < 1024)) && (
            <button
              onClick={scrollNext}
              className="absolute right-1 lg:-right-6 top-[calc(50%-8px)] -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-border text-primary rounded-full shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95"
              aria-label="Ver próxima avaliação"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Button below reviews - Mobile only */}
      <div className="flex justify-center mt-4 lg:hidden">
        <a
          href="https://www.google.com/maps/place/Eleven+Auto+Parts/@-23.6303026,-46.9118679,17z/data=!4m6!3m5!1s0x94cfa9d29a29d8cf:0x7c95903baebfaa5!8m2!3d-23.6303026!4d-46.9118679!16s%2Fg%2F11yxm7hfrk?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm md:text-base"
        >
          Ver todos as avaliações
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default TestimonialsSection;
