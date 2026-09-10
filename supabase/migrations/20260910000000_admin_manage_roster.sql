-- Supports three admin roster features: changing a member's role, removing
-- a member from the club, and regenerating the invite link.

-- Lets a club's admin manage its roster (change member roles, remove
-- members) — mirrors the existing resources_update_as_admin pattern. The
-- "don't leave the club without an admin" rule is enforced in the server
-- action (it needs to inspect sibling rows before deciding, which reads
-- more clearly as a guard there than as a policy subquery).
create policy "users_update_as_admin" on public.users
  for update using (club_id = public.current_club_id() and public.is_admin())
  with check (
    public.is_admin()
    and (club_id = public.current_club_id() or club_id is null)
  );

-- A separate, rotatable invite token — regenerating it invalidates the
-- previous public join link without changing the club's own id (which
-- everything else, like reservations and members, still refers to).
alter table public.clubs
  add column invite_token uuid not null default gen_random_uuid();

create unique index clubs_invite_token_idx on public.clubs (invite_token);

-- Lets an unauthenticated visitor resolve an invite token to a club name,
-- the same way get_club_name already does for a raw club id.
create or replace function public.get_club_by_invite_token(p_token uuid)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name from public.clubs where invite_token = p_token;
$$;

-- Removing a member sets their club_id to null. In testing, the
-- users_update_as_admin policy's "with check" rejected this specific write
-- (42501, new row violates row-level security policy) even though its
-- "club_id is null" branch should allow it and is_admin()/current_club_id()
-- both evaluate correctly on their own — evidently a real quirk of those
-- SECURITY DEFINER helpers being invoked from within a WITH CHECK on the
-- very table they query (public.users). Rather than fight that, do the
-- privileged write directly: same is_admin()/current_club_id() authorization,
-- performed inside a SECURITY DEFINER function instead of via RLS.
--
-- Because this function bypasses RLS, it enforces "don't remove yourself"
-- and "don't leave the club without an admin" itself, rather than trusting
-- the equivalent checks already present in the server action — a caller
-- hitting this RPC directly (bypassing the app) must not be able to skip
-- them.
create or replace function public.admin_remove_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_role text;
  v_other_admins int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if p_member_id = auth.uid() then
    raise exception 'You can''t remove yourself';
  end if;

  select role into v_target_role
  from public.users
  where id = p_member_id
    and club_id = public.current_club_id();

  if v_target_role is null then
    raise exception 'Member not found';
  end if;

  if v_target_role = 'admin' then
    select count(*) into v_other_admins
    from public.users
    where club_id = public.current_club_id()
      and role = 'admin'
      and id != p_member_id;

    if v_other_admins = 0 then
      raise exception 'The club needs at least one admin. Promote someone else first.';
    end if;
  end if;

  update public.users
  set club_id = null
  where id = p_member_id
    and club_id = public.current_club_id();
end;
$$;
