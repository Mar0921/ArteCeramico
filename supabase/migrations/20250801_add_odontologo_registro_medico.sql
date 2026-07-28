-- Migrar registro medico a su propia columna
alter table public.solicitudes add column if not exists odontologo_registro_medico text;

update public.solicitudes
set odontologo_registro_medico = odontologo_tarjeta_profesional
where odonto_registro_medico is null
  and odontologo_tarjeta_profesional is not null;
