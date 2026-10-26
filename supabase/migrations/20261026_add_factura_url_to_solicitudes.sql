-- Agregar columna dedicada para la URL de la factura
alter table public.solicitudes
  add column if not exists factura_url text;

-- Índice para búsquedas rápidas
create index if not exists idx_solicitudes_factura_url on public.solicitudes(factura_url);

-- Políticas RLS para que admins y clientes puedan gestionar la factura
drop policy if exists "Los admins pueden actualizar solicitudes" on public.solicitudes;
drop policy if exists "Los clientes pueden ver sus propias solicitudes" on public.solicitudes;
drop policy if exists "Los clientes pueden actualizar sus propias solicitudes" on public.solicitudes;

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

create policy "Los clientes pueden ver sus propias solicitudes"
  on public.solicitudes for select
  using (
    exists (
      select 1 from public.clientes
      where clientes.id = solicitudes.cliente_id
      and clientes.user_id = auth.uid()
    )
  );

create policy "Los clientes pueden actualizar sus propias solicitudes"
  on public.solicitudes for update
  using (
    exists (
      select 1 from public.clientes
      where clientes.id = solicitudes.cliente_id
      and clientes.user_id = auth.uid()
    )
  );