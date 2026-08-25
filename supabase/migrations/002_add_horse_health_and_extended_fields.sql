-- Add missing columns to horses table
ALTER TABLE horses ADD COLUMN IF NOT EXISTS gender VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS height VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS microchip_id VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS registration_number VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS temperament TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS diet_requirements TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS training_level VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS vet_name VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS vet_phone VARCHAR;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create horse_health_records table
CREATE TABLE IF NOT EXISTS horse_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_type VARCHAR NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recorded_date DATE NOT NULL,
  recorded_time TIME,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for horse_health_records
CREATE INDEX IF NOT EXISTS idx_horse_health_records_horse_id ON horse_health_records(horse_id);
CREATE INDEX IF NOT EXISTS idx_horse_health_records_farm_id ON horse_health_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_horse_health_records_recorded_date ON horse_health_records(recorded_date);

-- Enable RLS for horse_health_records
ALTER TABLE horse_health_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for horse_health_records
CREATE POLICY IF NOT EXISTS "allow_read_horse_health_records" ON horse_health_records
  FOR SELECT USING (TRUE);

CREATE POLICY IF NOT EXISTS "allow_insert_horse_health_records" ON horse_health_records
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_update_horse_health_records" ON horse_health_records
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_delete_horse_health_records" ON horse_health_records
  FOR DELETE USING (TRUE);
