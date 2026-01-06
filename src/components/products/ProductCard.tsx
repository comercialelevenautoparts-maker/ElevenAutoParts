import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const ProductCard = ({ id, name, description, price, image }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no botão dispare o link
    addItem({ id, name, price, image });
    toast({
      title: "Produto adicionado!",
      description: `${name} foi adicionado ao carrinho.`,
    });
  };

  return (
    <Link to={`/produto/${id}`} className="block card-product relative group">
      <div className="aspect-square bg-muted flex items-center justify-center p-6 relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-4 icon-button icon-button-primary shadow-lg opacity-100 transition-all duration-200 hover:scale-110"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="font-bold text-foreground whitespace-nowrap">R$ {price.toFixed(2)}</span>
        </div>
      </div>
      <div className="h-1 bg-primary w-full"></div>
    </Link>
  );
};

export default ProductCard;
