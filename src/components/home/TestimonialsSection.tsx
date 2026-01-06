import { Star, Quote, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Mariana Silva',
    rating: 5,
    text: 'Peças com garantia, preço justo e entrega rápida por modelo de carro Não tinha isso antes. Comprei 10 kit de palhetas pra MG4/Onix e chegou em 2 dias Fantástico!',
    avatar: null,
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    rating: 5,
    text: 'A Eleven Auto Parts soluciona meu dia! Encontrei Filtros de óleo compatíveis pra meu carro ZERO em 5 minutos. Entrega rápida e suporte. Recomendo!',
    avatar: null,
  },
  {
    id: 3,
    name: 'Emily Silva',
    rating: 5,
    text: 'Atendimento top! Tive dúvida sobre compatibilidade de um módulo do meu Corolla e me ajudaram a achar perfeito. Logo confirmação rapida.',
    avatar: null,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="section-title">O QUE NOSSOS CLIENTES DIZEM</h2>
            <span className="section-subtitle">DEPOIMENTOS</span>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Na Eleven Auto Parts, nossos clientes são o verdadeiro motor do nosso negócio. Confira os depoimentos reais de quem já acelerou com nossos peças.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-1 whitespace-nowrap">
          Ver todos os depoimentos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-muted rounded-2xl p-6 relative">
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary opacity-50" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {testimonial.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
