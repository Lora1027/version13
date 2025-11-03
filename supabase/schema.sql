
-- Safe re-run: drop existing triggers if they exist
do $$ begin
  if exists (select 1 from pg_trigger where tgname='set_user_id_transactions') then
    drop trigger set_user_id_transactions on public.transactions;
  end if;
exception when undefined_table then end $$;

do $$ begin
  if exists (select 1 from pg_trigger where tgname='set_user_id_balances') then
    drop trigger set_user_id_balances on public.balances;
  end if;
exception when undefined_table then end $$;

do $$ begin
  if exists (select 1 from pg_trigger where tgname='set_user_id_inventory') then
    drop trigger set_user_id_inventory on public.inventory;
  end if;
exception when undefined_table then end $$;

-- Tables
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  type text check (type in ('income','expense')) not null,
  category text,
  method text check (method in ('cash','gcash','bank')),
  amount numeric not null,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sku text,
  name text,
  unit_cost numeric,
  qty int,
  created_at timestamp with time zone default now()
);

create table if not exists public.balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text check (kind in ('capital','cash','gcash','bank')) not null,
  label text,
  amount numeric not null default 0,
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.transactions enable row level security;
alter table public.inventory enable row level security;
alter table public.balances enable row level security;

-- Policies (drop & recreate)
drop policy if exists tx_select_own on public.transactions;
drop policy if exists tx_ins_own on public.transactions;
drop policy if exists tx_upd_own on public.transactions;
drop policy if exists tx_del_own on public.transactions;

create policy tx_select_own on public.transactions for select using (auth.uid() = user_id);
create policy tx_ins_own on public.transactions for insert with check (auth.uid() = user_id);
create policy tx_upd_own on public.transactions for update using (auth.uid() = user_id);
create policy tx_del_own on public.transactions for delete using (auth.uid() = user_id);

drop policy if exists inv_select_own on public.inventory;
drop policy if exists inv_ins_own on public.inventory;
drop policy if exists inv_upd_own on public.inventory;
drop policy if exists inv_del_own on public.inventory;

create policy inv_select_own on public.inventory for select using (auth.uid() = user_id);
create policy inv_ins_own on public.inventory for insert with check (auth.uid() = user_id);
create policy inv_upd_own on public.inventory for update using (auth.uid() = user_id);
create policy inv_del_own on public.inventory for delete using (auth.uid() = user_id);

drop policy if exists bal_select_own on public.balances;
drop policy if exists bal_ins_own on public.balances;
drop policy if exists bal_upd_own on public.balances;
drop policy if exists bal_del_own on public.balances;

create policy bal_select_own on public.balances for select using (auth.uid() = user_id);
create policy bal_ins_own on public.balances for insert with check (auth.uid() = user_id);
create policy bal_upd_own on public.balances for update using (auth.uid() = user_id);
create policy bal_del_own on public.balances for delete using (auth.uid() = user_id);

-- Auto set user_id triggers
create or replace function public.set_user_id() returns trigger as $$
begin
  if new.user_id is null then new.user_id := auth.uid(); end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger set_user_id_transactions before insert on public.transactions for each row execute function public.set_user_id();
create trigger set_user_id_balances before insert on public.balances for each row execute function public.set_user_id();
create trigger set_user_id_inventory before insert on public.inventory for each row execute function public.set_user_id();
