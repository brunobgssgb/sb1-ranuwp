CREATE OR REPLACE FUNCTION create_tables()
RETURNS void AS $$
BEGIN
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Create customers table
  CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create apps table
  CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    codes_available INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create codes table
  CREATE TABLE IF NOT EXISTS codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create sales table
  CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create sale_items table
  CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
  );

  -- Create sale_codes table
  CREATE TABLE IF NOT EXISTS sale_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_item_id UUID NOT NULL REFERENCES sale_items(id) ON DELETE CASCADE,
    code_id UUID NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(code_id)
  );

  -- Enable RLS
  ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
  ALTER TABLE codes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sale_codes ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

  CREATE POLICY "Enable read access for all users" ON apps FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON apps FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON apps FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON apps FOR DELETE USING (true);

  CREATE POLICY "Enable read access for all users" ON codes FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON codes FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON codes FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON codes FOR DELETE USING (true);

  CREATE POLICY "Enable read access for all users" ON sales FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON sales FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON sales FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON sales FOR DELETE USING (true);

  CREATE POLICY "Enable read access for all users" ON sale_items FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON sale_items FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON sale_items FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON sale_items FOR DELETE USING (true);

  CREATE POLICY "Enable read access for all users" ON sale_codes FOR SELECT USING (true);
  CREATE POLICY "Enable insert access for all users" ON sale_codes FOR INSERT WITH CHECK (true);
  CREATE POLICY "Enable update access for all users" ON sale_codes FOR UPDATE USING (true);
  CREATE POLICY "Enable delete access for all users" ON sale_codes FOR DELETE USING (true);
END;
$$ LANGUAGE plpgsql;