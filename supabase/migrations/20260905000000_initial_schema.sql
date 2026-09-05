-- BookApricity initial schema: clubs, users, resources, reservations
-- + row-level security so one club can never see another club's data.

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.clubs (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  admin_id            uuid not null references auth.users (id) on delete cascade,
  subscription_status text not null default 'inactive'
                        check (subscription_status in ('inactive', 'active', 'past_due', 'cancelled')),
  created_at          timestamptz not null default now()
);

-- Mirrors auth.users with app-specific fields (role, club membership).
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null check (role in ('admin', 'member')),
  club_id    uuid references public.clubs (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.clubs
  add constraint clubs_admin_id_fkey_users
  foreign key (admin_id) references public.users (id) on delete cascade;

create table public.resources (
  id                       uuid primary key default gen_random_uuid(),
  club_id                  uuid not null references public.clubs (id) on delete cascade,
  name                     text not null,
  description              text,
  capacity                 integer not null default 1 check (capacity > 0),
  booking_duration_minutes integer not null check (booking_duration_minutes > 0),
  -- Flexible weekly schedule, e.g. {"mon": [["09:00","12:00"]], "tue": []}
  available_hours          jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now()
);

create table public.reservations (
  id         uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  member_id  uuid not null references public.users (id) on delete cascade,
  start_time timestamptz not null,
  end_time   timestamptz not null,
  status     text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index users_club_id_idx on public.users (club_id);
create index resources_club_id_idx on public.resources (club_id);
create index reservations_resource_id_idx on public.reservations (resource_id);
create index reservations_member_id_idx on public.reservations (member_id);

-- Capacity limits and available-hours enforcement are booking-time business
-- rules (they depend on counting overlapping reservations), and are applied
-- in the application layer rather than as DB constraints.

-- ---------------------------------------------------------------------
-- Helpers (security definer so they can read public.users regardless of
-- the caller's own RLS policies, without leaking rows to the caller).
-- ---------------------------------------------------------------------

create function public.current_club_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id from public.users where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.users where id = auth.uid()) = 'admin', false);
$$;

-- ---------------------------------------------------------------------
-- New auth user -> public.users row, carrying the role chosen at sign-up
-- (passed as auth.signUp({ options: { data: { role: 'admin' | 'member' } } })).
-- ---------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------

alter table public.clubs enable row level security;
alter table public.users enable row level security;
alter table public.resources enable row level security;
alter table public.reservations enable row level security;

-- clubs: members can view their own club; only its admin can create/update it.
create policy "clubs_select_own" on public.clubs
  for select using (id = public.current_club_id());

create policy "clubs_insert_as_admin" on public.clubs
  for insert with check (admin_id = auth.uid());

create policy "clubs_update_as_admin" on public.clubs
  for update using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

-- users: see your own club's roster, and edit your own profile.
create policy "users_select_self_or_club" on public.users
  for select using (id = auth.uid() or club_id = public.current_club_id());

create policy "users_update_self" on public.users
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- resources: club members can view; only the club's admin can manage.
create policy "resources_select_own_club" on public.resources
  for select using (club_id = public.current_club_id());

create policy "resources_insert_as_admin" on public.resources
  for insert with check (club_id = public.current_club_id() and public.is_admin());

create policy "resources_update_as_admin" on public.resources
  for update using (club_id = public.current_club_id() and public.is_admin())
  with check (club_id = public.current_club_id() and public.is_admin());

create policy "resources_delete_as_admin" on public.resources
  for delete using (club_id = public.current_club_id() and public.is_admin());

-- reservations: visible to the whole club; members manage their own,
-- admins can manage any reservation within their club.
create policy "reservations_select_own_club" on public.reservations
  for select using (
    exists (
      select 1 from public.resources r
      where r.id = reservations.resource_id
        and r.club_id = public.current_club_id()
    )
  );

create policy "reservations_insert_own" on public.reservations
  for insert with check (
    member_id = auth.uid()
    and exists (
      select 1 from public.resources r
      where r.id = reservations.resource_id
        and r.club_id = public.current_club_id()
    )
  );

create policy "reservations_update_own_or_admin" on public.reservations
  for update using (
    member_id = auth.uid()
    or (
      public.is_admin()
      and exists (
        select 1 from public.resources r
        where r.id = reservations.resource_id
          and r.club_id = public.current_club_id()
      )
    )
  )
  with check (
    member_id = auth.uid()
    or (
      public.is_admin()
      and exists (
        select 1 from public.resources r
        where r.id = reservations.resource_id
          and r.club_id = public.current_club_id()
      )
    )
  );
