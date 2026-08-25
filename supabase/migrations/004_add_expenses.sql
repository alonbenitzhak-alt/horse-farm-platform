-- Create expenses table for tracking farm expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  horse_id UUID,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Foreign keys
  CONSTRAINT fk_expenses_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_horse FOREIGN KEY (horse_id) REFERENCES horses(id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_user FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT expense_amount_positive CHECK (amount > 0),
  CONSTRAINT valid_category CHECK (category IN ('feed', 'veterinary', 'farrier', 'equipment', 'facility', 'training', 'transport', 'other'))
);

-- Create indexes
CREATE INDEX idx_expenses_farm_id ON expenses(farm_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_horse_id ON expenses(horse_id);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY allow_read_farm_expenses ON expenses
  FOR SELECT USING (
    farm_id IN (
      SELECT farm_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY allow_insert_expense ON expenses
  FOR INSERT WITH CHECK (
    farm_id IN (
      SELECT farm_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY allow_update_expense ON expenses
  FOR UPDATE USING (
    farm_id IN (
      SELECT farm_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY allow_delete_expense ON expenses
  FOR DELETE USING (
    farm_id IN (
      SELECT farm_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );
