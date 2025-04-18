-- Create schema for tables
CREATE SCHEMA IF NOT EXISTS public;

-- Enable RLS (Row Level Security)
ALTER SCHEMA public REPLICA IDENTITY FULL;

-- Set up storage for product images
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');

-- Create users table extensions
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS shipping_addresses JSONB[];

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  discount_percent INTEGER,
  is_prime BOOLEAN DEFAULT false,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies

-- Products table policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Sellers can insert their own products" 
ON products FOR INSERT 
WITH CHECK (
  seller_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'seller')
);

CREATE POLICY "Sellers can update their own products" 
ON products FOR UPDATE 
USING (
  seller_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'seller')
);

CREATE POLICY "Sellers can delete their own products" 
ON products FOR DELETE 
USING (
  seller_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'seller')
);

-- Reviews table policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own reviews" 
ON reviews FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE 
USING (user_id = auth.uid());

-- Cart and CartItems policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" 
ON carts FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own cart" 
ON carts FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own cart items" 
ON cart_items FOR SELECT 
USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own cart items" 
ON cart_items FOR ALL
USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- Orders and OrderItems policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own orders" 
ON orders FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can view orders containing their products" 
ON orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
  ) AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND role = 'seller')
);

CREATE POLICY "Users can view their own order items" 
ON order_items FOR SELECT 
USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Create functions and triggers

-- Function to update product ratings when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE products
    SET 
      rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = OLD.product_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id)
    WHERE id = OLD.product_id;
  ELSE
    UPDATE products
    SET 
      rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update product stock when order is placed
CREATE OR REPLACE FUNCTION update_product_stock() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    stock = stock - NEW.quantity,
    sold = sold + NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stock
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" 
ON messages FOR SELECT 
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert messages they send" 
ON messages FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" 
ON messages FOR UPDATE 
USING (receiver_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- Set updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_modified
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_modified
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_carts_modified
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cart_items_modified
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 