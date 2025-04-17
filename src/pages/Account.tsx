
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, CreditCard, Heart, Gift, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

const Account = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(true);
  const { toast } = useToast();
  
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sign In Successful",
      description: "Welcome back to Amazon!",
    });
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Successful",
      description: "Your Amazon account has been created.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Login/Register Form */}
            <div className="bg-white p-6 rounded shadow-sm mb-8">
              <Tabs defaultValue="signin" onValueChange={(val) => setIsSigningIn(val === 'signin')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                    >
                      Sign In
                    </Button>
                    
                    <div className="text-xs text-gray-600 mt-4">
                      By continuing, you agree to Amazon's 
                      <Link to="/conditions-of-use" className="text-blue-600 hover:text-amazon-orange"> Conditions of Use </Link> 
                      and 
                      <Link to="/privacy-notice" className="text-blue-600 hover:text-amazon-orange"> Privacy Notice</Link>.
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                      />
                      <p className="text-xs text-gray-600">Passwords must be at least 6 characters.</p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                    >
                      Create your Amazon account
                    </Button>
                    
                    <div className="text-xs text-gray-600 mt-4">
                      By creating an account, you agree to Amazon's 
                      <Link to="/conditions-of-use" className="text-blue-600 hover:text-amazon-orange"> Conditions of Use </Link> 
                      and 
                      <Link to="/privacy-notice" className="text-blue-600 hover:text-amazon-orange"> Privacy Notice</Link>.
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Account Dashboard - would be shown when user is logged in */}
            <div className="bg-white p-6 rounded shadow-sm">
              <h1 className="text-2xl font-bold mb-6">Your Account</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/orders" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <Package className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Your Orders</h3>
                    <p className="text-sm text-gray-600">Track, return, or buy things again</p>
                  </div>
                </Link>
                
                <Link to="/security" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <User className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Login & Security</h3>
                    <p className="text-sm text-gray-600">Edit login, name, and mobile number</p>
                  </div>
                </Link>
                
                <Link to="/addresses" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <CreditCard className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Payment Options</h3>
                    <p className="text-sm text-gray-600">Edit or add payment methods</p>
                  </div>
                </Link>
                
                <Link to="/wishlist" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <Heart className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Your Lists</h3>
                    <p className="text-sm text-gray-600">View your wishlists</p>
                  </div>
                </Link>
                
                <Link to="/gift-cards" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <Gift className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Gift Cards</h3>
                    <p className="text-sm text-gray-600">View balance or redeem a card</p>
                  </div>
                </Link>
                
                <Link to="/account-settings" className="border rounded p-4 flex items-start hover:bg-gray-50">
                  <Settings className="mr-3 text-amazon-light" size={36} />
                  <div>
                    <h3 className="font-bold">Account Settings</h3>
                    <p className="text-sm text-gray-600">Manage your account preferences</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Account;
