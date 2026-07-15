-- Migration 015: manager evaluation normalization

-- Add normalized columns to monthly_performance_adjustments
ALTER TABLE public.monthly_performance_adjustments 
  ADD COLUMN IF NOT EXISTS behavior_rating integer DEFAULT 3 CHECK (behavior_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS communication_rating integer DEFAULT 3 CHECK (communication_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS ownership_rating integer DEFAULT 3 CHECK (ownership_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS discipline_rating integer DEFAULT 3 CHECK (discipline_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS manager_points integer DEFAULT 0 CHECK (manager_points BETWEEN -10 AND 10);

-- Migrate existing support_adjustment values to manager_points
UPDATE public.monthly_performance_adjustments 
SET manager_points = support_adjustment;

-- Extract ratings and remarks if stored in JSON format
DO $$
BEGIN
  UPDATE public.monthly_performance_adjustments
  SET 
    behavior_rating = COALESCE((manager_remarks::json->'ratings'->>'behaviour')::integer, 3),
    communication_rating = COALESCE((manager_remarks::json->'ratings'->>'communication')::integer, 3),
    ownership_rating = COALESCE((manager_remarks::json->'ratings'->>'ownership')::integer, 3),
    discipline_rating = COALESCE((manager_remarks::json->'ratings'->>'discipline')::integer, 3),
    manager_remarks = COALESCE(manager_remarks::json->>'remarks', manager_remarks)
  WHERE manager_remarks LIKE '{"ratings":%';
EXCEPTION WHEN OTHERS THEN
  -- Fallback in case of json parsing errors on non-json columns
  NULL;
END $$;
