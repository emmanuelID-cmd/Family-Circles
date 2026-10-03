alter table public.profiles
  add column if not exists pronouns text
    check (pronouns is null or char_length(pronouns) <= 40),
  add column if not exists avatar_url text;
