-- SupportOps Module 7: Multiple testing entries per employee per day

alter table if exists public.daily_testing_logs
  drop constraint if exists daily_testing_logs_employee_id_log_date_key;

alter table public.daily_testing_logs
  add column if not exists bugs_major integer not null default 0 check (bugs_major >= 0),
  add column if not exists bugs_minor integer not null default 0 check (bugs_minor >= 0),
  add column if not exists testing_quality text not null default 'good'
    check (testing_quality in ('excellent', 'good', 'average', 'poor')),
  add column if not exists time_spent integer check (time_spent >= 0);

drop index if exists daily_testing_logs_employee_date_idx;
create index if not exists daily_testing_logs_employee_date_idx
  on public.daily_testing_logs(employee_id, log_date);
