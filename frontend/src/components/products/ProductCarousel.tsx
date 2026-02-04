import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductCarouselProps {
  title: string;
  description?: string;
  products: Product[];
}

const ProductCarousel = ({ title, description, products }: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out gap-6"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` }}
          >
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4"
              >
                <ProductCard
                  {...product}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="progress-bar transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%` }}
          />
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="icon-button icon-button-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            disabled={currentIndex === maxIndex}
            className="icon-button icon-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
