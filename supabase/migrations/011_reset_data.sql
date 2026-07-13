-- Reset all employee daily operations data
-- Wipes support logs, testing logs, performance adjustments, and legacy daily operations

truncate table public.daily_testing_logs restart identity;
truncate table public.daily_support_logs restart identity;
truncate table public.monthly_performance_adjustments restart identity cascade;
truncate table public.daily_operations restart identity cascade;

notify pgrst, 'reload schema';
