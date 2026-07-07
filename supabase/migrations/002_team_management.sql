-- SupportOps Module 2: Team Management

alter table public.profiles
  add column if not exists employee_code text unique,
  add column if not exists shift text not null default 'day' check (shift in ('morning', 'day', 'evening')),
  add column if not exists avatar_url text;

create index if not exists profiles_employment_status_idx on public.profiles(employment_status);
create index if not exists profiles_shift_idx on public.profiles(shift);
create index if not exists profiles_employee_code_idx on public.profiles(employee_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop policy if exists "Managers can deactivate profiles" on public.profiles;
create policy "Managers can deactivate profiles"
on public.profiles for update
to authenticated
using (public.current_profile_role() = 'manager')
with check (public.current_profile_role() = 'manager');

-- Deletion is intentionally omitted. Employees are deactivated to preserve audit and reporting history.
