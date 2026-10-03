create function public.enforce_free_circle_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  circle_count integer;
begin
  if new.owner_id <> (select auth.uid()) then
    raise exception 'Circle is unavailable for this user';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended((select auth.uid())::text, 0)
  );

  select count(*) into circle_count
    from public.circles as c
    where c.owner_id = (select auth.uid());

  if circle_count >= 10 then
    raise exception 'Free accounts can contain at most 10 circles';
  end if;
  return new;
end;
$$;

create trigger enforce_free_circle_limit
  before insert on public.circles
  for each row execute function public.enforce_free_circle_limit();
