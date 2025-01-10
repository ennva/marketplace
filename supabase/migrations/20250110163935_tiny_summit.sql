/*
  # Marketplace Database Schema

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user profile information
      - Stores user ratings, verification status, and profile details
    
    - `assets`
      - Stores digital assets (websites, apps, domains, SaaS)
      - Includes pricing, traffic stats, and revenue information
    
  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Public read access to active listings
      - Authenticated users can create listings
      - Users can only modify their own listings
      - Profile management restricted to own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  verified BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('website', 'app', 'domain', 'saas')),
  price DECIMAL(12,2) NOT NULL,
  monthly_revenue DECIMAL(12,2),
  monthly_profit DECIMAL(12,2),
  monthly_visitors INTEGER,
  page_views INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'sold')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assets policies
CREATE POLICY "Active assets are viewable by everyone"
  ON assets FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can create assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create types/enums
CREATE TYPE asset_category AS ENUM ('website', 'app', 'domain', 'saas');
CREATE TYPE asset_status AS ENUM ('active', 'pending', 'sold');