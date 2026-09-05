-- The original clubs_select_own policy only allowed seeing a club via
-- current_club_id(), which reads the caller's public.users.club_id.
-- But creating a club is itself a chicken-and-egg case: the new club's
-- admin can't see their own just-inserted row (their club_id isn't set
-- yet), and Postgres enforces SELECT policies on INSERT ... RETURNING —
-- so createClub's `.insert().select()` failed with "new row violates
-- row-level security policy" even though the INSERT's own WITH CHECK
-- passed. Letting an admin also see clubs they own fixes this and is
-- correct regardless of their own club_id.

drop policy if exists "clubs_select_own" on public.clubs;

create policy "clubs_select_own" on public.clubs
  for select using (
    id = public.current_club_id()
    or admin_id = auth.uid()
  );
