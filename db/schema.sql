-- Enable UUID generation
create extension if not exists pgcrypto;

-- Pairs (question items)
create table if not exists pairs (
  id uuid primary key default gen_random_uuid(),
  left_url text not null,
  right_url text not null,
  left_tags jsonb not null default '{}'::jsonb,
  right_tags jsonb not null default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_pairs_active on pairs(active);

-- User choices
create table if not exists choices (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  pair_id uuid not null references pairs(id) on delete cascade,
  picked char(1) not null check (picked in ('L','R')),
  confidence numeric,
  time_ms int,
  reason_tags text[],
  created_at timestamptz default now()
);
create index if not exists idx_choices_user on choices(user_id);
create index if not exists idx_choices_pair on choices(pair_id);
