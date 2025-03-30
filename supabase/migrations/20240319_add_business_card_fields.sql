-- Add business card fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS twitter text,
ADD COLUMN IF NOT EXISTS github text; 