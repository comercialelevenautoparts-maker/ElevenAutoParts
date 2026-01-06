import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductCarousel from '@/components/products/ProductCarousel';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useProducts';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes');

  const { data: allProducts = [], isLoading } = useProducts(activeCategory);
  const { data: categories = [] } = useCategories();

  // Apply sorting based on sortBy
  const sortedProducts = (() => {
    switch (sortBy) {
      case 'alta':
        // Sort by price descending (premium items)
        return [...allProducts].sort((a, b) => (b.preco_promocional || b.preco) - (a.preco_promocional || a.preco));
      case 'populares':
        // Sort by name alphabetically
        return [...allProducts].sort((a, b) => a.nome.localeCompare(b.nome));
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

              <div className="lg:w-1/3 bg-muted rounded-xl p-6">
                <h3 className="font-semibold mb-2">Ofertas exclusivas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  30% off em itens selecionados
                </p>
                <button className="btn-primary flex items-center gap-2">
                  Ver todos os produtos
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs and Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('todos')}
                className={`category-tab ${activeCategory === 'todos' ? 'category-tab-active' : 'category-tab-inactive'
                  }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-tab ${activeCategory === cat.id ? 'category-tab-active' : 'category-tab-inactive'
                    }`}
                >
                  {cat.nome}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSortBy('recentes')}
                className={`category-tab ${sortBy === 'recentes' ? 'category-tab-active' : 'category-tab-inactive'}`}
              >
                Mais recentes
              </button>
              <button
                onClick={() => setSortBy('alta')}
                className={`category-tab ${sortBy === 'alta' ? 'category-tab-active' : 'category-tab-inactive'}`}
              >
                Em alta
              </button>
              <button
                onClick={() => setSortBy('populares')}
                className={`category-tab ${sortBy === 'populares' ? 'category-tab-active' : 'category-tab-inactive'}`}
              >
                Populares
              </button>
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

            <div className="lg:w-1/3 bg-muted rounded-xl p-6">
              <h3 className="font-semibold mb-2">Ofertas exclusivas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                30% off em itens selecionados
              </p>
              <button className="btn-primary flex items-center gap-2">
                Ver todos os produtos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs and Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('todos')}
              className={`category-tab ${activeCategory === 'todos' ? 'category-tab-active' : 'category-tab-inactive'
                }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-tab ${activeCategory === cat.id ? 'category-tab-active' : 'category-tab-inactive'
                  }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortBy('recentes')}
              className={`category-tab ${sortBy === 'recentes' ? 'category-tab-active' : 'category-tab-inactive'}`}
            >
              Mais recentes
            </button>
            <button
              onClick={() => setSortBy('alta')}
              className={`category-tab ${sortBy === 'alta' ? 'category-tab-active' : 'category-tab-inactive'}`}
            >
              Em alta
            </button>
            <button
              onClick={() => setSortBy('populares')}
              className={`category-tab ${sortBy === 'populares' ? 'category-tab-active' : 'category-tab-inactive'}`}
            >
              Populares
            </button>
          </div>
        </div>

        {/* All Products Grid */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-2">Todos os produtos</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Descubra a linha completa de palhetas que une tecnologia, durabilidade e design – versatilidade perfeita em qualquer clima.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.nome}
                description={product.descricao || ''}
                price={product.preco_promocional || product.preco}
                image={product.imagem_principal || ''}
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
