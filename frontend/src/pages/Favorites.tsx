import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { Tables } from '@/integrations/supabase/types';
import ProfileSidebar from '@/components/account/ProfileSidebar';

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
    }
  }, [user]);

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


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Minha lista de desejos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Content */}
          <div className="lg:col-span-3">
            {(() => {
              const validFavorites = favorites.filter(fav => fav.produto);

              if (validFavorites.length === 0) {
                return (
                  <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-sm">
                    <Heart className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2">Sua lista de desejos está vazia</h2>
                    <p className="text-muted-foreground text-xs md:text-sm max-w-xs mx-auto mb-6">
                      Adicione produtos que você gosta para salvar na sua lista de desejos
                    </p>
                    <Button asChild className="h-9 md:h-11 text-[10px] md:text-sm font-bold uppercase tracking-widest px-8">
                      <Link to="/">Ver produtos</Link>
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {validFavorites.map((favorite) => {
                    const produto = favorite.produto!;
                    const produtoTamanhos = (produto as any).produto_tamanhos || [];

                    return (
                      <div
                        key={favorite.id}
                        className="bg-card border border-border rounded-xl p-3 md:p-6 shadow-sm flex gap-4 md:gap-6"
                      >
                        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-muted/30 rounded-lg p-2">
                          <img
                            src={produto.imagem_principal || '/placeholder.svg'}
                            alt={produto.nome}
                            className="w-full h-full object-contain rounded-lg transition-transform hover:scale-110"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm md:text-xl font-bold text-foreground line-clamp-2 md:line-clamp-1">{produto.nome}</h3>
                            <button
                              onClick={() => handleRemoveFavorite(produto.id)}
                              className="text-destructive hover:scale-110 transition-transform flex-shrink-0"
                            >
                              <Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                            </button>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 hidden md:block">{produto.descricao}</p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 md:w-4 md:h-4 ${i < 4 ? 'text-primary fill-current' : 'text-muted-foreground/30'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] md:text-sm text-muted-foreground font-medium">(42)</span>
                          </div>

                          <div className="flex items-baseline gap-2 mt-2">
                            {produto.preco_promocional && produto.preco_promocional < produto.preco ? (
                              <>
                                <span className="text-lg md:text-2xl font-black text-primary">
                                  R$ {produto.preco_promocional.toFixed(2)}
                                </span>
                                <span className="text-[10px] md:text-lg text-muted-foreground line-through font-medium">
                                  R$ {produto.preco.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg md:text-2xl font-black text-foreground">
                                R$ {produto.preco.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Size Selection */}
                          {produtoTamanhos && produtoTamanhos.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Tamanho</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {produtoTamanhos.map((tamanho) => (
                                  <button
                                    key={tamanho.id}
                                    className={`px-2 py-1 md:px-3 md:py-1.5 border-2 rounded-lg text-[10px] md:text-sm font-bold transition-all ${selectedSize[produto.id] === tamanho.tamanho
                                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                      : 'border-muted hover:border-primary/50'
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

                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button
                              onClick={() => handleAddToCart(produto)}
                              className="flex-1 btn-primary h-9 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                              Adicionar
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-primary text-primary hover:bg-primary/5 h-9 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest"
                              asChild
                            >
                              <Link to={`/produto/${produto.id}`}>
                                Detalhes
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;