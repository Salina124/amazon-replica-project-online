
import React from 'react';
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

const Index = () => {
  const featuredProducts = getFeaturedProducts();
  const recommendedProducts = getRecommendedProducts();
  
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
