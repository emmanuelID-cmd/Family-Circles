-- App-managed profiles share one Supabase Auth identity but keep independent
-- profile, relationship, Circle, and message state.

create table public.managed_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  username text check (
    username is null or (
      char_length(username) between 1 and 30
      and username ~ '^[a-z0-9._]+$'
    )
  ),
  display_name text not null
    check (char_length(trim(display_name)) between 1 and 80),
  pronouns text check (pronouns is null or char_length(pronouns) <= 40),
  avatar_url text,
  is_default boolean generated always as (id = owner_id) stored,
  created_at timestamptz not null default now(),
  unique (owner_id, id),
  unique (owner_id, username)
);

create unique index managed_accounts_one_default_per_owner
  on public.managed_accounts (owner_id)
  where is_default;

-- Preserve the existing signed-in profile as the default managed profile.
-- Its ID equals owner_id so existing client inserts can continue using auth.uid()
-- as the default account_id until the UI is migrated to account selection.
insert into public.managed_accounts (
  id, owner_id, username, display_name, pronouns, avatar_url
)
select
  u.id,
  u.id,
  nullif(
    left(
      lower(regexp_replace(coalesce(u.raw_user_meta_data ->> 'username', ''), '[^a-zA-Z0-9._]', '', 'g')),
      30
    ),
    ''
  ),
  coalesce(nullif(left(trim(p.display_name), 80), ''), 'Circles user'),
  p.pronouns,
  p.avatar_url
from auth.users as u
left join public.profiles as p on p.id = u.id
on conflict (id) do nothing;

create table public.account_people (
  owner_id uuid not null default auth.uid(),
  account_id uuid not null default auth.uid(),
  person_id uuid not null,
  account_follows_person boolean not null default false,
  person_follows_account boolean not null default false,
  followed_by_account_at timestamptz,
  followed_account_at timestamptz,
  is_favorite boolean not null default false,
  is_blocked boolean not null default false,
  pending_follow_request boolean not null default false,
  suggestion_dismissed_at timestamptz,
  notification_settings jsonb not null
    default '{"posts":"all","stories":"off","reels":"off","liveVideos":"off"}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (account_id, person_id),
  foreign key (owner_id, account_id)
    references public.managed_accounts (owner_id, id) on delete cascade,
  foreign key (owner_id, person_id)
    references public.people (owner_id, id) on delete cascade
);

create index account_people_following_idx
  on public.account_people (account_id, person_id)
  where account_follows_person;
create index account_people_followers_idx
  on public.account_people (account_id, person_id)
  where person_follows_account;

-- Copy the current relationship state only into the default account. New
-- managed profiles receive no copied follows, followers, favorites, or blocks.
insert into public.account_people (
  owner_id,
  account_id,
  person_id,
  account_follows_person,
  person_follows_account,
  followed_by_account_at,
  followed_account_at,
  is_favorite,
  is_blocked,
  pending_follow_request,
  suggestion_dismissed_at,
  notification_settings
)
select
  p.owner_id,
  p.owner_id,
  p.id,
  p.host_follows,
  p.follows_host,
  p.followed_by_host,
  p.followed_host,
  p.is_favorite,
  p.is_blocked,
  p.pending_follow_request,
  p.suggestion_dismissed_at,
  p.notification_settings
from public.people as p
on conflict (account_id, person_id) do nothing;

alter table public.circles
  add column account_id uuid;

update public.circles
set account_id = owner_id;

alter table public.circles
  alter column account_id set not null,
  alter column account_id set default auth.uid();

alter table public.circles
  drop constraint circles_owner_id_name_key,
  add constraint circles_owner_account_name_key
    unique (owner_id, account_id, name),
  add constraint circles_owner_account_id_key
    unique (owner_id, account_id, id),
  add constraint circles_owner_account_fkey
    foreign key (owner_id, account_id)
    references public.managed_accounts (owner_id, id) on delete cascade;

alter table public.circle_members
  add column account_id uuid;

update public.circle_members as cm
set account_id = c.account_id
from public.circles as c
where c.id = cm.circle_id and c.owner_id = cm.owner_id;

alter table public.circle_members
  alter column account_id set not null,
  alter column account_id set default auth.uid(),
  drop constraint circle_members_owner_id_circle_id_fkey,
  add constraint circle_members_owner_account_circle_fkey
    foreign key (owner_id, account_id, circle_id)
    references public.circles (owner_id, account_id, id) on delete cascade;

create index circle_members_account_idx
  on public.circle_members (account_id, circle_id);

alter table public.messages
  add column account_id uuid;

update public.messages
set account_id = owner_id;

alter table public.messages
  alter column account_id set not null,
  alter column account_id set default auth.uid(),
  add constraint messages_owner_account_fkey
    foreign key (owner_id, account_id)
    references public.managed_accounts (owner_id, id) on delete cascade;

create index messages_account_person_created_idx
  on public.messages (account_id, person_id, created_at);

alter table public.managed_accounts enable row level security;
alter table public.account_people enable row level security;

revoke all on table public.managed_accounts, public.account_people
  from anon, authenticated;
grant select, insert, update on table public.managed_accounts to authenticated;
grant select, insert, update, delete on table public.account_people to authenticated;

create policy "Owners can read their managed accounts"
  on public.managed_accounts for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Owners can create their managed accounts"
  on public.managed_accounts for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners can update their managed accounts"
  on public.managed_accounts for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners can read their account relationships"
  on public.account_people for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Owners can create their account relationships"
  on public.account_people for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners can update their account relationships"
  on public.account_people for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Owners can delete their account relationships"
  on public.account_people for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Keep the current single-profile client compatible during rollout. Existing
-- people rows are the legacy representation of the default profile only.
create function public.sync_people_to_default_account()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_catalog.pg_trigger_depth() > 1 then
    return new;
  end if;

  insert into public.account_people (
    owner_id,
    account_id,
    person_id,
    account_follows_person,
    person_follows_account,
    followed_by_account_at,
    followed_account_at,
    is_favorite,
    is_blocked,
    pending_follow_request,
    suggestion_dismissed_at,
    notification_settings
  ) values (
    new.owner_id,
    new.owner_id,
    new.id,
    new.host_follows,
    new.follows_host,
    new.followed_by_host,
    new.followed_host,
    new.is_favorite,
    new.is_blocked,
    new.pending_follow_request,
    new.suggestion_dismissed_at,
    new.notification_settings
  )
  on conflict (account_id, person_id) do update set
    account_follows_person = excluded.account_follows_person,
    person_follows_account = excluded.person_follows_account,
    followed_by_account_at = excluded.followed_by_account_at,
    followed_account_at = excluded.followed_account_at,
    is_favorite = excluded.is_favorite,
    is_blocked = excluded.is_blocked,
    pending_follow_request = excluded.pending_follow_request,
    suggestion_dismissed_at = excluded.suggestion_dismissed_at,
    notification_settings = excluded.notification_settings;

  return new;
end;
$$;

create function public.sync_default_account_to_people()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_catalog.pg_trigger_depth() > 1 or new.account_id <> new.owner_id then
    return new;
  end if;

  update public.people as p
  set host_follows = new.account_follows_person,
      follows_host = new.person_follows_account,
      followed_by_host = new.followed_by_account_at,
      followed_host = new.followed_account_at,
      is_favorite = new.is_favorite,
      is_blocked = new.is_blocked,
      pending_follow_request = new.pending_follow_request,
      suggestion_dismissed_at = new.suggestion_dismissed_at,
      notification_settings = new.notification_settings
  where p.id = new.person_id and p.owner_id = new.owner_id;

  return new;
end;
$$;

create trigger sync_people_to_default_account
  after insert or update of host_follows, follows_host, followed_by_host,
    followed_host, is_favorite, is_blocked, pending_follow_request,
    suggestion_dismissed_at, notification_settings
  on public.people
  for each row execute function public.sync_people_to_default_account();

create trigger sync_default_account_to_people
  after insert or update of account_follows_person, person_follows_account,
    followed_by_account_at, followed_account_at, is_favorite, is_blocked,
    pending_follow_request, suggestion_dismissed_at, notification_settings
  on public.account_people
  for each row execute function public.sync_default_account_to_people();

drop policy "Users can read their circles" on public.circles;
drop policy "Users can create their circles" on public.circles;
drop policy "Users can update their circles" on public.circles;
drop policy "Users can delete their circles" on public.circles;

create policy "Owners can read their account circles"
  on public.circles for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circles.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can create their account circles"
  on public.circles for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circles.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can update their account circles"
  on public.circles for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circles.account_id and a.owner_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circles.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can delete their account circles"
  on public.circles for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circles.account_id and a.owner_id = (select auth.uid())
    )
  );

drop policy "Users can read their circle memberships" on public.circle_members;
drop policy "Users can create their circle memberships" on public.circle_members;
drop policy "Users can update their circle memberships" on public.circle_members;
drop policy "Users can delete their circle memberships" on public.circle_members;

create policy "Owners can read their account circle memberships"
  on public.circle_members for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circle_members.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can create their account circle memberships"
  on public.circle_members for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circle_members.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can update their account circle memberships"
  on public.circle_members for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circle_members.account_id and a.owner_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circle_members.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can delete their account circle memberships"
  on public.circle_members for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = circle_members.account_id and a.owner_id = (select auth.uid())
    )
  );

drop policy "Users can read their messages" on public.messages;
drop policy "Users can create their messages" on public.messages;
drop policy "Users can update their messages" on public.messages;
drop policy "Users can delete their messages" on public.messages;

create policy "Owners can read their account messages"
  on public.messages for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = messages.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can create their account messages"
  on public.messages for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = messages.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can update their account messages"
  on public.messages for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = messages.account_id and a.owner_id = (select auth.uid())
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = messages.account_id and a.owner_id = (select auth.uid())
    )
  );
create policy "Owners can delete their account messages"
  on public.messages for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.managed_accounts as a
      where a.id = messages.account_id and a.owner_id = (select auth.uid())
    )
  );

-- Circle quota is per managed profile. Row locks serialize creation attempts;
-- the current 12-Circle profile remains intact but cannot create more until it
-- is reduced to the plan limit.
create or replace function public.enforce_free_circle_limit()
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

  if tg_op = 'UPDATE' and new.account_id = old.account_id then
    return new;
  end if;

  perform a.id
    from public.managed_accounts as a
    where a.id = new.account_id and a.owner_id = (select auth.uid())
    for update;
  if not found then
    raise exception 'Circle is unavailable for this account';
  end if;

  select count(*) into circle_count
    from public.circles as c
    where c.account_id = new.account_id
      and (tg_op <> 'UPDATE' or c.id <> new.id);

  if circle_count >= 10 then
    raise exception 'Free accounts can contain at most 10 circles';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_free_circle_limit on public.circles;
create trigger enforce_free_circle_limit
  before insert or update of account_id on public.circles
  for each row execute function public.enforce_free_circle_limit();

comment on table public.managed_accounts is
  'App-managed profiles owned by one Supabase Auth user; social relationships are independent per profile.';
comment on table public.account_people is
  'Per-managed-profile relationship and preference state for people in the owner-scoped directory.';
