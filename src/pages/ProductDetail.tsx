import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, MessageSquare, Store, User } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SellerProfile {
  id: string;
  full_name: string;
  company_name?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  products_count?: number;
}

// Add a new Seller Details component
const SellerDetails = ({ sellerId }: { sellerId: string }) => {
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [sellerProductCount, setSellerProductCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        // Fetch seller profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();

        if (profileError) {
          console.error('Error fetching seller profile:', profileError);
          return;
        }

        // Fetch seller product count
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('seller_id', sellerId);

        if (countError) {
          console.error('Error fetching seller product count:', countError);
          return;
        }

        setSellerProfile(profileData);
        setSellerProductCount(count || 0);
      } catch (err) {
        console.error('Failed to fetch seller details:', err);
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  if (!sellerProfile) return null;

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
      <div className="flex items-center mb-2">
        <div className="mr-4">
          <img 
            src={sellerProfile.avatar_url || 'https://via.placeholder.com/50'} 
            alt={sellerProfile.full_name} 
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{sellerProfile.full_name || 'Seller'}</p>
          {sellerProfile.company_name && (
            <p className="text-sm text-gray-600">{sellerProfile.company_name}</p>
          )}
        </div>
      </div>
      {sellerProfile.bio && (
        <p className="text-sm text-gray-700 mb-2">{sellerProfile.bio}</p>
      )}
      <div className="text-sm text-gray-600">
        Products listed: {sellerProductCount}
      </div>
      <button 
        onClick={() => navigate(`/seller/${sellerId}`)}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        View Seller Profile
      </button>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  
  // We still use the mock data as fallback, but prefer the real data
  const mockProduct = products.find(p => p.id === parseInt(id || '0'));
  
  const relatedProducts = products
    .filter(p => p.id !== parseInt(id || '0'))
    .slice(0, 4);
  
  // Real product images
  const [productImages, setProductImages] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // Fetch real product data
        if (id) {
          // Try to fetch from the database first
          const { data: productData, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', parseInt(id))
            .single();
          
          if (error) {
            console.error('Error fetching product:', error);
          } else if (productData) {
            setDbProduct(productData);
            
            // If we have real product data, set the images
            setProductImages([
              productData.image_url,
              'https://via.placeholder.com/600x400?text=Product+Image+2',
              'https://via.placeholder.com/600x400?text=Product+Image+3',
              'https://via.placeholder.com/600x400?text=Product+Image+4',
            ]);
            
            // Fetch seller info
            if (productData.seller_id) {
              const { data: sellerData, error: sellerError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', productData.seller_id)
                .single();
              
              if (sellerError) {
                console.error('Error fetching seller:', sellerError);
              } else if (sellerData) {
                // Count the number of products by this seller
                const { count, error: countError } = await supabase
                  .from('products')
                  .select('*', { count: 'exact' })
                  .eq('seller_id', productData.seller_id);
                
                setSeller({
                  id: sellerData.id,
                  full_name: sellerData.full_name || 'Unknown Seller',
                  company_name: sellerData.company_name,
                  avatar_url: sellerData.avatar_url,
                  bio: sellerData.bio,
                  rating: sellerData.rating || 4.5,
                  products_count: count || 0
                });
              }
            }
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
  
  // Combine mock and real data, preferring real data
  const product = dbProduct || mockProduct;
  
  // Use real images if available, otherwise fall back to mock
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
    
    // Create a product object that matches the expected Product interface
    const cartProduct: Product = {
      id: product.id,
      title: product.title,
      price: dbProduct ? product.price : product.price,
      image: dbProduct ? product.image_url : product.image,
      rating: product.rating || 0,
      reviewCount: dbProduct ? product.review_count : product.reviewCount,
      discountPercent: dbProduct ? product.discount_percent : product.discountPercent,
      isPrime: dbProduct ? product.is_prime : product.isPrime,
      sellerId: dbProduct ? product.seller_id : product.sellerId,
      category: dbProduct ? product.category : product.category
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
    
    const sellerId = dbProduct ? product.seller_id : (product?.sellerId || 'default-seller');
    navigate(`/chat?seller=${sellerId}`);
  };
  
  const handleViewSellerProfile = () => {
    if (seller) {
      navigate(`/seller/${seller.id}`);
    }
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
  
  const formattedPrice = dbProduct ? product.price.toFixed(2) : product.price.toFixed(2);
  
  const discountPrice = dbProduct
    ? (product.discount_percent ? (product.price * (1 - product.discount_percent / 100)).toFixed(2) : null)
    : (product.discountPercent ? (product.price * (1 - product.discountPercent / 100)).toFixed(2) : null);

  const discountPercent = dbProduct ? product.discount_percent : product.discountPercent;
  const isPrime = dbProduct ? product.is_prime : product.isPrime;

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
                    className={i < Math.floor(dbProduct ? product.rating || 0 : product.rating) ? "fill-amazon-orange text-amazon-orange" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-600 hover:text-amazon-orange cursor-pointer">
                {dbProduct ? product.review_count || 0 : product.reviewCount} ratings
              </span>
            </div>
            
            {/* Seller Information Card */}
            {product?.seller_id && (
              <SellerDetails sellerId={product.seller_id} />
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
                {dbProduct && product.description 
                  ? product.description 
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
            </div>
            
            <div className="mt-6">
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Share2 className="mr-1" size={16} />
                Share
              </Button>
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
                {dbProduct && product.description 
                  ? product.description 
                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui."}
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
                    <td className="py-2">{dbProduct ? product.category || "Uncategorized" : product.category || "Electronics"}</td>
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
