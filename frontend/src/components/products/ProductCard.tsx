import { ShoppingCart, CreditCard, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { redirectToCheckout, formatPrice } from '@/lib/stripe/checkout';
import React, { useState } from 'react';

interface ProductCardProps {
  key?: string | number;
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
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Usar uma verificação simples que não dependa de hooks complexos dentro do render
  const isFavorited = isFavorite(id);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Identificação necessária",
        description: "Sua lista de favoritos será sincronizada assim que você se identificar no checkout.",
        variant: "default",
      });
      return;
    }

    try {
      const willBeFavorite = !isFavorited;
      await toggleFavorite(id);

      toast({
        title: willBeFavorite ? "Produto favoritado!" : "Removido dos favoritos",
        description: `${name} ${willBeFavorite ? 'adicionado à' : 'removido da'} sua lista.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favoritos.",
        variant: "destructive",
      });
    }
  };

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
    <Link to={`/produto/${id}`} className="block card-product relative group border-2 border-gray-200">
      <div className="aspect-square bg-white rounded-xl flex items-center justify-center p-6 relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge de estoque */}
        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold z-10">
            Esgotado
          </div>
        )}

        {/* Botão de Favoritar */}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 transition-all duration-300 hover:scale-110 z-10 ${isFavorited
            ? 'text-red-500'
            : 'text-muted-foreground hover:text-primary'
            }`}
          title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-red-500' : ''}`} />
        </button>

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
        </div>
      </div>

      <div className="p-2 md:p-4 pb-4 md:pb-6">
        <div className="flex flex-col gap-1">
          <div className="w-full">
            <h3 className="font-bold text-[12px] md:text-[13px] text-foreground leading-tight whitespace-nowrap overflow-hidden">{name}</h3>
            <p className="text-[10px] md:text-[11px] text-muted-foreground line-clamp-1">{description}</p>
            {category && (
              <span className="inline-block mt-0.5 text-[9px] md:text-xs text-primary font-bold uppercase">
                {category}
              </span>
            )}
          </div>
          <div className="flex flex-row items-baseline justify-between mt-1">
            <span className="font-extrabold text-sm md:text-lg text-foreground whitespace-nowrap">
              {formatPrice(price)}
            </span>
            {stockQuantity > 0 && stockQuantity <= 10 && (
              <span className="text-[9px] md:text-xs text-orange-600 font-medium">
                SÓ {stockQuantity} RESTANTES
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
    </Link>
  );
};

export default ProductCard;
