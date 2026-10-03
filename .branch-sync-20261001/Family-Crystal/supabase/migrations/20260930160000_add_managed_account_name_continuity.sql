alter table public.managed_accounts
  add column temp_user_name text,
  add column temp_screen_name text,
  add column name_changed_at timestamptz,
  add constraint managed_accounts_temp_user_name_format check (
    temp_user_name is null or (
      char_length(temp_user_name) between 1 and 30
      and temp_user_name ~ '^[a-z0-9._]+$'
    )
  ),
  add constraint managed_accounts_temp_screen_name_format check (
    temp_screen_name is null or char_length(trim(temp_screen_name)) between 1 and 80
  );

-- managed_accounts is the canonical source after the default profile is first
-- provisioned. Session bootstrap may still refresh pronouns and the avatar,
-- but it must not replace a managed-account name with stale auth metadata.
create or replace function public.provision_default_managed_profile()
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
    pronouns = excluded.pronouns,
    avatar_url = coalesce(excluded.avatar_url, managed_accounts.avatar_url);

  return new;
end;
$$;

create or replace function public.enforce_managed_account_name_continuity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  now_at timestamptz := pg_catalog.clock_timestamp();
begin
  if tg_op = 'INSERT' then
    new.temp_user_name := null;
    new.temp_screen_name := null;
    new.name_changed_at := null;
    return new;
  end if;

  if new.username is distinct from old.username
    or new.display_name is distinct from old.display_name then
    if old.name_changed_at is not null
      and old.name_changed_at > now_at - interval '30 days' then
      raise exception 'Managed account names can be changed again after %', old.name_changed_at + interval '30 days'
        using errcode = 'check_violation';
    end if;

    new.temp_user_name := case
      when new.username is distinct from old.username then old.username
      else null
    end;
    new.temp_screen_name := case
      when new.display_name is distinct from old.display_name then old.display_name
      else null
    end;
    new.name_changed_at := now_at;
    return new;
  end if;

  if old.name_changed_at is not null
    and old.name_changed_at <= now_at - interval '30 days' then
    new.temp_user_name := null;
    new.temp_screen_name := null;
    new.name_changed_at := null;
  else
    new.temp_user_name := old.temp_user_name;
    new.temp_screen_name := old.temp_screen_name;
    new.name_changed_at := old.name_changed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_managed_account_name_continuity on public.managed_accounts;
create trigger enforce_managed_account_name_continuity
  before insert or update of username, display_name, temp_user_name, temp_screen_name, name_changed_at
  on public.managed_accounts
  for each row execute function public.enforce_managed_account_name_continuity();

comment on column public.managed_accounts.temp_user_name is
  'Immediately previous username, retained privately for 30 days after a managed-account name change.';
comment on column public.managed_accounts.temp_screen_name is
  'Immediately previous display name, retained privately for 30 days after a managed-account name change.';
comment on column public.managed_accounts.name_changed_at is
  'Shared timestamp for the most recent managed-account name change and cooldown.';
