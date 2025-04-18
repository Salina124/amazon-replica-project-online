
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu, User, LogOut, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from './Logo';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      
      // Check user role in metadata if user exists
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // Update role when auth state changes
        if (session?.user?.user_metadata?.role) {
          setUserRole(session.user.user_metadata.role);
        } else {
          setUserRole('customer'); // Reset to default if no role found
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  // Add the missing handleSignOut function
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Error signing out');
      } else {
        toast('Signed out successfully', {
          description: 'You have been signed out of your account',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error in sign out process:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleCartClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast('Please sign in', {
        description: 'You need to be signed in to view your cart',
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth')
        },
      });
    }
  };

  return (
    <header>
      {/* Main Navigation Bar */}
      <div className="bg-amazon-default text-white">
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center flex-wrap gap-2">
            {/* Logo */}
            <Link to="/" className="mr-2 shrink-0">
              <Logo />
            </Link>

            {/* Deliver To */}
            <button className="hidden md:flex items-center text-white hover:border border-white p-2 rounded">
              <MapPin size={18} className="mr-1" />
              <div className="text-left">
                <div className="text-gray-300 text-xs">Deliver to</div>
                <div className="font-bold">United States</div>
              </div>
            </button>

            {/* Search */}
            <div className="flex flex-1 min-w-[200px]">
              <div className="flex w-full rounded-md overflow-hidden">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px] rounded-r-none bg-gray-100 border-0">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="computers">Computers</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 rounded-none border-0 focus-visible:ring-0"
                  placeholder="Search Amazon"
                />
                <Button type="submit" className="rounded-l-none bg-amazon-yellow hover:bg-amazon-orange">
                  <Search className="h-5 w-5 text-amazon-default" />
                </Button>
              </div>
            </div>

            {/* Language Selector */}
            <button className="hidden lg:flex items-center text-white hover:border border-white p-2 rounded">
              <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" 
                   alt="US Flag" 
                   className="w-5 h-3 mr-1" />
              <span className="font-bold">EN</span>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {/* Account & Lists */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white px-2">
                    <div className="text-left">
                      <div className="text-gray-300 text-xs">Hello, {user.user_metadata?.full_name || 'User'}</div>
                      <div className="font-bold">Account & Lists</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <span>Your Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Seller Dashboard Link (only for sellers) */}
                  {userRole === 'seller' && (
                    <DropdownMenuItem asChild>
                      <Link to="/seller-dashboard" className="cursor-pointer">
                        <span>Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Chat Link */}
                  <DropdownMenuItem asChild>
                    <Link to="/chat" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden sm:block hover:border border-white p-2 rounded">
                <div className="text-gray-300 text-xs">Hello, sign in</div>
                <div className="font-bold flex items-center">
                  Account & Lists
                  <ChevronDown size={16} className="ml-1" />
                </div>
              </Link>
            )}

            {/* Returns & Orders */}
            <Link 
              to={user ? "/orders" : "/auth"} 
              className="hidden md:block hover:border border-white p-2 rounded"
            >
              <div className="text-gray-300 text-xs">Returns</div>
              <div className="font-bold">&amp; Orders</div>
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              onClick={handleCartClick}
              className="flex items-center hover:border border-white p-2 rounded"
            >
              <div className="relative">
                <ShoppingCart size={28} />
                <span className="absolute -top-1 -right-1 bg-amazon-orange text-amazon-default h-5 w-5 flex items-center justify-center rounded-full text-xs font-bold">
                  {totalItems}
                </span>
              </div>
              <span className="hidden sm:inline-block ml-1 font-bold">Cart</span>
            </Link>
          </div>
        </div>
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
