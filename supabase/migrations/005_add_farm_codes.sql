-- Add farm_code column to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS farm_code VARCHAR UNIQUE NOT NULL DEFAULT '';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farms_farm_code ON farms(farm_code);

-- Update existing farms with generated codes (if any exist)
UPDATE farms SET farm_code = 'FARM-' || substr(id::text, 1, 4) || '-' || substr(md5(id::text), 1, 5) WHERE farm_code = '';
