-- SupportOps Module 1: Foundation
-- Apply this migration in a Supabase project before creating users.

create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('manager', 'support_engineer', 'qa_engineer')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role_id uuid not null references public.roles(id),
  employment_status text not null default 'active' check (employment_status in ('active', 'inactive')),
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_id_idx on public.profiles(role_id);
create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);

insert into public.roles (name, description)
values
  ('manager', 'Team Lead with administrative access'),
  ('support_engineer', 'Support Engineer evaluated with support-specific KPIs'),
  ('qa_engineer', 'QA Engineer evaluated with QA-specific KPIs')
on conflict (name) do nothing;

insert into public.permissions (key, description)
values
  ('dashboard.view', 'View dashboard'),
  ('employees.manage', 'Create and manage employee profiles'),
  ('attendance.manage', 'Create and edit attendance records'),
  ('leave.approve', 'Approve and reject leave requests'),
  ('support.log_own', 'Create own support logs'),
  ('qa.update_assigned', 'Update assigned testing tasks'),
  ('reports.export', 'Export reports'),
  ('settings.manage', 'Manage app settings')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'dashboard.view',
  'employees.manage',
  'attendance.manage',
  'leave.approve',
  'support.log_own',
  'qa.update_assigned',
  'reports.export',
  'settings.manage'
)
where r.name = 'manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('dashboard.view', 'support.log_own', 'qa.update_assigned')
where r.name = 'support_engineer'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('dashboard.view', 'qa.update_assigned')
where r.name = 'qa_engineer'
on conflict do nothing;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.auth_user_id = auth.uid()
  limit 1
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can view roles" on public.roles;
create policy "Authenticated users can view roles"
on public.roles for select
to authenticated
using (true);

drop policy if exists "Authenticated users can view permissions" on public.permissions;
create policy "Authenticated users can view permissions"
on public.permissions for select
to authenticated
using (true);

drop policy if exists "Authenticated users can view role permissions" on public.role_permissions;
create policy "Authenticated users can view role permissions"
on public.role_permissions for select
to authenticated
using (true);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "Managers can view all profiles" on public.profiles;
create policy "Managers can view all profiles"
on public.profiles for select
to authenticated
using (public.current_profile_role() = 'manager');

drop policy if exists "Managers can insert profiles" on public.profiles;
create policy "Managers can insert profiles"
on public.profiles for insert
to authenticated
with check (public.current_profile_role() = 'manager');

drop policy if exists "Managers can update profiles" on public.profiles;
create policy "Managers can update profiles"
on public.profiles for update
to authenticated
using (public.current_profile_role() = 'manager')
with check (public.current_profile_role() = 'manager');
