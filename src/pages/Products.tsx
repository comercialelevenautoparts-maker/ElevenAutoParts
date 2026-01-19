import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductCarousel from '@/components/products/ProductCarousel';
import { useStripeProducts, useProductCategories } from '@/hooks/useStripeProducts';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes');

  // Buscando apenas produtos integrados com a Stripe
  const { data: allProducts = [], isLoading } = useStripeProducts(activeCategory);
  const { data: categories = [] } = useProductCategories() as any;

  // Apply sorting based on sortBy
  const sortedProducts = (() => {
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
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="lg:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl md:text-5xl font-medium text-[#D4AF37]">
                    EXPLORE NOSSOS PRODUTOS
                  </h1>
                  <span className="section-subtitle">PRODUTOS</span>
                </div>
                <p className="text-muted-foreground">
                  Explore as palhetas da AutoParts e escolha o melhor entre nossas mais de 45 peças automotivas – projetadas para todos os tipos de veículos, de hatchs compactos a pickups robustas, passando por SUVs, sedans e utilitários.
                </p>
              </div>
            </div>
          </div>

          {/* Category Tabs and Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: any) => (
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

          {/* Loading skeleton */}
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-2">Todos os produtos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Descubra a linha completa de palhetas que une tecnologia, durabilidade e design – versatilidade perfeita em qualquer clima.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-4xl font- text-[#D4AF37]">
                  EXPLORE NOSSOS PRODUTOS
                </h1>
                <span className="section-subtitle">PRODUTOS</span>
              </div>
              <p className="text-muted-foreground">
                Explore as palhetas da AutoParts e escolha o melhor entre nossas mais de 45 peças automotivas – projetadas para todos os tipos de veículos, de hatchs compactos a pickups robustas, passando por SUVs, sedans e utilitários.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs and Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
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

        {/* All Products Grid */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-2">Todos os produtos</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Descubra a linha completa de palhetas que une tecnologia, durabilidade e design – versatilidade perfeita em qualquer clima.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
