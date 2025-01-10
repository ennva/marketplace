/*
  # Add due diligence system

  1. New Tables
    - `due_diligence_requests`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, references assets)
      - `buyer_id` (uuid, references profiles)
      - `status` (enum: pending, in_progress, completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `verification_items`
      - `id` (uuid, primary key)
      - `request_id` (uuid, references due_diligence_requests)
      - `type` (enum: analytics, financial, legal, technical)
      - `title` (text)
      - `description` (text)
      - `status` (enum: pending, verified, rejected)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for access control
*/

-- Create status enums
CREATE TYPE due_diligence_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE verification_type AS ENUM ('analytics', 'financial', 'legal', 'technical');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create due diligence requests table
CREATE TABLE IF NOT EXISTS due_diligence_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  status due_diligence_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification items table
CREATE TABLE IF NOT EXISTS verification_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES due_diligence_requests(id) NOT NULL,
  type verification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status verification_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE due_diligence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_items ENABLE ROW LEVEL SECURITY;

-- Due diligence requests policies
CREATE POLICY "Users can view their own due diligence requests"
  ON due_diligence_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_id
      AND assets.seller_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create due diligence requests"
  ON due_diligence_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Involved parties can update due diligence requests"
  ON due_diligence_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_id
      AND assets.seller_id = auth.uid()
    )
  );

-- Verification items policies
CREATE POLICY "Users can view verification items for their requests"
  ON verification_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM due_diligence_requests
      WHERE due_diligence_requests.id = request_id
      AND (
        due_diligence_requests.buyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM assets
          WHERE assets.id = due_diligence_requests.asset_id
          AND assets.seller_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create verification items for their requests"
  ON verification_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM due_diligence_requests
      WHERE due_diligence_requests.id = request_id
      AND (
        due_diligence_requests.buyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM assets
          WHERE assets.id = due_diligence_requests.asset_id
          AND assets.seller_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update verification items for their requests"
  ON verification_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM due_diligence_requests
      WHERE due_diligence_requests.id = request_id
      AND (
        due_diligence_requests.buyer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM assets
          WHERE assets.id = due_diligence_requests.asset_id
          AND assets.seller_id = auth.uid()
        )
      )
    )
  );