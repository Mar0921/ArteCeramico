-- Agregar columna observaciones_orden a la tabla solicitudes para guardar observaciones de la orden de fabricación
alter table public.solicitudes add column if not exists observaciones_orden text;