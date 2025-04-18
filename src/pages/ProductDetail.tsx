import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Carousel from '@/components/Carousel';
import SellerDetails from '@/components/SellerDetails';

interface SupabaseProduct {
  id: number;
  title: string;
  price: number;
  image_url: string;
  rating: number | null;
  review_count: number | null;
  discount_percent: number | null;
  is_prime: boolean | null;
  seller_id: string;
  category: string | null;
  description?: string | null;
  stock?: number;
  sold?: number;
  created_at?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbProduct, setDbProduct] = useState<SupabaseProduct | null>(null);
  
  const productId = parseInt(id || '0');
  const mockProduct = products.find(p => p.id === productId);
  
  const relatedProducts = products
    .filter(p => p.id !== productId)
    .slice(0, 4);
  
  const [productImages, setProductImages] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (id) {
          const { data: productData, error } = await supabase
            .from('products' as any)
            .select('*')
            .eq('id', parseInt(id))
            .single();
          
          if (error) {
            console.error('Error fetching product:', error);
          } else if (productData) {
            setDbProduct(productData as SupabaseProduct);
            
            setProductImages([
              productData.image_url,
              'https://via.placeholder.com/600x400?text=Product+Image+2',
              'https://via.placeholder.com/600x400?text=Product+Image+3',
              'https://via.placeholder.com/600x400?text=Product+Image+4',
            ]);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, [id]);
  
  const product = dbProduct || mockProduct;
  
  const displayImages = productImages.length > 0 
    ? productImages 
    : [
        mockProduct?.image || '',
        'https://via.placeholder.com/600x400?text=Product+Image+2',
        'https://via.placeholder.com/600x400?text=Product+Image+3',
        'https://via.placeholder.com/600x400?text=Product+Image+4',
      ];
  
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
    
    const cartProduct: Product = {
      id: typeof product.id === 'number' ? product.id : parseInt(String(product.id)),
      title: product.title,
      price: dbProduct ? product.price : product.price,
      image: dbProduct ? (product as SupabaseProduct).image_url : (product as Product).image,
      rating: dbProduct ? (product as SupabaseProduct).rating || 0 : (product as Product).rating,
      reviewCount: dbProduct ? (product as SupabaseProduct).review_count || 0 : (product as Product).reviewCount,
      discountPercent: dbProduct ? (product as SupabaseProduct).discount_percent || undefined : (product as Product).discountPercent,
      isPrime: dbProduct ? (product as SupabaseProduct).is_prime || false : (product as Product).isPrime,
      sellerId: dbProduct ? (product as SupabaseProduct).seller_id : (product as Product).sellerId,
      category: dbProduct ? (product as SupabaseProduct).category || undefined : (product as Product).category
    };
    
    addToCart(cartProduct, quantity);
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
    
    const sellerId = dbProduct ? (product as SupabaseProduct).seller_id : ((product as Product)?.sellerId || 'default-seller');
    navigate(`/chat?seller=${sellerId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-200 h-96 rounded"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-2/4"></div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
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
  
  const formattedPrice = typeof product.price === 'number' ? product.price.toFixed(2) : '0.00';
  
  const discountPrice = dbProduct && product.discount_percent
    ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
    : !dbProduct && (product as Product).discountPercent 
      ? (product.price * (1 - (product as Product).discountPercent! / 100)).toFixed(2) 
      : null;

  const discountPercent = dbProduct ? (product as SupabaseProduct).discount_percent : (product as Product).discountPercent;
  const isPrime = dbProduct ? (product as SupabaseProduct).is_prime : (product as Product).isPrime;
  const sellerId = dbProduct ? (product as SupabaseProduct).seller_id : (product as Product).sellerId;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <Carousel images={displayImages} />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(dbProduct ? (product as SupabaseProduct).rating || 0 : (product as Product).rating) ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-600 hover:text-amazon-orange cursor-pointer">
                {dbProduct ? (product as SupabaseProduct).review_count || 0 : (product as Product).reviewCount} ratings
              </span>
            </div>
            
            {sellerId && (
              <SellerDetails sellerId={sellerId} />
            )}
            
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
                      Save {discountPercent}%
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
            
            {isPrime && (
              <div className="flex items-center mb-4">
                <span className="text-blue-600 font-bold mr-1">Prime</span>
                <span className="text-sm">FREE Delivery</span>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this item</h2>
              <p className="text-gray-700">
                {dbProduct && (product as SupabaseProduct).description 
                  ? (product as SupabaseProduct).description 
                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id."}
              </p>
            </div>
            
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
              
              {sellerId && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactSeller}
                >
                  <MessageSquare className="mr-2" size={18} />
                  Contact Seller
                </Button>
              )}
            </div>
          </div>
        </div>
        
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
                {dbProduct && (product as SupabaseProduct).description 
                  ? (product as SupabaseProduct).description 
                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id."}
              </p>
              {!dbProduct && (
                <p>
                  Donec non tortor in arcu mollis feugiat. Donec mauris tellus, iaculis at varius in, condimentum in quam. Donec euismod magna ac risus hendrerit, at mattis enim lacinia. Curabitur viverra mi tempor ex elementum, nec gravida ex finibus.
                </p>
              )}
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
                    <td className="py-2 font-medium">Category</td>
                    <td className="py-2">{dbProduct ? (product as SupabaseProduct).category || "Uncategorized" : (product as Product).category || "Electronics"}</td>
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
