
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from './Logo';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for: ${searchTerm}`,
      });
    }
  };

  return (
    <header className="bg-amazon-default text-white">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-2 py-2 flex items-center flex-wrap gap-2">
        {/* Logo */}
        <Link to="/" className="mr-2 shrink-0">
          <Logo />
        </Link>
        
        {/* Deliver To */}
        <div className="hidden md:flex items-center mr-2 text-sm">
          <MapPin size={18} className="mr-1" />
          <div>
            <div className="text-gray-300 text-xs">Deliver to</div>
            <div className="font-bold">United States</div>
          </div>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 min-w-[180px]">
          <div className="flex w-full rounded-md overflow-hidden">
            <div className="hidden md:flex items-center justify-center bg-gray-200 text-black px-3 text-xs">
              All
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search Amazon"
            />
            <Button type="submit" className="rounded-none bg-amazon-yellow hover:bg-amazon-orange">
              <Search className="h-5 w-5 text-amazon-default" />
            </Button>
          </div>
        </form>
        
        {/* Account & Lists */}
        <Link to="/account" className="hidden sm:block ml-2 text-sm">
          <div className="text-gray-300 text-xs">Hello, sign in</div>
          <div className="font-bold">Account & Lists</div>
        </Link>
        
        {/* Returns & Orders */}
        <Link to="/orders" className="hidden md:block ml-2 text-sm">
          <div className="text-gray-300 text-xs">Returns</div>
          <div className="font-bold">& Orders</div>
        </Link>
        
        {/* Cart */}
        <Link to="/cart" className="flex items-center ml-2">
          <div className="relative">
            <ShoppingCart size={28} />
            <span className="absolute -top-1 -right-1 bg-amazon-orange text-amazon-default h-5 w-5 flex items-center justify-center rounded-full text-xs font-bold">
              0
            </span>
          </div>
          <span className="hidden sm:inline-block ml-1 font-bold">Cart</span>
        </Link>
      </div>
      
      {/* Secondary Nav */}
      <div className="bg-amazon-light py-2 px-4 flex items-center overflow-x-auto">
        <Button variant="ghost" className="text-white flex items-center px-2">
          <Menu size={20} className="mr-1" />
          <span>All</span>
        </Button>
        <nav className="flex space-x-4 text-sm">
          <Link to="/today-deals" className="text-white whitespace-nowrap hover:underline">Today's Deals</Link>
          <Link to="/customer-service" className="text-white whitespace-nowrap hover:underline">Customer Service</Link>
          <Link to="/registry" className="text-white whitespace-nowrap hover:underline">Registry</Link>
          <Link to="/gift-cards" className="text-white whitespace-nowrap hover:underline">Gift Cards</Link>
          <Link to="/sell" className="text-white whitespace-nowrap hover:underline">Sell</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
