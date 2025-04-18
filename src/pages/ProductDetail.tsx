import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Check, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProductById, getRecommendedProducts } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  
  // Convert id to number for lookup
  const productId = id ? parseInt(id) : 0;
  const product = getProductById(productId);
  const similarProducts = getRecommendedProducts().filter(p => p.id !== productId).slice(0, 4);
  
  // Mock product images - in a real app, these would come from the product data
  const productImages = [
    product?.image,
    'https://m.media-amazon.com/images/I/71fPRVAQwhL._AC_SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71-5sawWJYL._AC_SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71tIdI+zBwL._AC_SL1500_.jpg',
  ];
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link to="/" className="text-amazon-light hover:text-amazon-orange">
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const formattedPrice = product.price.toFixed(2);
  const discountPrice = product.discountPercent
    ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
    : null;
    
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/cart';
  };
  
  const nextImage = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };
  
  const prevImage = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-amazon-orange">Home</Link>
            <span className="mx-2">&gt;</span>
            <Link to="/category/electronics" className="hover:text-amazon-orange">Electronics</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-700">{product.title}</span>
          </div>
          
          {/* Product Detail Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="col-span-1">
              <div className="sticky top-6">
                <div className="relative mb-4 aspect-square border rounded-md flex items-center justify-center overflow-hidden bg-white">
                  <img
                    src={productImages[activeImage]}
                    alt={product.title}
                    className="max-h-[400px] max-w-full object-contain"
                  />
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    aria-label="Previous image"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    aria-label="Next image"
                  >
                    <ArrowRight size={16} />
                  </button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {activeImage + 1} / {productImages.length}
                  </div>
                </div>
                
                {/* Thumbnail gallery */}
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`border rounded min-w-[60px] h-[60px] flex items-center justify-center ${
                        activeImage === index ? 'border-amazon-orange' : 'border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} - Thumbnail ${index + 1}`}
                        className="max-h-[50px] max-w-[50px] object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="col-span-1">
              <h1 className="text-xl font-medium mb-2">{product.title}</h1>
              
              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                    />
                  ))}
                </div>
                <Link to="#reviews" className="text-sm text-blue-600 hover:text-amazon-orange">
                  {product.reviewCount.toLocaleString()} ratings
                </Link>
              </div>
              
              <div className="border-b pb-4 mb-4"></div>
              
              {/* Price */}
              <div className="mb-4">
                {discountPrice ? (
                  <>
                    <span className="text-sm">Price:</span>
                    <div className="flex items-baseline">
                      <span className="text-red-600 text-2xl font-medium mr-2">${discountPrice}</span>
                      <span className="text-gray-500 line-through">${formattedPrice}</span>
                    </div>
                    <div className="text-red-600 font-medium">
                      You Save: ${(product.price - parseFloat(discountPrice)).toFixed(2)} ({product.discountPercent}%)
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Price:</span>
                    <div className="text-2xl font-medium">${formattedPrice}</div>
                  </>
                )}
              </div>
              
              {/* Prime badge */}
              {product.isPrime && (
                <div className="flex items-center text-sm mb-4">
                  <span className="text-blue-600 font-bold mr-1">Prime</span>
                  <span className="mr-2">FREE Delivery</span>
                  <span className="font-bold text-green-600">Tomorrow by 9PM</span>
                </div>
              )}
              
              {/* Features */}
              <div className="mb-4">
                <h2 className="font-bold mb-2">About this item:</h2>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Premium quality product with advanced features</li>
                  <li>Compatible with multiple devices and platforms</li>
                  <li>Long battery life and energy efficient</li>
                  <li>Compact design yet powerful performance</li>
                  <li>Backed by a 2-year warranty</li>
                </ul>
              </div>
            </div>
            
            {/* Buy Box */}
            <div className="col-span-1">
              <div className="border rounded-md p-4 sticky top-6">
                {discountPrice ? (
                  <div className="text-xl font-medium mb-1">${discountPrice}</div>
                ) : (
                  <div className="text-xl font-medium mb-1">${formattedPrice}</div>
                )}
                
                {product.isPrime && (
                  <div className="flex items-center text-sm mb-3">
                    <span className="text-blue-600 font-bold mr-1">Prime</span>
                    <span className="mr-2">FREE Delivery</span>
                  </div>
                )}
                
                <div className="text-green-600 text-sm font-medium mb-4">
                  In Stock
                </div>
                
                {/* Quantity Selector */}
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm mb-1">Quantity:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded py-1 px-2 w-20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  className="w-full mb-2 bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                >
                  Add to Cart
                </Button>
                
                {/* Buy Now Button */}
                <Button 
                  onClick={handleBuyNow}
                  className="w-full mb-4 bg-amazon-orange hover:bg-amazon-orange/90"
                >
                  Buy Now
                </Button>
                
                {/* Secure Transaction */}
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <ShieldCheck size={14} className="mr-1" />
                  <span>Secure transaction</span>
                </div>
                
                {/* Ships from and sold by */}
                <div className="text-xs mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Ships from</span>
                    <span>Amazon.com</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Sold by</span>
                    <span>Amazon.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns</span>
                    <span>Eligible for Return, Refund or Replacement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Description */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, 
                nisl nunc aliquet nisl, nec aliquam nisl nisl nec nisl. Sed euismod, nisl nec ultricies lacinia, 
                nisl nunc aliquet nisl, nec aliquam nisl nisl nec nisl.
              </p>
              <p>
                Vivamus maximus magna in purus fermentum, id tristique justo lacinia. Integer non bibendum eros. 
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; 
                Sed non justo ut enim egestas eleifend. Morbi at sapien eu dolor scelerisque malesuada. 
              </p>
              <p>
                Nullam lacus urna, elementum et aliquam at, rutrum vitae arcu. Integer fermentum hendrerit feugiat. 
                Proin vulputate eros vitae libero dapibus, et condimentum diam egestas. Aliquam tempus eget est ut tincidunt.
              </p>
            </div>
          </div>
          
          {/* Similar Products */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          
          {/* Customer Reviews */}
          <div className="mt-12 border-t pt-8" id="reviews">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="flex items-center mb-6">
              <div className="flex mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < Math.floor(product.rating) ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xl">{product.rating} out of 5</span>
            </div>
            
            <div className="text-sm mb-4">{product.reviewCount.toLocaleString()} global ratings</div>
            
            {/* Sample Reviews */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">John Doe</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < 5 ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold mb-2">Great product, exceeded my expectations!</h3>
                <p className="text-sm text-gray-700">
                  This product is amazing! It works exactly as described and the quality is outstanding.
                  I would definitely recommend it to anyone looking for this type of product.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Jane Smith</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < 4 ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold mb-2">Very good but could be better</h3>
                <p className="text-sm text-gray-700">
                  Overall I'm pleased with my purchase. The product works well but there are a few minor issues
                  that could be improved. Still, for the price, it's a great value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
