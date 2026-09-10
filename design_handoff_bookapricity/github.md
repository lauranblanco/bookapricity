repo: lauranblanco/bookapricity
branch: main

## Last sync
date: 2026-09-07T21:25:00Z

### Updated in this project
- Read every page and form in `src/app` to ground the visual direction in the real markup.
- Built the first design board (identity, navs, slot picker, weekly-hours editor, auth) from those pages.

## Screen map
| Project screen (BookApricity.dc.html) | Repo files |
| --- | --- |
| 1c Navs (admin / member) | src/app/dashboard/layout.tsx, src/app/(member)/layout.tsx |
| 1d/1e Book a slot | src/app/(member)/book/page.tsx, src/lib/booking/slots.ts, src/components/BookSlotButton.tsx |
| 1f/1g Weekly hours editor | src/app/dashboard/resources/ResourceForm.tsx |
| 1h Reservations (admin) | src/app/dashboard/page.tsx, src/components/CancelReservationButton.tsx |
| 1i My reservations | src/app/(member)/my-reservations/page.tsx |
| 1j Home | src/app/page.tsx |
| 1k Auth & onboarding | src/app/login/LoginForm.tsx, src/app/signup/SignupForm.tsx, src/app/join/[clubId]/page.tsx, src/app/onboarding/create-club/CreateClubForm.tsx, src/app/auth/auth-code-error/page.tsx |
