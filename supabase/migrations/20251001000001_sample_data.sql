-- Insert sample categories
INSERT INTO categories (name, image_url) VALUES
('Electronics', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147'),
('Computers', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853'),
('Smart Home', 'https://images.unsplash.com/photo-1558002038-1055e2e89a5c'),
('Home & Kitchen', 'https://images.unsplash.com/photo-1556910638-4c2a9901a40e'),
('Books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'),
('Fashion', 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908'),
('Toys & Games', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088'),
('Beauty & Personal Care', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products (without seller_id - they will be assigned later)
INSERT INTO products (title, description, price, image_url, rating, review_count, discount_percent, is_prime, category, stock) VALUES
('Apple iPhone 15 Pro Max, 512GB, Deep Blue', 'The latest iPhone with Super Retina XDR display, Pro camera system, and A17 Pro chip for groundbreaking performance.', 1299.99, 'https://images.unsplash.com/photo-1696438525707-126e94d2c1e4', 4.8, 3254, 0, true, 'Electronics', 50),
('Samsung Galaxy S24 Ultra, 512GB, Titanium Black', 'The powerful Galaxy S24 Ultra features a stunning Dynamic AMOLED 2X display with 120Hz refresh rate, advanced camera system with 200MP main camera, and S Pen support.', 1299.99, 'https://images.unsplash.com/photo-1706565236376-f69989835685', 4.7, 1876, 5, true, 'Electronics', 75),
('Apple MacBook Pro 16-inch, M3 Max chip, 32GB RAM, 1TB SSD', 'The new MacBook Pro delivers exceptional performance for demanding workflows with the powerful M3 Max chip, stunning Liquid Retina XDR display, and all-day battery life.', 3499.99, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6', 4.9, 872, 0, true, 'Computers', 30),
('Dell XPS 15, Intel Core i9, 32GB RAM, 1TB SSD, NVIDIA RTX 4070', 'A premium Windows laptop with a stunning 4K display, exceptional performance for creators, and sleek design.', 2499.99, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', 4.6, 543, 10, true, 'Computers', 25),
('Amazon Echo Show 10 (3rd Gen)', 'Smart display with Alexa featuring motion, premium sound, and a 10.1" HD screen that moves with you.', 249.99, 'https://images.unsplash.com/photo-1543512214-318c7553f230', 4.7, 12543, 20, true, 'Smart Home', 100),
('iRobot Roomba j7+ Robot Vacuum', 'Self-emptying, smart mapping robot vacuum that avoids obstacles and cleans when you're away.', 799.99, 'https://images.unsplash.com/photo-1661963153252-231fe69c9cb6', 4.4, 8754, 15, true, 'Home & Kitchen', 40),
('KitchenAid Professional 600 Series Stand Mixer', 'Professional-grade 6-quart stand mixer for all your baking needs.', 529.99, 'https://images.unsplash.com/photo-1583144369171-97facb345504', 4.8, 15233, 0, true, 'Home & Kitchen', 60),
('Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones', 'The #1 New York Times bestseller by James Clear with a revolutionary approach to habit formation.', 14.99, 'https://images.unsplash.com/photo-1603725618730-483238831d8a', 4.8, 87532, 25, true, 'Books', 200),
('The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.', 12.99, 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666', 4.7, 45632, 30, true, 'Books', 150),
('Nike Air Force 1 Men''s Sneakers', 'Iconic white sneakers with classic style and comfort.', 90.00, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb', 4.6, 32145, 0, true, 'Fashion', 100),
('LEGO Star Wars The Mandalorian Razor Crest', 'Detailed LEGO Star Wars building toy for kids and adults featuring the iconic Mandalorian ship.', 129.99, 'https://images.unsplash.com/photo-1595217399455-a97c43d19323', 4.9, 7865, 10, true, 'Toys & Games', 35),
('Dyson Airwrap Complete Styler', 'Multi-styling tool with barrels, brushes and dryer for different hair types and styles.', 599.99, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', 4.5, 23561, 0, true, 'Beauty & Personal Care', 25)
ON CONFLICT DO NOTHING;

-- Sample SQL function to create a user cart
CREATE OR REPLACE FUNCTION create_user_cart() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO carts (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create cart for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_cart(); 