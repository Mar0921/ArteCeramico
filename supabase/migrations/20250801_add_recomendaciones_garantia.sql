alter table public.solicitudes
  add column if not exists recomendaciones text,
  add column if not exists garantia text;
