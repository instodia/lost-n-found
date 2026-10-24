-- ==============================================================================
-- FindIt - Lost & Found Portal Supabase Database Schema
-- Includes Row Level Security (RLS) policies for secure ownership and claim privacy
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Items Table
create table if not exists public.items (
  id text primary key default concat('item-', uuid_generate_v4()),
  type text not null check (type in ('LOST', 'FOUND')),
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  city text default 'Metro City',
  date date not null default current_date,
  time text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PENDING_CLAIM', 'RESOLVED', 'REJECTED')),
  reporter_id text not null,
  reporter_name text not null,
  reporter_email text not null,
  reporter_phone text,
  images text[] default array[]::text[],
  secret_details text, -- Anti-fraud hidden verification info
  reward text,
  views_count integer default 0,
  flagged boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Claims Table
create table if not exists public.claims (
  id text primary key default concat('claim-', uuid_generate_v4()),
  item_id text not null references public.items(id) on delete cascade,
  item_title text not null,
  claimant_id text not null,
  claimant_name text not null,
  claimant_email text not null,
  claimant_phone text,
  description text not null,
  proof_images text[] default array[]::text[],
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  reporter_id text not null,
  reporter_notes text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Activity Logs Table
create table if not exists public.activity_logs (
  id text primary key default concat('act-', uuid_generate_v4()),
  text text not null,
  type text not null default 'info',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.activity_logs enable row level security;

-- Policy 1: Items public read (Public can see active listings)
create policy "Allow public read access to active items"
  on public.items for select
  using (flagged = false or auth.uid()::text = reporter_id);

-- Policy 2: Items insert (Authenticated users can post reports)
create policy "Allow authenticated users to create items"
  on public.items for insert
  with check (auth.uid()::text = reporter_id);

-- Policy 3: Items update (Only reporter or admin can edit their own item)
create policy "Allow reporter to update their own item"
  on public.items for update
  using (
    auth.uid()::text = reporter_id 
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Policy 4: Items delete (Only reporter or admin can delete item)
create policy "Allow reporter or admin to delete item"
  on public.items for delete
  using (
    auth.uid()::text = reporter_id 
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Policy 5: Claims privacy (Only claimant and item reporter or admin can view claim)
create policy "Allow claimant and reporter to view claim"
  on public.claims for select
  using (
    auth.uid()::text = claimant_id 
    or auth.uid()::text = reporter_id 
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Policy 6: Claims creation (Authenticated users can submit a claim)
create policy "Allow authenticated users to submit claim"
  on public.claims for insert
  with check (auth.uid()::text = claimant_id);

-- Policy 7: Claims review (Item reporter or admin can update claim status)
create policy "Allow item reporter or admin to update claim status"
  on public.claims for update
  using (
    auth.uid()::text = reporter_id 
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Policy 8: Public read for activity logs
create policy "Allow read access to activity logs"
  on public.activity_logs for select
  using (true);
