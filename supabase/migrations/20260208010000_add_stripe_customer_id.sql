-- Add stripe_customer_id to companies for linking to Stripe invoices
alter table public.companies add column stripe_customer_id text;

create index idx_companies_stripe on public.companies(stripe_customer_id)
  where stripe_customer_id is not null;
