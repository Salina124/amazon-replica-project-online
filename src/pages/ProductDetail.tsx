import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Carousel from '@/components/Carousel';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  // Find product by ID
  const product = products.find(p => p.id === parseInt(id || '0'));
  
  // Related products (simple implementation - just show other products)
  const relatedProducts = products
    .filter(p => p.id !== parseInt(id || '0'))
    .slice(0, 4);
  
  // Sample product images for carousel
  const productImages = [
    product?.image || '',
    'https://via.placeholder.com/600x400?text=Product+Image+2',
    'https://via.placeholder.com/600x400?text=Product+Image+3',
    'https://via.placeholder.com/600x400?text=Product+Image+4',
  ];
  
  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!user) {
      toast('Please sign in', {
        description: 'You need to be signed in to add items to your cart',
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth')
        },
      });
      return;
    }
    
    addToCart(product, quantity);
  };
  
  const handleContactSeller = () => {
    if (!user) {
      toast('Please sign in', {
        description: 'You need to be signed in to contact sellers',
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth')
        },
      });
      return;
    }
    navigate(`/chat?seller=${product?.sellerId}`);
  };
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Format price with 2 decimal places
  const formattedPrice = product.price.toFixed(2);
  
  // Calculate discount price if applicable
  const discountPrice = product.discountPercent
    ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <Carousel images={productImages} />
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            
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
              <span className="text-sm text-blue-600 hover:text-amazon-orange cursor-pointer">
                {product.reviewCount} ratings
              </span>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              {discountPrice ? (
                <>
                  <div className="flex items-center">
                    <span className="text-sm">List Price: </span>
                    <span className="text-sm text-gray-500 line-through ml-1">${formattedPrice}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl font-medium">Price: </span>
                    <span className="text-xl text-red-600 font-medium ml-1">${discountPrice}</span>
                    <span className="ml-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                      Save {product.discountPercent}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <span className="text-xl font-medium">Price: </span>
                  <span className="text-xl font-medium ml-1">${formattedPrice}</span>
                </div>
              )}
            </div>
            
            {/* Prime badge */}
            {product.isPrime && (
              <div className="flex items-center mb-4">
                <span className="text-blue-600 font-bold mr-1">Prime</span>
                <span className="text-sm">FREE Delivery</span>
              </div>
            )}
            
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this item</h2>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id.
              </p>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className="mr-4">Quantity:</span>
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 border-r"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 border-l"
                    disabled={quantity >= 10}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
              >
                <ShoppingCart className="mr-2" size={18} />
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Heart className="mr-2" size={18} />
                Add to Wish List
              </Button>
              
              <Button
                onClick={handleContactSeller}
                className="mt-4 bg-amazon-button text-amazon-default hover:bg-amazon-button-hover flex items-center"
              >
                <MessageSquare className="mr-2" size={18} />
                Contact Seller
              </Button>
            </div>
            
            {/* Share */}
            <div className="mt-6">
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Share2 className="mr-1" size={16} />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Information Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-4 border rounded-b">
              <h3 className="text-lg font-semibold mb-2">Product Description</h3>
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.
              </p>
              <p>
                Donec non tortor in arcu mollis feugiat. Donec mauris tellus, iaculis at varius in, condimentum in quam. Donec euismod magna ac risus hendrerit, at mattis enim lacinia. Curabitur viverra mi tempor ex elementum, nec gravida ex finibus.
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="p-4 border rounded-b">
              <h3 className="text-lg font-semibold mb-2">Technical Specifications</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Brand</td>
                    <td className="py-2">Amazon Basics</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Model</td>
                    <td className="py-2">AB-100</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Dimensions</td>
                    <td className="py-2">10 x 8 x 2 inches</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Weight</td>
                    <td className="py-2">1.5 pounds</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Material</td>
                    <td className="py-2">Aluminum</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="reviews" className="p-4 border rounded-b">
              <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < 4 ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="font-medium">Great product!</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">By John D. on April 15, 2025</p>
                <p>This product exceeded my expectations. The quality is excellent and it works perfectly for my needs.</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < 5 ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="font-medium">Absolutely love it!</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">By Sarah M. on April 10, 2025</p>
                <p>I've been using this for a month now and it's been fantastic. Highly recommend!</p>
              </div>
            </TabsContent>
            <TabsContent value="faq" className="p-4 border rounded-b">
              <h3 className="text-lg font-semibold mb-2">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Q: Is this product compatible with Model XYZ?</h4>
                  <p className="text-gray-700">A: Yes, this product is fully compatible with Model XYZ and all newer versions.</p>
                </div>
                <div>
                  <h4 className="font-medium">Q: How long does the battery last?</h4>
                  <p className="text-gray-700">A: The battery typically lasts 8-10 hours of continuous use on a full charge.</p>
                </div>
                <div>
                  <h4 className="font-medium">Q: Does this come with a warranty?</h4>
                  <p className="text-gray-700">A: Yes, this product comes with a 1-year limited manufacturer warranty.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
