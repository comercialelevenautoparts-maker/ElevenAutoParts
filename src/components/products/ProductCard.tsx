import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { redirectToCheckout, formatPrice } from '@/lib/stripe/checkout';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stripePriceId?: string; // ID do preço na Stripe (opcional para compatibilidade)
  category?: string;
  stockQuantity?: number;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  stripePriceId,
  category,
  stockQuantity = 0
}: ProductCardProps) => {
  const { addItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image });
    toast({
      title: "Produto adicionado!",
      description: `${name} foi adicionado ao carrinho.`,
    });
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!stripePriceId) {
      toast({
        title: "Erro",
        description: "Este produto não está disponível para compra direta.",
        variant: "destructive",
      });
      return;
    }

    if (stockQuantity <= 0) {
      toast({
        title: "Produto esgotado",
        description: "Este produto está temporariamente fora de estoque.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      await redirectToCheckout(stripePriceId, 1, {
        metadata: {
          product_id: id,
          product_name: name,
          category: category || '',
        },
      });
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível processar sua compra. Tente novamente.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const isOutOfStock = stockQuantity <= 0;

  return (
    <Link to={`/produto/${id}`} className="block card-product relative group">
      <div className="aspect-square bg-muted flex items-center justify-center p-6 relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge de estoque */}
        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Esgotado
          </div>
        )}

        {/* Botões de ação */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="icon-button icon-button-primary shadow-lg opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>

          {stripePriceId && (
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isCheckingOut}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold text-sm shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Comprar agora"
            >
              <CreditCard className="w-4 h-4" />
              {isCheckingOut ? 'Processando...' : 'Comprar'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
            {category && (
              <span className="inline-block mt-1 text-xs text-primary font-medium uppercase">
                {category}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold text-foreground whitespace-nowrap block">
              {formatPrice(price)}
            </span>
            {stockQuantity > 0 && stockQuantity <= 10 && (
              <span className="text-xs text-orange-500">
                Apenas {stockQuantity} em estoque
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-1 bg-primary w-full"></div>
    </Link>
  );
};

export default ProductCard;
