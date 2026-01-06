import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useProducts';

type SortType = 'recentes' | 'alta' | 'populares';

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState<SortType>('recentes');

  const { data: allProducts = [], isLoading } = useProducts(activeCategory);
  const { data: categories = [] } = useCategories();

  const filteredProducts = useMemo(() => {
    // Apply sorting based on sortBy
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Category Tabs and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('todos')}
            className={`category-tab ${
              activeCategory === 'todos' ? 'category-tab-active' : 'category-tab-inactive'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-tab ${
                activeCategory === cat.id ? 'category-tab-active' : 'category-tab-inactive'
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

      {/* Products Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.slice(0, 4).map((product, index) => (
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
  );
};

export default ProductsSection;
