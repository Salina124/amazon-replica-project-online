
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { products } from '@/data/products';

// Sample cart items
const initialCartItems = [
  { ...products[0], quantity: 1 },
  { ...products[3], quantity: 2 },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const { toast } = useToast();
  
  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => {
      const itemPrice = item.discountPercent 
        ? item.price * (1 - item.discountPercent / 100) 
        : item.price;
      return total + itemPrice * item.quantity;
    }, 0
  );
  
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  };
  
  const handleProceedToCheckout = () => {
    toast({
      title: "Proceeding to Checkout",
      description: "This would navigate to the checkout page in a complete implementation.",
    });
  };
  
  // Recommendations - products not in cart
  const recommendations = products
    .filter((product) => !cartItems.some((item) => item.id === product.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded shadow-sm">
                  <div className="flex justify-between border-b pb-2 mb-4">
                    <h2 className="text-xl font-bold">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </h2>
                    <span className="text-right font-medium">Price</span>
                  </div>
                  
                  {/* Cart Item List */}
                  <div className="space-y-6">
                    {cartItems.map((item) => {
                      const itemPrice = item.discountPercent 
                        ? item.price * (1 - item.discountPercent / 100) 
                        : item.price;
                      
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row border-b pb-6">
                          {/* Product Image */}
                          <div className="mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                            <Link to={`/product/${item.id}`}>
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-[100px] h-[100px] object-contain"
                              />
                            </Link>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row justify-between">
                              <div className="flex-grow mr-4">
                                <Link to={`/product/${item.id}`} className="text-lg font-medium hover:text-amazon-orange">
                                  {item.title}
                                </Link>
                                
                                <div className="text-sm text-green-600 mt-1">In Stock</div>
                                
                                {item.isPrime && (
                                  <div className="flex items-center text-xs mt-1">
                                    <span className="text-blue-600 font-bold mr-1">Prime</span>
                                    <span>FREE Delivery</span>
                                  </div>
                                )}
                                
                                {/* Quantity selector and delete */}
                                <div className="flex items-center mt-4">
                                  <select
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                    className="border border-gray-300 rounded py-1 px-2 mr-4"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                      <option key={num} value={num}>
                                        {num}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <button 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-sm text-blue-600 hover:text-amazon-orange flex items-center"
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                              
                              {/* Price */}
                              <div className="text-right font-medium mt-2 sm:mt-0">
                                ${itemPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Subtotal */}
                  <div className="text-right text-xl font-bold mt-6">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}): ${subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <Check size={16} className="mr-2" />
                      <span className="text-sm">Your order qualifies for FREE Shipping.</span>
                    </div>
                    
                    <p className="text-xl font-bold">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}): ${subtotal.toFixed(2)}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-amazon-button text-amazon-default hover:bg-amazon-button-hover"
                  >
                    Proceed to checkout
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow-sm text-center">
              <h2 className="text-2xl font-bold mb-4">Your Amazon Cart is empty</h2>
              <p className="mb-4">Your shopping cart is waiting. Give it purpose – fill it with groceries, clothing, household supplies, electronics, and more.</p>
              <Link to="/">
                <Button className="bg-amazon-button text-amazon-default hover:bg-amazon-button-hover">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
          
          {/* Recommendations */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">
              {cartItems.length === 0 ? "Recommended for you" : "Customers who bought items in your cart also bought"}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
