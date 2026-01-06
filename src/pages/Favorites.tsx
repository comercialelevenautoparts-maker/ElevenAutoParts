import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Gift, Package, Heart, LogOut, ChevronRight, ShoppingBag, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { Tables } from '@/integrations/supabase/types';

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { favorites, loading, loadFavorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      navigate('/login');
    }
  }, [user, navigate, loadFavorites]);

  const handleRemoveFavorite = async (produtoId: string) => {
    try {
      await removeFavorite(produtoId);
      toast({
        title: 'Produto removido',
        description: 'O produto foi removido da sua lista de favoritos.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o produto dos favoritos.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = async (produto: Tables<'produtos'>) => {
    try {
      if (!user) {
        toast({
          title: "Faça login para continuar",
          description: "Você precisa estar logado para adicionar itens ao carrinho.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const selectedProdutoSize = selectedSize[produto.id];

      // Check if the product has sizes and if one is selected
      const produtoTamanhos = (produto as any).produto_tamanhos || [];
      if (produtoTamanhos && produtoTamanhos.length > 0 && !selectedProdutoSize) {
        toast({
          title: "Selecione um tamanho",
          description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }

      // Add to cart using the cart hook
      await addToCart({
        id: produto.id,
        name: produto.nome,
        price: produto.preco_promocional || produto.preco,
        image: produto.imagem_principal || '',
        size: selectedProdutoSize,
      }, 1); // Adding 1 as the default quantity

      toast({
        title: 'Produto adicionado',
        description: `${produto.nome} foi adicionado ao carrinho.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o produto ao carrinho.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: User, label: 'Informações pessoais', href: '/perfil' },
    { icon: Gift, label: 'Indique e ganhe', href: '#' },
    { icon: Package, label: 'Meus pedidos', href: '/pedidos' },
    { icon: Heart, label: 'Minha lista de desejos', href: '/favoritos', active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Minha lista de desejos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              <button
                onClick={() => {
                  // Sign out functionality would be here
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Sua lista de desejos está vazia</h2>
                <p className="text-muted-foreground mb-6">
                  Adicione produtos que você gosta para salvar na sua lista de desejos
                </p>
                <Button asChild>
                  <Link to="/">Ver produtos</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {favorites.map((favorite) => {
                  const produto = favorite.produto;
                  const produtoTamanhos = (produto as any).produto_tamanhos || [];

                  return (
                    <div
                      key={favorite.id}
                      className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-6"
                    >
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <img
                          src={produto.imagem_principal || '/placeholder.svg'}
                          alt={produto.nome}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-xl font-bold text-foreground">{produto.nome}</h3>
                          <button
                            onClick={() => handleRemoveFavorite(produto.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Heart className="w-6 h-6 fill-current" />
                          </button>
                        </div>

                        <p className="text-muted-foreground mt-1">{produto.descricao}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">(42 avaliações)</span>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          {produto.preco_promocional && produto.preco_promocional < produto.preco ? (
                            <>
                              <span className="text-2xl font-bold text-foreground">
                                R$ {produto.preco_promocional.toFixed(2)}
                              </span>
                              <span className="text-lg text-muted-foreground line-through">
                                R$ {produto.preco.toFixed(2)}
                              </span>
                              <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-medium">
                                {Math.round(((produto.preco - produto.preco_promocional) / produto.preco) * 100)}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-foreground">
                              R$ {produto.preco.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Size Selection */}
                        {produtoTamanhos && produtoTamanhos.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-foreground mb-2">Tamanho</h4>
                            <div className="flex flex-wrap gap-2">
                              {produtoTamanhos.map((tamanho) => (
                                <button
                                  key={tamanho.id}
                                  className={`px-3 py-1.5 border rounded-lg text-sm ${selectedSize[produto.id] === tamanho.tamanho
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                                  onClick={() =>
                                    setSelectedSize(prev => ({
                                      ...prev,
                                      [produto.id]: tamanho.tamanho
                                    }))
                                  }
                                >
                                  {tamanho.tamanho}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-6">
                          <Button
                            onClick={() => handleAddToCart(produto)}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Adicionar ao Carrinho
                          </Button>
                          <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/5"
                            asChild
                          >
                            <Link to={`/produto/${produto.id}`}>
                              Ver detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;