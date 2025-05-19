/*
  # Add new contact fields

  1. Changes
    - Add new columns to contacts table:
      - first_name (text)
      - last_name (text)
      - email (text)
      - address (text)
      - zip_code (text)
      - notes (text)
      - files (jsonb array)
      - latitude (numeric)
      - longitude (numeric)
    - Remove old name column
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE contacts
  ADD COLUMN name text NOT NULL,
  ADD COLUMN last_name text NOT NULL,
  ADD COLUMN email text,
  ADD COLUMN address text,
  ADD COLUMN zip_code text,
  ADD COLUMN notes text,
  ADD COLUMN files jsonb[] DEFAULT '{}',
  ADD COLUMN latitude numeric,
  ADD COLUMN longitude numeric;

-- Copy existing name to first_name temporarily
UPDATE contacts SET first_name = name;

-- Remove old name column
ALTER TABLE contacts DROP COLUMN name;