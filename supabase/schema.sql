-- =====================================================================
-- New Beginnings Animal Rescue — Supabase database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once.
-- =====================================================================

-- ---------- Admins ----------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'staff' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Add an existing Supabase user (Authentication → Users) as an admin by email.
create or replace function public.add_admin(p_email text, p_role text default 'staff')
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'Only admins can add admins'; end if;
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then raise exception 'No user with that email. Create the user first in Supabase → Authentication → Users.'; end if;
  insert into public.admins(user_id, email, role) values (uid, lower(p_email), coalesce(p_role,'staff'))
  on conflict (user_id) do update set role = excluded.role;
end; $$;

create or replace function public.remove_admin(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can remove admins'; end if;
  if p_user_id = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  delete from public.admins where user_id = p_user_id;
end; $$;

-- ---------- Dogs ----------
create table if not exists public.dogs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  breed         text default '',
  age_label     text default '',
  age_group     text default 'Adult' check (age_group in ('Puppy','Young','Adult','Senior')),
  weight        int  default 0,
  size          text default 'Medium' check (size in ('Small','Medium','Large')),
  sex           text default 'Female',
  status        text default 'Available' check (status in ('Available','Pending','Adopted')),
  energy        text default 'Medium',
  spay_neuter   boolean default true,
  vaccines      boolean default true,
  kids          boolean default false,
  dogs          boolean default false,
  cats          boolean default false,
  house_trained boolean default false,
  featured      boolean default false,
  urgent        boolean default false,
  traits        text[] default '{}',
  bio           text default '',
  routine       text default '',
  ideal_home    text default '',
  photos        text[] default '{}',
  coat          text default '#C98B52',
  ear           text default '#7A4E2D',
  adoption_fee  text default '',
  published     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Applications & messages ----------
create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dog_id     uuid references public.dogs(id) on delete set null,
  dog_name   text default '',
  name       text not null,
  email      text not null,
  phone      text default '',
  status     text not null default 'New' check (status in ('New','Reviewing','Approved','Declined','Withdrawn')),
  data       jsonb not null default '{}',
  notes      text default ''
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  topic      text default '',
  message    text not null,
  status     text not null default 'New' check (status in ('New','Replied','Archived'))
);

-- ---------- Happy tails ----------
create table if not exists public.happy_tails (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  adopter    text default '',
  quote      text default '',
  photo      text default '',
  published  boolean default true,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- Site settings (one row of JSON the admin edits) ----------
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.settings(id, data) values (1, '{}') on conflict (id) do nothing;

-- ---------- Row Level Security ----------
alter table public.admins       enable row level security;
alter table public.dogs         enable row level security;
alter table public.applications enable row level security;
alter table public.messages     enable row level security;
alter table public.happy_tails  enable row level security;
alter table public.settings     enable row level security;

drop policy if exists "admins read"        on public.admins;
create policy "admins read" on public.admins for select using (public.is_admin());

drop policy if exists "public read dogs"   on public.dogs;
drop policy if exists "admin all dogs"     on public.dogs;
create policy "public read dogs" on public.dogs for select using (published or public.is_admin());
create policy "admin all dogs"   on public.dogs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public apply"       on public.applications;
drop policy if exists "admin all apps"     on public.applications;
create policy "public apply"   on public.applications for insert with check (status = 'New' and notes = '');
create policy "admin all apps" on public.applications for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public message"     on public.messages;
drop policy if exists "admin all messages" on public.messages;
create policy "public message"     on public.messages for insert with check (status = 'New');
create policy "admin all messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read tails"  on public.happy_tails;
drop policy if exists "admin all tails"    on public.happy_tails;
create policy "public read tails" on public.happy_tails for select using (published or public.is_admin());
create policy "admin all tails"   on public.happy_tails for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.settings;
drop policy if exists "admin write settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);
create policy "admin write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;

drop policy if exists "public read photos"  on storage.objects;
drop policy if exists "admin upload photos" on storage.objects;
drop policy if exists "admin update photos" on storage.objects;
drop policy if exists "admin delete photos" on storage.objects;
create policy "public read photos"  on storage.objects for select using (bucket_id = 'photos');
create policy "admin upload photos" on storage.objects for insert with check (bucket_id = 'photos' and public.is_admin());
create policy "admin update photos" on storage.objects for update using (bucket_id = 'photos' and public.is_admin());
create policy "admin delete photos" on storage.objects for delete using (bucket_id = 'photos' and public.is_admin());

-- =====================================================================
-- FIRST ADMIN: after creating your user in Authentication → Users,
-- run this once with your email to make yourself the owner:
--
--   insert into public.admins (user_id, email, role)
--   select id, email, 'owner' from auth.users where email = 'you@example.com';
-- =====================================================================
