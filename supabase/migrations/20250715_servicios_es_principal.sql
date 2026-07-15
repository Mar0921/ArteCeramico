-- Agregar campo es_principal a la tabla servicios
alter table public.servicios add column if not exists es_principal boolean default false;

-- Actualizar el servicio principal existente para que tenga es_principal = true
-- Esto asume que el servicio principal es el primero creado para cada solicitud
update public.servicios
set es_principal = true
where id in (
  select min(id)
  from public.servicios
  group by solicitud_id
);
