# Project: BookApricity

A booking and membership management web app for clubs and
associations (sports clubs, hobby groups, alumni associations,
homeowner associations, professional associations). Club
administrators manage resources and members; members log in to
browse and book time slots.

## Tech stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase for auth (email/password) and Postgres database
- Paddle for subscription billing (Merchant of Record)
- Deploy target: Vercel

## User roles

1. Admin (Club Owner)
   - Creates and manages the club account
   - Configures bookable resources
   - Invites and manages members
   - Views and manages all reservations
   - Pays the monthly subscription via Paddle

2. Member
   - Joins a club via invite link or code
   - Views a calendar of available resources
   - Books a time slot
   - Views and cancels their own upcoming reservations
   - Has no billing access

## Data model
- Club: id, name, admin_id, subscription_status, created_at
- User: id, email, role (admin/member), club_id
- Resource: id, club_id, name, description, capacity,
  booking_duration_minutes, available_hours
- Reservation: id, resource_id, member_id, start_time, end_time,
  status (confirmed/cancelled), created_at

## Key flows

Admin onboarding:
- Sign up / log in, create club, add bookable resources,
  generate an invite link/code for members

Admin dashboard:
- Calendar/list of all reservations, filterable by resource/date
- Cancel a reservation, manage members, add/edit resources
- Billing page showing plan status and Paddle checkout link

Member flow:
- Join via invite link/code, sign up or log in
- View available resources/slots, book a slot
- "My reservations" page: view and cancel upcoming bookings

## Booking rules
- Prevent double-booking beyond a resource's configured capacity
- Enforce each resource's available hours
- Allow cancellation up until a configurable cutoff before start time

## Payments (v1 scope — keep this simple)
- Only the Admin pays: one monthly subscription via Paddle to
  unlock full platform access for their club.
- Do NOT build any flow where members pay the club through the app.

## Out of scope for v1
- Member-to-club dues/fee collection
- Multiple admin roles per club
- Automated email/SMS reminders
- Multi-language support
- Waitlists or approval-based bookings

## Conventions
- All UI copy in English
- Use Supabase row-level security so one club can never see another
  club's data
- Keep components small and typed; avoid `any`
