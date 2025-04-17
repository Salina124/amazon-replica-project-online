
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      setVerificationSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-sm p-6 my-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        {verificationSent ? (
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 text-lg font-bold">Verification Email Sent</AlertTitle>
              <AlertDescription className="text-green-700">
                We've sent a verification link to <strong>{email}</strong>
              </AlertDescription>
            </Alert>
            
            <h2 className="text-xl font-bold mb-4">Check your email</h2>
            <p className="text-gray-600 mb-4">
              Please check your email inbox and click on the verification link to complete your registration.
            </p>
            <p className="text-gray-600 mb-4">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
            
            <div className="mt-6">
              <Button 
                onClick={() => setVerificationSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Return to sign in
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as 'signin' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <h1 className="text-xl font-bold">Sign in to your account</h1>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-amazon-button hover:bg-amazon-button-hover text-amazon-default"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
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
                <form onSubmit={handleRegister} className="space-y-4">
                  <h1 className="text-xl font-bold">Create account</h1>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="First and last name"
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
                      placeholder="your@email.com"
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
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-600">Passwords must be at least 6 characters.</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-amazon-button hover:bg-amazon-button-hover text-amazon-default"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create your Amazon account'}
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
        )}
      </div>
    </div>
  );
}
