create function public.provision_default_managed_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.managed_accounts (
    id,
    owner_id,
    display_name,
    pronouns,
    avatar_url
  ) values (
    new.id,
    new.id,
    coalesce(nullif(left(trim(new.display_name), 80), ''), 'Circles user'),
    new.pronouns,
    new.avatar_url
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    pronouns = excluded.pronouns,
    avatar_url = coalesce(excluded.avatar_url, managed_accounts.avatar_url);

  return new;
end;
$$;

create trigger provision_default_managed_profile
  after insert or update of display_name, pronouns, avatar_url
  on public.profiles
  for each row execute function public.provision_default_managed_profile();
