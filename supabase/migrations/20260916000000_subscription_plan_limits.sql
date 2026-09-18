-- Introduces tiered plan limits:
--   free      1 resource,  5 members   ($0)
--   small     10 resources, 30 members  ($15/mo)
--   unlimited no limits                 ($30/mo)
--
-- clubs.plan records the highest plan the club has ever purchased --
-- only the Paddle webhook writes it (see src/app/api/webhooks/paddle/
-- route.ts). It's irrelevant while subscription_status isn't 'active' or
-- 'past_due': club_effective_plan() falls back to 'free' in that case,
-- matching the "nothing is lost if you cancel" promise already made in
-- BillingSalesCard -- existing resources/members are kept, the club just
-- can't add new ones beyond the free limits until it resubscribes.
alter table public.clubs
  add column plan text not null default 'free'
    check (plan in ('free', 'small', 'unlimited'));

create function public.club_effective_plan(p_club_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when subscription_status in ('active', 'past_due') then plan
    else 'free'
  end
  from public.clubs
  where id = p_club_id;
$$;

-- These two functions are the real enforcement (called from the triggers
-- below, and from get_club_by_invite_token for the join page's pre-check).
-- The numbers mirror src/lib/plans/limits.ts, which exists only for UI
-- display -- there's no shared source of truth between SQL and
-- TypeScript, so keep the two in sync by hand.
create function public.club_can_add_resource(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.club_effective_plan(p_club_id)
    when 'free' then (select count(*) from public.resources where club_id = p_club_id) < 1
    when 'small' then (select count(*) from public.resources where club_id = p_club_id) < 10
    else true
  end;
$$;

create function public.club_can_add_member(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.club_effective_plan(p_club_id)
    when 'free' then (select count(*) from public.users where club_id = p_club_id) < 5
    when 'small' then (select count(*) from public.users where club_id = p_club_id) < 30
    else true
  end;
$$;

-- Enforced at insert time, not just in the app layer: resources go through
-- PostgREST/RLS directly, and the same reasoning as resources_insert_as_admin
-- applies -- nothing stops a client from issuing the insert directly.
create function public.guard_resource_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.club_can_add_resource(NEW.club_id) then
    raise exception 'This club has reached its resource limit for its plan. Upgrade to add more.';
  end if;
  return NEW;
end;
$$;

create trigger guard_resource_plan_limit
  before insert on public.resources
  for each row execute procedure public.guard_resource_plan_limit();

-- handle_new_user: block a metadata-carried club_id (the join-via-signup
-- path, see JoinSignupForm) once the club is already at its member limit.
-- Exceptions raised here typically surface to the client as a generic
-- Supabase Auth error rather than this message -- that's why the join
-- page pre-checks get_club_by_invite_token.can_accept_member and hides
-- the signup form instead of relying on this to produce a friendly
-- error. This trigger is the real enforcement (races, direct API calls).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club_id uuid;
begin
  v_club_id := nullif(new.raw_user_meta_data ->> 'club_id', '')::uuid;

  if v_club_id is not null and not public.club_can_add_member(v_club_id) then
    raise exception 'This club has reached its member limit for its plan.';
  end if;

  insert into public.users (id, email, role, club_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'member'),
    v_club_id
  );
  return new;
end;
$$;

-- guard_users_role_club_id: same member-limit check for the joinClub path
-- (an already-authenticated, clubless user attaching to a club). Unlike
-- handle_new_user, an exception here surfaces cleanly as error.message on
-- the ordinary users.update() call joinClub() makes.
create or replace function public.guard_users_role_club_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nothing protected is changing.
  if NEW.role = OLD.role and NEW.club_id is not distinct from OLD.club_id then
    return NEW;
  end if;

  -- Service-role / migration contexts bypass RLS and have no JWT, so
  -- auth.uid() is null there -- e.g. admin scripts, the initial seed.
  if auth.uid() is null then
    return NEW;
  end if;

  -- A club's admin changing another member's role, or removing them
  -- (club_id -> null). Never the admin's own row -- see below.
  if NEW.id <> auth.uid()
     and public.is_admin()
     and OLD.club_id = public.current_club_id() then
    return NEW;
  end if;

  -- The three self-claim transitions, all starting from an unclaimed row.
  if NEW.id = auth.uid() and OLD.club_id is null then
    -- A) joinClub -- gated by the same member-limit check as signup.
    if OLD.role = 'member' and NEW.role = 'member' and NEW.club_id is not null then
      if not public.club_can_add_member(NEW.club_id) then
        raise exception 'This club has reached its member limit for its plan.';
      end if;
      return NEW;
    end if;

    -- B) createClub -- only onto a club this user is genuinely the
    -- admin_id of (the clubs row is inserted before this update runs).
    -- Not a "join an existing club" transition, so no member-limit check.
    if OLD.role = 'admin' and NEW.role = 'admin' and NEW.club_id is not null
       and exists (
         select 1 from public.clubs where id = NEW.club_id and admin_id = auth.uid()
       ) then
      return NEW;
    end if;

    -- C) Google sign-up admin promotion
    if OLD.role = 'member' and NEW.role = 'admin' and NEW.club_id is null then
      return NEW;
    end if;
  end if;

  raise exception 'Not authorized to change role or club_id';
end;
$$;

-- get_club_by_invite_token: also reports whether the club can currently
-- accept a new member, so the join page can show a friendly message
-- instead of the signup form/join button in the common case (the trigger
-- checks above remain the real enforcement, for races and direct calls).
-- Dropped first: CREATE OR REPLACE can't change a function's return
-- type, and adding can_accept_member does exactly that.
drop function if exists public.get_club_by_invite_token(uuid);

create function public.get_club_by_invite_token(p_token uuid)
returns table (id uuid, name text, can_accept_member boolean)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, public.club_can_add_member(id)
  from public.clubs
  where invite_token = p_token;
$$;
