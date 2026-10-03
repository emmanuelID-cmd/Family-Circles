create index account_people_owner_account_idx
  on public.account_people (owner_id, account_id);
create index account_people_owner_person_idx
  on public.account_people (owner_id, person_id);
create index circle_members_owner_account_circle_idx
  on public.circle_members (owner_id, account_id, circle_id);
create index messages_owner_account_idx
  on public.messages (owner_id, account_id);

-- The event trigger remains installed and callable by PostgreSQL itself, but
-- API roles do not need direct EXECUTE on this SECURITY DEFINER function.
do $$
begin
  if pg_catalog.to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
