-- Persists the Paddle customer/subscription ids (the webhook already tracks
-- subscription_status but never kept these) so the billing page can open a
-- customer-portal session and list invoices for the right subscription.
alter table public.clubs
  add column paddle_customer_id text,
  add column paddle_subscription_id text;
