/*
  # Update contacts table schema
  
  1. Changes
    - Split name into first_name and last_name
    - Add email, address, and location fields
    - Add support for notes and file attachments
    
  2. Security
    - Maintain existing RLS policies
    - No changes to security settings needed
*/

-- First add new columns as nullable
ALTER TABLE contacts
  ADD COLUMN first_name text,
  ADD COLUMN last_name text,
  ADD COLUMN email text,
  ADD COLUMN address text,
  ADD COLUMN zip_code text,
  ADD COLUMN notes text,
  ADD COLUMN files jsonb DEFAULT '[]',
  ADD COLUMN latitude numeric,
  ADD COLUMN longitude numeric;

-- Copy existing name data into first_name
UPDATE contacts 
SET first_name = name,
    last_name = '';

-- Now make required columns non-nullable
ALTER TABLE contacts
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

-- Finally drop the old name column
ALTER TABLE contacts DROP COLUMN name;