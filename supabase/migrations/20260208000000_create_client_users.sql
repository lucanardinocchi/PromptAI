-- client_users: maps Supabase Auth users to company/contact for the dashboard
create table public.client_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  role text not null default 'ic' check (role in ('exec', 'ic')),
  created_at timestamptz not null default now()
);

create unique index idx_client_users_auth on public.client_users(auth_user_id);
create index idx_client_users_company on public.client_users(company_id);

alter table public.client_users enable row level security;

-- client_users: users can read their own row
create policy "Users read own profile"
  on public.client_users for select
  using (auth.uid() = auth_user_id);

-- companies: dashboard users can read their own company
create policy "Dashboard users read own company"
  on public.companies for select
  using (
    exists (
      select 1 from public.client_users cu
      where cu.auth_user_id = auth.uid()
      and cu.company_id = companies.id
    )
  );

-- contacts: exec reads all for company, ic reads only self
create policy "Dashboard users read contacts"
  on public.contacts for select
  using (
    exists (
      select 1 from public.client_users cu
      where cu.auth_user_id = auth.uid()
      and cu.company_id = contacts.company_id
      and (cu.role = 'exec' or cu.contact_id = contacts.id)
    )
  );

-- engagements: all dashboard users read their company engagements
create policy "Dashboard users read engagements"
  on public.engagements for select
  using (
    exists (
      select 1 from public.client_users cu
      where cu.auth_user_id = auth.uid()
      and cu.company_id = engagements.company_id
    )
  );

-- contact_tasks: exec reads all for company, ic reads only own
create policy "Dashboard users read contact_tasks"
  on public.contact_tasks for select
  using (
    exists (
      select 1 from public.client_users cu
      join public.contacts c on c.id = contact_tasks.contact_id
      where cu.auth_user_id = auth.uid()
      and cu.company_id = c.company_id
      and (cu.role = 'exec' or cu.contact_id = contact_tasks.contact_id)
    )
  );

-- ai_usage: exec reads all for company, ic reads only own
create policy "Dashboard users read ai_usage"
  on public.ai_usage for select
  using (
    exists (
      select 1 from public.client_users cu
      where cu.auth_user_id = auth.uid()
      and cu.company_id = ai_usage.company_id
      and (cu.role = 'exec' or cu.contact_id = ai_usage.contact_id)
    )
  );

-- training_log: exec reads all for company, ic reads only own
create policy "Dashboard users read training_log"
  on public.training_log for select
  using (
    exists (
      select 1 from public.client_users cu
      join public.engagements e on e.id = training_log.engagement_id
      where cu.auth_user_id = auth.uid()
      and cu.company_id = e.company_id
      and (cu.role = 'exec' or cu.contact_id = training_log.contact_id)
    )
  );

-- support_tickets: exec reads all for company, ic reads only own
create policy "Dashboard users read support_tickets"
  on public.support_tickets for select
  using (
    exists (
      select 1 from public.client_users cu
      join public.engagements e on e.id = support_tickets.engagement_id
      where cu.auth_user_id = auth.uid()
      and cu.company_id = e.company_id
      and (cu.role = 'exec' or cu.contact_id = support_tickets.contact_id)
    )
  );

-- support_tickets: users can insert tickets linked to their engagement and contact
create policy "Dashboard users insert support_tickets"
  on public.support_tickets for insert
  with check (
    exists (
      select 1 from public.client_users cu
      join public.engagements e on e.id = engagement_id
      where cu.auth_user_id = auth.uid()
      and cu.company_id = e.company_id
      and cu.contact_id = contact_id
    )
  );
