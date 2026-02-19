import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useStripeProducts, useProductCategories } from '@/hooks/useStripeProducts';
import { VehicleFilter } from '@/components/products/VehicleFilter';

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
                  <h1 className="text-4xl md:text-5xl font-medium text-primary">
                    ENCONTRE A PALHETA <br />
                    <span className="text-primary">IDEAL PARA SEU CARRO</span>
                  </h1>
                  <span className="section-subtitle">PRODUTOS</span>
                </div>
                <p className="text-muted-foreground">
                  Descubra a linha Ecoflex com sistema de troca de refil. Tecnologia, durabilidade e economia para seu veículo.
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
              Descubra a linha completa de palhetas que une tecnologia, durabilidade e design.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Header + Tabs + Products */}
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                  ENCONTRE A PALHETA <br />
                  <span className="text-primary">IDEAL PARA SEU CARRO</span>
                </h1>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Descubra a linha Ecoflex com sistema de troca de refil. Tecnologia, durabilidade e economia para seu veículo.              </p>
            </div>

            {/* Category Tabs and Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            {/* Products Grid */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">Todos os produtos</h2>
                <p className="text-sm text-muted-foreground">
                  Descubra a linha completa de palhetas que une tecnologia, durabilidade e design.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
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
          </div>

          {/* Right Column: Vehicle Filter Component (Hidden on Mobile) */}
          <div className="hidden lg:block">
            <VehicleFilter />
          </div>
        </div>
      </main>

      <Footer />
    </div >
  );
};

export default Products;
