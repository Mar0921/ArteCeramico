-- Agregar columnas para documentos en la tabla servicios
alter table public.servicios add column if not exists declaracion_conformidad text;
alter table public.servicios add column if not exists guia_fabricacion text;
alter table public.servicios add column if not exists manual_uso text;