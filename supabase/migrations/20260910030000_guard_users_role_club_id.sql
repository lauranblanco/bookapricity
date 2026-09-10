-- users_update_self (for update using (id = auth.uid()) with check (id =
-- auth.uid())) has no column restriction: any signed-in member can call
-- supabase.from("users").update({ role: "admin" }) — or set club_id to a
-- different club's id — directly against the PostgREST API and it passes
-- RLS, since it's their own row. That's a privilege-escalation and
-- club-hopping hole, not just an app-layer gap: the app never issues that
-- write, but nothing stops a client from issuing it directly.
--
-- A trigger (rather than tightening the policy itself) because the
-- legitimate self-updates to role/club_id are narrow and easiest to
-- describe as "what's allowed to change, and from what starting state" —
-- exactly three, all only possible once, right after signup, while the
-- row is still unclaimed (club_id is null):
--   A) joinClub    -- club_id: null -> a club, role stays "member"
--   B) createClub  -- club_id: null -> a club you're admin_id of, role
--                     stays "admin" (already set at signup)
--   C) Google sign-up admin promotion (/auth/callback) -- role: "member"
--      -> "admin", club_id stays null
-- Once club_id is no longer null none of these apply again, so an
-- existing member/admin can never change their own role or club_id this
-- way again.
--
-- A club's admin managing a *different* member's row (updateMemberRole,
-- admin_remove_member) is authorized separately, mirroring
-- users_update_as_admin's own logic -- and is explicitly restricted to
-- NEW.id <> auth.uid(), so an admin can't use it to hop their own row
-- into a club they don't actually administer.
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
  -- (club_id -> null). Never the admin's own row -- see above.
  if NEW.id <> auth.uid()
     and public.is_admin()
     and OLD.club_id = public.current_club_id() then
    return NEW;
  end if;

  -- The three self-claim transitions, all starting from an unclaimed row.
  if NEW.id = auth.uid() and OLD.club_id is null then
    -- A) joinClub
    if OLD.role = 'member' and NEW.role = 'member' and NEW.club_id is not null then
      return NEW;
    end if;

    -- B) createClub -- only onto a club this user is genuinely the
    -- admin_id of (the clubs row is inserted before this update runs).
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

create trigger guard_users_role_club_id
  before update on public.users
  for each row execute procedure public.guard_users_role_club_id();
