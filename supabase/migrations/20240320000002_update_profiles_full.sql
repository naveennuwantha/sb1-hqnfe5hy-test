-- Update profiles table with all required fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS heading jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{
  "mobile": null,
  "email": null,
  "sms": null,
  "enabled": []
}'::jsonb,
ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{
  "label": null,
  "line1": null,
  "city": null,
  "state": null,
  "country": null,
  "zipcode": null,
  "map_url": null
}'::jsonb,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{
  "facebook": {"url": null, "enabled": true},
  "instagram": {"url": null, "enabled": true},
  "twitter": {"url": null, "enabled": true}
}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_sections jsonb DEFAULT '[]'::jsonb; 