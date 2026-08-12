-- ========================================================
-- SPARKLEMAIDS CLEANING SERVICE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor
-- ========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'cleaner', 'admin')),
  avatar TEXT,
  phone TEXT,
  rating NUMERIC(2,1),
  completed_jobs_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  icon_name TEXT NOT NULL,
  estimated_hours NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADDONS TABLE
CREATE TABLE IF NOT EXISTS public.addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  addons TEXT[] DEFAULT '{}',
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled')),
  cleaner_id TEXT,
  cleaner_name TEXT,
  notes TEXT,
  proof_note TEXT,
  proof_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CLEANER AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.cleaner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id TEXT NOT NULL,
  cleaner_name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slots TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaner_availability ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PUBLIC DEMO / ANON ACCESS
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read addons" ON public.addons FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Public read availability" ON public.cleaner_availability FOR SELECT USING (true);
CREATE POLICY "Public manage availability" ON public.cleaner_availability FOR ALL USING (true);

-- SEED DATA FOR SERVICES
INSERT INTO public.services (id, name, description, base_price, icon_name, estimated_hours) VALUES
  ('deep-clean', 'Deep Home Clean', 'Thorough top-to-bottom scrub including baseboards, high dusting, and detail sanitization.', 120.00, 'Sparkles', 4.0),
  ('standard-clean', 'Standard Routine Clean', 'Essential recurring upkeep for kitchens, bathrooms, living areas, and bed making.', 75.00, 'Home', 2.5),
  ('move-in-out', 'Move In / Move Out', 'Deep spotless reset for vacant properties. Guaranteed checklist compliance for landlords.', 160.00, 'Truck', 5.0),
  ('post-construction', 'Post-Renovation Clean', 'Heavy duty dust removal, adhesive scrape, and shine polish for freshly remodeled homes.', 200.00, 'Wrench', 6.0)
ON CONFLICT (id) DO NOTHING;

-- SEED DATA FOR ADDONS
INSERT INTO public.addons (id, name, price, icon_name) VALUES
  ('fridge', 'Inside Fridge', 25.00, 'Refrigerator'),
  ('oven', 'Inside Oven', 30.00, 'Flame'),
  ('windows', 'Interior Windows', 35.00, 'Sun'),
  ('laundry', 'Wash & Fold Laundry', 25.00, 'Shirt'),
  ('balcony', 'Balcony / Patio Sweep', 20.00, 'Wind')
ON CONFLICT (id) DO NOTHING;

-- SEED DATA FOR PROFILES
INSERT INTO public.profiles (id, name, email, role, avatar, phone, rating, completed_jobs_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Jenkins', 'sarah.j@example.com', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '+1 (555) 234-5678', NULL, 0),
  ('22222222-2222-2222-2222-222222222222', 'Elena Rostova', 'elena.cleaner@example.com', 'cleaner', '/elena_cleaner.png', '+1 (555) 876-5432', 4.9, 142),
  ('33333333-3333-3333-3333-333333333333', 'Marcus Vance', 'marcus.v@example.com', 'cleaner', '/marcus_cleaner.png', '+1 (555) 345-6789', 4.8, 98),
  ('44444444-4444-4444-4444-444444444444', 'Alex Rivera (Manager)', 'admin@sparkleclean.com', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', NULL, NULL, 0)
ON CONFLICT (email) DO NOTHING;

-- SEED DATA FOR INITIAL BOOKINGS
INSERT INTO public.bookings (id, customer_id, customer_name, customer_phone, address, service_id, service_name, bedrooms, bathrooms, addons, date, time_slot, total_amount, status, cleaner_id, cleaner_name, notes) VALUES
  ('BK-1001', 'u-cust-1', 'Sarah Jenkins', '+1 (555) 234-5678', '742 Evergreen Terrace, Suite 4B', 'deep-clean', 'Deep Home Clean', 2, 2, ARRAY['fridge', 'windows'], CURRENT_DATE, '08:00 AM - 10:00 AM', 195.00, 'in_progress', 'u-clean-1', 'Elena Rostova', 'Please watch out for friendly cat (Milo). Key is under the plant pot.'),
  ('BK-1002', 'u-cust-1', 'Sarah Jenkins', '+1 (555) 234-5678', '742 Evergreen Terrace, Suite 4B', 'standard-clean', 'Standard Routine Clean', 1, 1, ARRAY['laundry'], CURRENT_DATE + INTERVAL '1 day', '10:30 AM - 12:30 PM', 100.00, 'assigned', 'u-clean-2', 'Marcus Vance', 'Standard upkeep clean.')
ON CONFLICT (id) DO NOTHING;
