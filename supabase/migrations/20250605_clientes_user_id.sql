alter table public.clientes
  add column if not exists user_id uuid;

create index if not exists idx_clientes_user_id on public.clientes(user_id);
