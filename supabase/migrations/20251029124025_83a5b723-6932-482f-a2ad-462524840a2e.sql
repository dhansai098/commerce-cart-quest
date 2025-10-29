-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for checkout history
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly accessible"
  ON public.products FOR SELECT
  USING (true);

-- Cart is accessible by session
CREATE POLICY "Cart items accessible by session"
  ON public.cart FOR ALL
  USING (true);

-- Orders are publicly writable (for checkout)
CREATE POLICY "Orders are publicly writable"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders are publicly readable"
  ON public.orders FOR SELECT
  USING (true);

-- Insert mock products
INSERT INTO public.products (name, price, description, stock) VALUES
  ('Wireless Headphones', 79.99, 'Premium noise-cancelling wireless headphones', 25),
  ('Smart Watch', 199.99, 'Fitness tracking smartwatch with heart rate monitor', 15),
  ('Laptop Stand', 49.99, 'Ergonomic aluminum laptop stand', 40),
  ('USB-C Hub', 34.99, '7-in-1 USB-C hub with HDMI and card readers', 50),
  ('Mechanical Keyboard', 129.99, 'RGB mechanical gaming keyboard', 20),
  ('Wireless Mouse', 39.99, 'Ergonomic wireless mouse with precision sensor', 35),
  ('Phone Case', 24.99, 'Premium protective phone case', 60),
  ('Portable Charger', 44.99, '20000mAh fast-charging power bank', 30);