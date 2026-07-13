-- SupportOps Module 6: Protect created_by from being overwritten on updates

create or replace function public.prevent_created_by_update()
returns trigger
language plpgsql
as $$
begin
  if old.created_by is not null and new.created_by is distinct from old.created_by then
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

drop trigger if exists daily_support_logs_prevent_created_by_update on public.daily_support_logs;
create trigger daily_support_logs_prevent_created_by_update
before update on public.daily_support_logs
for each row
execute function public.prevent_created_by_update();

drop trigger if exists daily_testing_logs_prevent_created_by_update on public.daily_testing_logs;
create trigger daily_testing_logs_prevent_created_by_update
before update on public.daily_testing_logs
for each row
execute function public.prevent_created_by_update();

drop trigger if exists daily_operations_prevent_created_by_update on public.daily_operations;
create trigger daily_operations_prevent_created_by_update
before update on public.daily_operations
for each row
execute function public.prevent_created_by_update();
