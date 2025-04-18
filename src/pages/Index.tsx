
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import DealCard from '@/components/DealCard';
import { carouselImages } from '@/data/carousel';
import { categories } from '@/data/categories';
import { getFeaturedProducts, getRecommendedProducts } from '@/data/products';
import { deals } from '@/data/deals';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';
import { toast } from 'sonner';

// Define product type from Supabase for type safety
interface SupabaseProduct {
  id: number;
  title: string;
  price: number;
  image_url: string;
  rating: number;
  review_count: number;
  discount_percent: number | null;
  is_prime: boolean;
  seller_id: string;
  category: string | null;
  description?: string;
  stock?: number;
  sold?: number;
  created_at?: string;
}

const Index = () => {
  const featuredProducts = getFeaturedProducts();
  const recommendedProducts = getRecommendedProducts();
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLatestProducts = async () => {
      setIsLoading(true);
      try {
        // Use any type to bypass TypeScript constraints until Supabase types are updated
        const { data, error } = await supabase
          .from('products' as any)
          .select('*')
          .order('created_at' as any, { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching latest products:', error);
          toast.error('Failed to load latest products');
          return;
        }
        
        if (data) {
          // Convert Supabase product format to our app's Product format
          const formattedProducts: Product[] = (data as SupabaseProduct[]).map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image_url,
            rating: item.rating || 0,
            reviewCount: item.review_count || 0,
            discountPercent: item.discount_percent || undefined,
            isPrime: item.is_prime || false,
            sellerId: item.seller_id,
            category: item.category || undefined
          }));
          
          setLatestProducts(formattedProducts);
        }
      } catch (err) {
        console.error('Failed to fetch latest products:', err);
        toast.error('Failed to load latest products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLatestProducts();

    // Set up real-time subscription for new products
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.new) {
            // Convert the new product to our app's Product format
            const newProduct = payload.new as SupabaseProduct;
            const formattedProduct: Product = {
              id: newProduct.id,
              title: newProduct.title,
              price: newProduct.price,
              image: newProduct.image_url,
              rating: newProduct.rating || 0,
              reviewCount: newProduct.review_count || 0,
              discountPercent: newProduct.discount_percent || undefined,
              isPrime: newProduct.is_prime || false,
              sellerId: newProduct.seller_id,
              category: newProduct.category || undefined
            };
            
            setLatestProducts(prev => [formattedProduct, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Carousel */}
        <section className="relative">
          <Carousel images={carouselImages} />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-100 to-transparent"></div>
        </section>
        
        {/* Categories Grid */}
        <section className="container mx-auto mt-6 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                image={category.image}
                link={category.link}
              />
            ))}
          </div>
        </section>
        
        {/* Latest Products Section */}
        <section className="container mx-auto mt-10 px-4">
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Latest Products</h2>
              <Link to="/products" className="text-amazon-light hover:text-amazon-orange text-sm hover:underline">
                See all products
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="border rounded-md p-4 h-60 animate-pulse">
                    <div className="bg-gray-200 h-32 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No latest products available.</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Products */}
        <section className="container mx-auto mt-10 px-4">
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Today's Deals</h2>
              <Link to="/deals" className="text-amazon-light hover:text-amazon-orange text-sm hover:underline">
                See all deals
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  id={deal.id}
                  title={deal.title}
                  image={deal.image}
                  discountPrice={deal.discountPrice}
                  originalPrice={deal.originalPrice}
                  discountPercent={deal.discountPercent}
                  claimedPercentage={deal.claimedPercentage}
                  endsIn={deal.endsIn}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* More Categories */}
        <section className="container mx-auto mt-10 px-4">
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Shop By Category</h2>
              <Link to="/categories" className="text-amazon-light hover:text-amazon-orange text-sm hover:underline">
                See all categories
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(4, 8).map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  image={category.image}
                  link={category.link}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Recommended Products */}
        <section className="container mx-auto mt-10 px-4 pb-10">
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recommended For You</h2>
              <Link to="/recommendations" className="text-amazon-light hover:text-amazon-orange text-sm hover:underline">
                See more
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
