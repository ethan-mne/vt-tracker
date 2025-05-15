/*
  # Create initial schema for ContactKeeper app

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `phone` (text, not null)
      - `created_at` (timestamptz, default now())
      - `created_by` (uuid, foreign key to auth.users)
    
    - `user_credits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `credits` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations based on user authentication
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  credits integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policies for contacts table
CREATE POLICY "Users can create their own contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for user_credits table
CREATE POLICY "Users can view their own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits record"
  ON user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);