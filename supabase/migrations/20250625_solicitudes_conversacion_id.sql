alter table public.solicitudes add column if not exists conversacion_id bigint;
create index if not exists idx_solicitudes_conversacion_id on public.solicitudes(conversacion_id);