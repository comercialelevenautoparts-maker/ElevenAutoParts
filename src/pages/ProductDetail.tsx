import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ChevronLeft, ChevronRight, Star, Minus, Plus, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useStripeProduct } from '@/hooks/useStripeProducts';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { data: product, isLoading, error } = useStripeProduct(id || '');

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Obter imagens principais e secundárias
  const allImages = [
    ...(product?.image ? [{ url_imagem: product.image, principal: true }] : []),
    ...(product?.produto_imagens?.map(img => ({ url_imagem: img.url_imagem, principal: img.principal })) || [])
  ];
  const [selectedSize, setSelectedSize] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground">Produto não encontrado</h2>
            <p className="text-muted-foreground mt-2">O produto que você está procurando não existe ou foi removido.</p>
            <Button
              onClick={() => navigate(-1)}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para adicionar itens ao carrinho.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!selectedSize && product.produto_tamanhos && product.produto_tamanhos.length > 0) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_promotional || product.price,
      image: product.image || '',
      size: selectedSize,
    }, quantity);

    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock_quantity || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para adicionar itens aos favoritos.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      await toggleFavorite(product.id);
      const isFav = isFavorite(product.id);
      toast({
        title: isFav ? "Produto adicionado aos favoritos!" : "Produto removido dos favoritos!",
        description: `${product.name} ${isFav ? 'foi adicionado' : 'foi removido'} da sua lista de desejos.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua lista de favoritos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl aspect-square flex items-center justify-center overflow-hidden border border-border">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]?.url_imagem}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-500">Imagem indisponível</div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    className={`bg-muted rounded-lg aspect-square flex items-center justify-center overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img.url_imagem}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
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
            </div>

            <div className="flex items-center gap-4">
              {product.price_promotional && product.price_promotional < product.price ? (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    R$ {(product.price_promotional * quantity).toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {(product.price * quantity).toFixed(2)}
                  </span>
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.price - product.price_promotional) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  R$ {(product.price * quantity).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-foreground">{product.description}</p>

            {/* Size Selection */}
            {product.produto_tamanhos && product.produto_tamanhos.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tamanho</h3>
                <div className="flex flex-wrap gap-2">
                  {product.produto_tamanhos.map((tamanho, index) => (
                    <button
                      key={tamanho.id}
                      className={`px-4 py-2 border rounded-lg ${selectedSize === tamanho.tamanho
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => setSelectedSize(tamanho.tamanho)}
                    >
                      {tamanho.tamanho}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Quantidade</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-muted rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-muted rounded-r-lg"
                    disabled={quantity >= (product.stock_quantity || 0)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Estoque: {product.stock_quantity || 0} {(product.stock_quantity || 0) === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90 py-6 text-lg"
                disabled={(product.stock_quantity || 0) <= 0}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {(product.stock_quantity || 0) <= 0 ? 'Produto Indisponível' : 'Adicionar ao Carrinho'}
              </Button>
              <Button
                variant="outline"
                className={`py-6 border-primary text-primary hover:bg-primary/5 text-lg ${isFavorite(product?.id || '') ? 'text-red-500 border-red-500 hover:bg-red-50' : ''}`}
                onClick={handleFavoriteToggle}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product?.id || '') ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-3">Informações de envio</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span>Enviamos para todo o Brasil</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Calcular frete e prazo de entrega na próxima etapa
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;