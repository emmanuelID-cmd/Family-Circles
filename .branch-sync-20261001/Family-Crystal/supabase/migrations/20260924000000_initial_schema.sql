create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  username text not null check (char_length(username) between 1 and 30),
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  host_follows boolean not null default false,
  follows_host boolean not null default false,
  followed_by_host timestamptz,
  followed_host timestamptz,
  follower_count integer not null default 0 check (follower_count >= 0),
  post_count integer not null default 0 check (post_count >= 0),
  created_at timestamptz not null default now(),
  unique (owner_id, username),
  unique (owner_id, id)
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (owner_id, name),
  unique (owner_id, id)
);

create table public.circle_members (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  circle_id uuid not null,
  person_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (circle_id, person_id),
  foreign key (owner_id, circle_id) references public.circles (owner_id, id) on delete cascade,
  foreign key (owner_id, person_id) references public.people (owner_id, id) on delete cascade
);

alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

revoke all on table public.profiles, public.people, public.circles, public.circle_members from anon, authenticated;
grant select, insert, update, delete on table public.profiles, public.people, public.circles, public.circle_members to authenticated;

create policy "Users can read their profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Users can create their profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Users can update their profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "Users can delete their profile"
  on public.profiles for delete to authenticated
  using (id = (select auth.uid()));

create policy "Users can read their people"
  on public.people for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their people"
  on public.people for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can update their people"
  on public.people for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their people"
  on public.people for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Users can read their circles"
  on public.circles for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their circles"
  on public.circles for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can update their circles"
  on public.circles for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their circles"
  on public.circles for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Users can read their circle memberships"
  on public.circle_members for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their circle memberships"
  on public.circle_members for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can update their circle memberships"
  on public.circle_members for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their circle memberships"
  on public.circle_members for delete to authenticated
  using (owner_id = (select auth.uid()));

create function public.enforce_circle_member_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  member_count integer;
begin
  if tg_op = 'UPDATE' and new.circle_id = old.circle_id and new.person_id = old.person_id then
    return new;
  end if;

  perform c.id
    from public.circles as c
    where c.id = new.circle_id and c.owner_id = (select auth.uid())
    for update;
  if not found then
    raise exception 'Circle is unavailable for this user';
  end if;

  if tg_op = 'UPDATE' then
    select count(*) into member_count
      from public.circle_members as cm
      where cm.circle_id = new.circle_id
        and cm.owner_id = (select auth.uid())
        and (cm.circle_id, cm.person_id) <> (old.circle_id, old.person_id);
  else
    select count(*) into member_count
      from public.circle_members as cm
      where cm.circle_id = new.circle_id
        and cm.owner_id = (select auth.uid());
  end if;

  if member_count >= 20 then
    raise exception 'A circle can contain at most 20 people';
  end if;
  return new;
end;
$$;

create trigger enforce_circle_member_limit
  before insert or update of circle_id, person_id on public.circle_members
  for each row execute function public.enforce_circle_member_limit();
