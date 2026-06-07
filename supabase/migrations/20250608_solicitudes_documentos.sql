alter table public.solicitudes
  add column if not exists declaracion_conformidad text;

alter table public.solicitudes
  add column if not exists guia_fabricacion text;

alter table public.solicitudes
  add column if not exists manual_uso text;
