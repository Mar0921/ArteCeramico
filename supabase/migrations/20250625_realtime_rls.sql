-- Realtime RLS policies for mensajes and solicitudes
-- Ejecuta esto en Supabase SQL Editor si no quieres crear una migración nueva

-- Mensajes: permitir SELECT a authenticated para Realtime
DROP POLICY IF EXISTS "mensajes_realtime_select" ON public.mensajes;
CREATE POLICY "mensajes_realtime_select" ON public.mensajes
  FOR SELECT
  TO authenticated
  USING (true);

-- Mensajes: permitir INSERT a authenticated para Realtime
DROP POLICY IF EXISTS "mensajes_realtime_insert" ON public.mensajes;
CREATE POLICY "mensajes_realtime_insert" ON public.mensajes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solicitudes: permitir SELECT a authenticated para Realtime
DROP POLICY IF EXISTS "solicitudes_realtime_select" ON public.solicitudes;
CREATE POLICY "solicitudes_realtime_select" ON public.solicitudes
  FOR SELECT
  TO authenticated
  USING (true);

-- Solicitudes: permitir UPDATE a authenticated para Realtime
DROP POLICY IF EXISTS "solicitudes_realtime_update" ON public.solicitudes;
CREATE POLICY "solicitudes_realtime_update" ON public.solicitudes
  FOR UPDATE
  TO authenticated
  USING (true);
