
import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the product interface
interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  seller_id: string;
  is_prime: boolean;
  discount_percent?: number;
  stock: number;
  sold: number;
  created_at: string;
  rating?: number;
  review_count?: number;
}

// Categories for product listing
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Computers",
  "Home & Kitchen",
  "Toys & Games",
  "Beauty & Personal Care",
  "Clothing",
  "Books",
  "Sports & Outdoors",
  "Automotive",
  "Health & Household",
  "Pet Supplies",
  "Grocery",
  "Gaming"
];

const SellerDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [isPrime, setIsPrime] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Placeholder data for seller stats
  const [sellerStats, setSellerStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    avgRating: 0
  });
  
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
  
  // Fetch the user and their products
  useEffect(() => {
    const checkSellerStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to access the seller dashboard');
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Check if user is a seller or make them a seller
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      // If role is not set, update it to seller
      if (!profile?.role || profile.role !== 'seller') {
        await supabase
          .from('profiles')
          .update({ role: 'seller' })
          .eq('id', session.user.id);
      }
      
      // Fetch products for this seller
      fetchSellerProducts(session.user.id);
      
      // Fetch seller stats
      fetchSellerStats(session.user.id);
    };
    
    checkSellerStatus();
  }, [navigate]);
  
  // Fetch seller products
  const fetchSellerProducts = async (sellerId: string) => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load your products');
      } else {
        setProducts(data || []);
        
        // Update seller stats
        if (data) {
          setSellerStats(prev => ({
            ...prev,
            totalProducts: data.length
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load your products');
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Fetch seller stats
  const fetchSellerStats = async (sellerId: string) => {
    try {
      // This would be replaced with real stats from your database
      // For now, we'll use mock data
      setSellerStats({
        totalSales: 12450.75,
        totalOrders: 256,
        totalProducts: products.length,
        pendingOrders: 8,
        avgRating: 4.7
      });
    } catch (err) {
      console.error('Failed to fetch seller stats:', err);
    }
  };
  
  // Handler for adding a new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add products');
      return;
    }
    
    // Basic validation
    if (!productTitle || !productPrice || !productDescription || !productImage || !productCategory || !productStock) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const newProduct = {
        title: productTitle,
        price: parseFloat(productPrice),
        description: productDescription,
        image_url: productImage,
        category: productCategory,
        stock: parseInt(productStock),
        seller_id: user.id,
        is_prime: isPrime,
        discount_percent: productDiscount ? parseFloat(productDiscount) : null,
        sold: 0,
        rating: 0,
        review_count: 0
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select();
      
      if (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
        return;
      }
      
      toast.success('Product added successfully!', {
        description: `${productTitle} has been added to your inventory.`
      });
      
      // Refresh the product list
      fetchSellerProducts(user.id);
      
      // Reset form
      setProductTitle('');
      setProductPrice('');
      setProductDescription('');
      setProductImage('');
      setProductCategory('');
      setProductStock('');
      setProductDiscount('');
      setIsPrime(false);
    } catch (err) {
      console.error('Failed to add product:', err);
      toast.error('Failed to add product');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler for updating a product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    setIsSaving(true);
    
    try {
      const updatedProduct = {
        title: productTitle,
        price: parseFloat(productPrice),
        description: productDescription,
        image_url: productImage,
        category: productCategory,
        stock: parseInt(productStock),
        is_prime: isPrime,
        discount_percent: productDiscount ? parseFloat(productDiscount) : null,
      };
      
      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', editingProduct.id);
      
      if (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
        return;
      }
      
      toast.success('Product updated successfully!', {
        description: `${productTitle} has been updated.`
      });
      
      // Refresh the product list
      fetchSellerProducts(user.id);
      
      // Close the dialog
      setShowEditDialog(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to update product:', err);
      toast.error('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler for deleting a product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
        return;
      }
      
      toast.success('Product deleted successfully!');
      
      // Refresh the product list
      fetchSellerProducts(user.id);
      
      // Close the dialog
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Edit product handler
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductTitle(product.title);
    setProductPrice(product.price.toString());
    setProductDescription(product.description || '');
    setProductImage(product.image_url);
    setProductCategory(product.category || '');
    setProductStock(product.stock.toString());
    setProductDiscount(product.discount_percent ? product.discount_percent.toString() : '');
    setIsPrime(product.is_prime);
    setShowEditDialog(true);
  };
  
  // Open delete confirmation dialog
  const confirmDelete = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

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
                <Button 
                  className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                  onClick={() => {
                    setProductTitle('');
                    setProductPrice('');
                    setProductDescription('');
                    setProductImage('');
                    setProductCategory('');
                    setProductStock('');
                    setProductDiscount('');
                    setIsPrime(false);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </div>
              
              {loadingProducts ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amazon-button" />
                  <span className="ml-2">Loading your products...</span>
                </div>
              ) : products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border py-2 px-4 text-left">Product</th>
                        <th className="border py-2 px-4 text-right">Price</th>
                        <th className="border py-2 px-4 text-right">In Stock</th>
                        <th className="border py-2 px-4 text-right">Sold</th>
                        <th className="border py-2 px-4 text-center">Category</th>
                        <th className="border py-2 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img 
                                src={item.image_url} 
                                alt={item.title} 
                                className="w-12 h-12 object-contain mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/100x100?text=No+Image';
                                }} 
                              />
                              <div className="truncate max-w-xs">{item.title}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${item.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{item.sold || 0}</td>
                          <td className="py-3 px-4 text-center">{item.category || 'Uncategorized'}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditProduct(item)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => confirmDelete(item.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-4">You haven't added any products to your inventory yet.</p>
                  <Button 
                    onClick={() => document.querySelector('[data-state="inactive"][data-value="add-product"]')?.click()}
                    className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </div>
              )}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={productCategory} 
                      onValueChange={setProductCategory}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input 
                      id="stock" 
                      type="number"
                      min="0"
                      step="1"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                    <Input 
                      id="discount" 
                      type="number"
                      min="0"
                      max="99"
                      value={productDiscount}
                      onChange={(e) => setProductDiscount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex items-end space-x-2 h-full">
                    <div className="flex items-center space-x-2 h-10">
                      <input
                        type="checkbox"
                        id="prime"
                        checked={isPrime}
                        onChange={(e) => setIsPrime(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="prime">Eligible for Prime Delivery</Label>
                    </div>
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
                  disabled={isSaving}
                >
                  {isSaving ? 
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Product...
                    </> : 
                    'Add Product'
                  }
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
      
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Product Title</Label>
                <Input 
                  id="edit-title" 
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={productCategory} 
                  onValueChange={setProductCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input 
                  id="edit-stock" 
                  type="number"
                  min="0"
                  step="1"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Discount Percentage (%)</Label>
                <Input 
                  id="edit-discount" 
                  type="number"
                  min="0"
                  max="99"
                  value={productDiscount}
                  onChange={(e) => setProductDiscount(e.target.value)}
                />
              </div>
              
              <div className="flex items-end space-x-2 h-full">
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    id="edit-prime"
                    checked={isPrime}
                    onChange={(e) => setIsPrime(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-prime">Eligible for Prime Delivery</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)} 
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image URL</Label>
              <Input 
                id="edit-image" 
                type="url"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                disabled={isSaving}
              >
                {isSaving ? 
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </> : 
                  'Save Changes'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </> : 
                'Delete'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default SellerDashboard;
