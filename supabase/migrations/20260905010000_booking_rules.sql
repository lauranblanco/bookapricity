-- Stage 3 support: per-resource cancellation cutoff, atomic capacity
-- enforcement, club_id at sign-up (member join flow), and a safe way to
-- look up a club's name before joining it.

alter table public.resources
  add column cancellation_cutoff_minutes integer not null default 60
    check (cancellation_cutoff_minutes >= 0);

-- Re-created to also set club_id when a member signs up via an invite
-- link (passed as auth.signUp({ options: { data: { role, club_id } } })).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, club_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'member'),
    nullif(new.raw_user_meta_data ->> 'club_id', '')::uuid
  );
  return new;
end;
$$;

-- Lets an unauthenticated visitor see the club name on an invite link
-- page without exposing any other club columns (admin_id, billing status).
create or replace function public.get_club_name(p_club_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select name from public.clubs where id = p_club_id;
$$;

-- Enforces "prevent double-booking beyond a resource's configured
-- capacity" atomically under concurrent inserts, by locking the
-- resource row before counting overlapping confirmed reservations.
create or replace function public.enforce_reservation_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resource_capacity integer;
  overlapping_count integer;
begin
  if new.status <> 'confirmed' then
    return new;
  end if;

  select capacity into resource_capacity
  from public.resources
  where id = new.resource_id
  for update;

  select count(*) into overlapping_count
  from public.reservations
  where resource_id = new.resource_id
    and status = 'confirmed'
    and id <> new.id
    and start_time < new.end_time
    and end_time > new.start_time;

  if overlapping_count >= resource_capacity then
    raise exception 'This resource is fully booked for the selected time.';
  end if;

  return new;
end;
$$;

create trigger enforce_reservation_capacity_trigger
  before insert or update on public.reservations
  for each row execute function public.enforce_reservation_capacity();
