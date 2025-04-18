
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  // Format price with 2 decimal places
  const formattedPrice = product.price.toFixed(2);
  
  // Calculate discount price if applicable
  const discountPrice = product.discountPercent
    ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
    : null;

  return (
    <div className="border rounded-md p-4 h-full flex flex-col transition-all hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block flex-grow">
        <div className="relative mb-4 aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="object-contain max-h-[180px] w-auto"
          />
          
          {product.discountPercent ? (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br">
              {product.discountPercent}% OFF
            </div>
          ) : null}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h3>
          
          {/* Ratings */}
          <div className="flex items-center mb-1">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-blue-600 hover:text-orange-500">{product.reviewCount}</span>
          </div>
          
          {/* Price */}
          <div className="mb-2">
            {discountPrice ? (
              <>
                <span className="text-red-600 font-medium">${discountPrice}</span>
                <span className="text-xs text-gray-500 line-through ml-1">${formattedPrice}</span>
              </>
            ) : (
              <span className="font-medium">${formattedPrice}</span>
            )}
          </div>
          
          {/* Prime badge */}
          {product.isPrime && (
            <div className="text-xs mb-2">
              <span className="text-blue-600 font-bold">Prime</span>
              <span className="text-xs text-gray-600 ml-1">FREE Delivery</span>
            </div>
          )}
        </div>
      </Link>
      
      <Button 
        onClick={handleAddToCart}
        className="mt-3 bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
      >
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;
