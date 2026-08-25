-- Create user_profiles table for storing additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  role VARCHAR NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_farm_id ON user_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY IF NOT EXISTS "allow_read_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id OR TRUE);

CREATE POLICY IF NOT EXISTS "allow_read_farm_users" ON user_profiles
  FOR SELECT USING (farm_id IN (
    SELECT farm_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "allow_insert_user_profile" ON user_profiles
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id OR TRUE)
  WITH CHECK (auth.uid() = user_id OR TRUE);

CREATE POLICY IF NOT EXISTS "allow_delete_user_profile" ON user_profiles
  FOR DELETE USING (TRUE);
