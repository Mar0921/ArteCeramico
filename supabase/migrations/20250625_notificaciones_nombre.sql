-- Agregar columnas de texto para cliente y solicitud en notificaciones
alter table public.notificaciones add column if not exists cliente_nombre text;
alter table public.notificaciones add column if not exists solicitud_servicio text;
