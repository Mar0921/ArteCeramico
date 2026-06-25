-- Agregar columna conversacion_id a solicitudes si no existe
alter table public.solicitudes add column if not exists conversacion_id bigint;
create index if not exists idx_solicitudes_conversacion_id on public.solicitudes(conversacion_id);

-- Políticas RLS para que admins accedan a solicitudes
drop policy if exists "Los admins pueden ver todas las solicitudes" on public.solicitudes;
drop policy if exists "Los admins pueden actualizar solicitudes" on public.solicitudes;
drop policy if exists "Los admins pueden ver todos los servicios" on public.servicios;

create policy "Los admins pueden ver todas las solicitudes"
  on public.solicitudes for select
  using (
    exists (
      select 1 from public.admins
      where admins.user_id = auth.uid()
        and admins.activo = true
    )
  );

create policy "Los admins pueden actualizar solicitudes"
  on public.solicitudes for update
  using (
    exists (
      select 1 from public.admins
      where admins.user_id = auth.uid()
        and admins.activo = true
    )
  );

create policy "Los admins pueden ver todos los servicios"
  on public.servicios for select
  using (
    exists (
      select 1 from public.admins
      where admins.user_id = auth.uid()
        and admins.activo = true
    )
  );