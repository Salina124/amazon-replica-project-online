
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  Package, 
  LineChart, 
  DollarSign, 
  ShoppingBag, 
  Settings, 
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState('');
  const navigate = useNavigate();
  
  // Placeholder data for seller stats
  const sellerStats = {
    totalSales: 12450.75,
    totalOrders: 256,
    totalProducts: 42,
    pendingOrders: 8,
    avgRating: 4.7
  };
  
  // Mock inventory data
  const inventory = [
    { 
      id: 1, 
      title: 'Wireless Bluetooth Headphones', 
      price: 59.99, 
      stock: 15, 
      sold: 87 
    },
    { 
      id: 2, 
      title: 'Smart Watch with Heart Rate Monitor', 
      price: 89.99, 
      stock: 8, 
      sold: 132 
    },
    { 
      id: 3, 
      title: 'Portable External SSD 1TB', 
      price: 129.99, 
      stock: 22, 
      sold: 64 
    },
    { 
      id: 4, 
      title: 'Ultra HD 4K Action Camera', 
      price: 149.99, 
      stock: 5, 
      sold: 45 
    },
    { 
      id: 5, 
      title: 'Noise Cancelling Earbuds', 
      price: 79.99, 
      stock: 0, 
      sold: 93 
    },
  ];
  
  // Mock orders data
  const orders = [
    {
      id: 'ORD-12345',
      customer: 'John Smith',
      date: '2025-04-15',
      status: 'Shipped',
      total: 149.97,
      items: 3
    },
    {
      id: 'ORD-12344',
      customer: 'Sarah Johnson',
      date: '2025-04-15',
      status: 'Processing',
      total: 89.99,
      items: 1
    },
    {
      id: 'ORD-12343',
      customer: 'Michael Brown',
      date: '2025-04-14',
      status: 'Delivered',
      total: 239.98,
      items: 2
    },
    {
      id: 'ORD-12342',
      customer: 'Jessica Williams',
      date: '2025-04-14',
      status: 'Processing',
      total: 59.99,
      items: 1
    },
    {
      id: 'ORD-12341',
      customer: 'David Miller',
      date: '2025-04-13',
      status: 'Delivered',
      total: 329.95,
      items: 4
    },
  ];
  
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate adding a product
    setTimeout(() => {
      toast.success('Product added successfully!', {
        description: `${productTitle} has been added to your inventory.`
      });
      
      // Reset form
      setProductTitle('');
      setProductPrice('');
      setProductDescription('');
      setProductImage('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Check if user is a seller
  React.useEffect(() => {
    const checkSellerStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to access the seller dashboard');
        navigate('/auth');
        return;
      }
      
      const userRole = session.user.user_metadata?.role;
      
      if (userRole !== 'seller') {
        toast.error('You do not have seller privileges');
        navigate('/');
      }
    };
    
    checkSellerStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
          
          {/* Seller Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-3">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-xl font-bold">${sellerStats.totalSales.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-3">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-xl font-bold">{sellerStats.totalOrders}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-3">
                <Package className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Products</p>
                <p className="text-xl font-bold">{sellerStats.totalProducts}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-3">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-xl font-bold">{sellerStats.pendingOrders}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-3">
                <LineChart className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Avg. Rating</p>
                <p className="text-xl font-bold">{sellerStats.avgRating}</p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="inventory" className="bg-white rounded shadow">
            <TabsList className="p-2 border-b w-full rounded-none justify-start">
              <TabsTrigger value="inventory" className="data-[state=active]:bg-gray-200">
                <Package className="mr-2 h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-gray-200">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="add-product" className="data-[state=active]:bg-gray-200">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-200">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            {/* Inventory Tab */}
            <TabsContent value="inventory" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Inventory</h2>
                <Button className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border py-2 px-4 text-left">Product</th>
                      <th className="border py-2 px-4 text-right">Price</th>
                      <th className="border py-2 px-4 text-right">In Stock</th>
                      <th className="border py-2 px-4 text-right">Sold</th>
                      <th className="border py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.title}</td>
                        <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${item.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{item.sold}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders" className="p-4">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border py-2 px-4 text-left">Order ID</th>
                      <th className="border py-2 px-4 text-left">Customer</th>
                      <th className="border py-2 px-4 text-left">Date</th>
                      <th className="border py-2 px-4 text-right">Total</th>
                      <th className="border py-2 px-4 text-center">Items</th>
                      <th className="border py-2 px-4 text-center">Status</th>
                      <th className="border py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{order.id}</td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4 text-right">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">{order.items}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium 
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            {/* Add Product Tab */}
            <TabsContent value="add-product" className="p-4">
              <h2 className="text-xl font-bold mb-4">Add New Product</h2>
              
              <form onSubmit={handleAddProduct} className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title</Label>
                    <Input 
                      id="title" 
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="Product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)} 
                    placeholder="Detailed product description..."
                    rows={5}
                    required
                  />
                </div>
                
                <div className="space-y-2 mb-6">
                  <Label htmlFor="image">Product Image URL</Label>
                  <Input 
                    id="image" 
                    type="url"
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  
                  {productImage && (
                    <div className="mt-2 border rounded p-4 flex justify-center">
                      <img 
                        src={productImage} 
                        alt="Product preview" 
                        className="h-40 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/200x200?text=Invalid+Image';
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding Product...' : 'Add Product'}
                </Button>
              </form>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="p-4">
              <h2 className="text-xl font-bold mb-4">Seller Account Settings</h2>
              
              <div className="max-w-2xl">
                <div className="bg-gray-50 p-4 rounded border mb-6">
                  <h3 className="font-medium mb-2">Shop Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shop-name">Shop Name</Label>
                      <Input id="shop-name" defaultValue="ElectroGadgets Store" />
                    </div>
                    <div>
                      <Label htmlFor="shop-email">Business Email</Label>
                      <Input id="shop-email" type="email" defaultValue="contact@electrogadgets.com" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border mb-6">
                  <h3 className="font-medium mb-2">Payment Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account-holder">Account Holder Name</Label>
                      <Input id="account-holder" defaultValue="John Smith" />
                    </div>
                    <div>
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input id="account-number" defaultValue="XXXX-XXXX-XXXX-4567" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border mb-6">
                  <h3 className="font-medium mb-2">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="order-notifications">Order Notifications</Label>
                      <input type="checkbox" defaultChecked id="order-notifications" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="review-notifications">Review Notifications</Label>
                      <input type="checkbox" defaultChecked id="review-notifications" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="promo-notifications">Promotional Emails</Label>
                      <input type="checkbox" defaultChecked id="promo-notifications" className="toggle" />
                    </div>
                  </div>
                </div>
                
                <Button className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover">
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
