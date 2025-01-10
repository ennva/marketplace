/*
  # Add transaction support

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, references assets)
      - `buyer_id` (uuid, references profiles)
      - `seller_id` (uuid, references profiles)
      - `amount` (decimal)
      - `status` (enum: pending, completed, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for transaction access control
*/

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

CREATE POLICY "Buyers can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    status = 'pending'
  );

CREATE POLICY "Involved parties can update transaction status"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (buyer_id, seller_id)
  )
  WITH CHECK (
    status IN ('completed', 'cancelled')
  );