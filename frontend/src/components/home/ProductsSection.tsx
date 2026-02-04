import { useState, useMemo } from 'react';
import { ChevronRight, Mouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { useStripeProducts, useProductCategories } from '@/hooks/useStripeProducts';

type SortType = 'recentes' | 'alta' | 'populares';

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState<SortType>('recentes');

  const { data: allProducts = [], isLoading } = useStripeProducts(activeCategory);
  const { data: categories = [] } = useProductCategories() as any;

  const filteredProducts = useMemo(() => {
    // Apply sorting based on sortBy
    switch (sortBy) {
      case 'alta':
        // Sort by price descending (premium items)
        return [...allProducts].sort((a, b) => (b.price_promotional || b.price) - (a.price_promotional || a.price));
      case 'populares':
        // Sort by name alphabetically
        return [...allProducts].sort((a, b) => a.name.localeCompare(b.name));
      case 'recentes':
      default:
        // Sort by creation date (most recent first)
        return [...allProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [allProducts, sortBy]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="section-title">EXPLORE NOSSOS PRODUTOS</h2>
              <span className="section-subtitle">PRODUTOS</span>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Explore nossa linha 4P1 Peças de Carro. Reúne peças originais e equivalentes de alta qualidade – Todos verificados por técnicos
              do ramo de autopeças e acessórios.
            </p>
          </div>
          <Link to="/produtos" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            Ver todos os produtos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-5 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div className="text-left flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 mb-3">
            <span className="section-subtitle text-[10px] md:text-sm lg:order-2">PRODUTOS</span>
            <h2 className="section-title text-[clamp(16px,5vw,24px)] lg:text-4xl lg:order-1">EXPLORE NOSSOS PRODUTOS</h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            Explore nossa linha 4P1 Peças de Carro. Reúne peças originais e equivalentes de alta qualidade – Todos verificados por técnicos
            do ramo de autopeças e acessórios.
          </p>
        </div>
        <Link to="/produtos" className="btn-primary hidden lg:flex items-center justify-center gap-2 w-full lg:w-auto lg:whitespace-nowrap text-sm md:text-base lg:self-end">
          Ver todos os produtos
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Tabs and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 5).map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-tab ${activeCategory === cat.id ? 'category-tab-active' : 'category-tab-inactive'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description || ''}
            price={product.price_promotional || product.price}
            image={product.image || ''}
            stripePriceId={product.stripe_price_id || undefined}
            stockQuantity={product.stock_quantity}
          />
        ))}
      </div>

      {/* Button below products - Mobile only */}
      <div className="flex justify-center mt-8 lg:hidden">
        <Link to="/produtos" className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm md:text-base">
          Ver todos os produtos
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default ProductsSection;
