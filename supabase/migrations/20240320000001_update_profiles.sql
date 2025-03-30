-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS title varchar,
ADD COLUMN IF NOT EXISTS company varchar,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_sections jsonb DEFAULT '[]'::jsonb; 