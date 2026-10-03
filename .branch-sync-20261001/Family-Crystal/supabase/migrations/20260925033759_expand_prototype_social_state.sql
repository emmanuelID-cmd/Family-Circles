alter table public.people
  add column following_count integer not null default 0 check (following_count >= 0),
  add column is_verified boolean not null default false,
  add column is_favorite boolean not null default false,
  add column is_blocked boolean not null default false,
  add column pending_follow_request boolean not null default false,
  add column suggestion_dismissed_at timestamptz,
  add column notification_settings jsonb not null default '{"posts":"all","stories":"off","reels":"off","liveVideos":"off"}'::jsonb;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  foreign key (owner_id, person_id) references public.people (owner_id, id) on delete cascade
);

create table public.person_followings (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null,
  followed_person_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, person_id, followed_person_id),
  check (person_id <> followed_person_id),
  foreign key (owner_id, person_id) references public.people (owner_id, id) on delete cascade,
  foreign key (owner_id, followed_person_id) references public.people (owner_id, id) on delete cascade
);

alter table public.messages enable row level security;
alter table public.person_followings enable row level security;

revoke all on table public.messages, public.person_followings from anon, authenticated;
grant select, insert, update, delete on table public.messages, public.person_followings to authenticated;

create policy "Users can read their messages"
  on public.messages for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their messages"
  on public.messages for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can update their messages"
  on public.messages for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their messages"
  on public.messages for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Users can read their synthetic follows"
  on public.person_followings for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Users can create their synthetic follows"
  on public.person_followings for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can update their synthetic follows"
  on public.person_followings for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their synthetic follows"
  on public.person_followings for delete to authenticated
  using (owner_id = (select auth.uid()));
