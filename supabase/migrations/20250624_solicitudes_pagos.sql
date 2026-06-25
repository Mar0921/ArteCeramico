-- Agregar columnas para gestión de pagos a la tabla solicitudes
alter table public.solicitudes add column if not exists comprobante_pago text;
alter table public.solicitudes add column if not exists estado_pago text default 'pendiente_pago';
alter table public.solicitudes add column if not exists fecha_pago timestamp;
alter table public.solicitudes add column if not exists observaciones_pago text;