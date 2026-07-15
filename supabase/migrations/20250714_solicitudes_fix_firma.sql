-- Fix column name mismatch: rename firma to odontologo_firma and add missing columns
alter table public.solicitudes add column if not exists odontologo_firma text;
alter table public.solicitudes add column if not exists odontologo_direccion text;
alter table public.solicitudes add column if not exists odontologo_tarjeta_profesional text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'solicitudes' and column_name = 'firma') then
    update public.solicitudes set odontologo_firma = firma where firma is not null and odontologo_firma is null;
    alter table public.solicitudes drop column if exists firma;
  end if;
end $$;
