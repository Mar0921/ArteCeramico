alter table public.solicitudes
  add column if not exists fichas_tecnicas text[] default '{}';
