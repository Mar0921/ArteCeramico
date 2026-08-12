-- Create fichas_tecnicas table for storing technical sheets per solicitud

create table if not exists public.fichas_tecnicas (
  id bigserial primary key,
  solicitud_id bigint not null references public.solicitudes(id) on delete cascade,
  tipo text not null,
  nombre text not null,
  fecha date not null default current_date,
  secciones jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.fichas_tecnicas enable row level security;

drop policy if exists "Users can view fichas of their solicitudes" on public.fichas_tecnicas;
create policy "Users can view fichas of their solicitudes"
  on public.fichas_tecnicas for select
  to authenticated
  using (true);

drop policy if exists "Users can insert fichas" on public.fichas_tecnicas;
create policy "Users can insert fichas"
  on public.fichas_tecnicas for insert
  to authenticated
  with check (true);

drop policy if exists "Users can update fichas" on public.fichas_tecnicas;
create policy "Users can update fichas"
  on public.fichas_tecnicas for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Users can delete fichas" on public.fichas_tecnicas;
create policy "Users can delete fichas"
  on public.fichas_tecnicas for delete
  to authenticated
  using (true);
