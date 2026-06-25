-- Drop ALL existing policies on conversaciones and mensajes
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('conversaciones', 'mensajes')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || rec.policyname || '" ON public.' || rec.tablename;
  END LOOP;
END $$;

-- Enable RLS (idempotent)
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CONVERSACIONES
-- ============================================

-- Cliente: puede crear conversaciones propias
CREATE POLICY "conversaciones_clientes_insert" ON public.conversaciones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = conversaciones.cliente_id
        AND clientes.user_id = auth.uid()
    )
  );

-- Cliente: puede ver sus propias conversaciones
CREATE POLICY "conversaciones_clientes_select" ON public.conversaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = conversaciones.cliente_id
        AND clientes.user_id = auth.uid()
    )
  );

-- Admin: puede ver todas las conversaciones
CREATE POLICY "conversaciones_admins_select" ON public.conversaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.activo = true
    )
  );

-- Admin: puede actualizar conversaciones (ej. asignar admin_id)
CREATE POLICY "conversaciones_admins_update" ON public.conversaciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.activo = true
    )
  );

-- ============================================
-- MENSAJES - CLIENTES
-- ============================================

-- Cliente: puede enviar mensajes en sus conversaciones
CREATE POLICY "mensajes_clientes_insert" ON public.mensajes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversaciones
      INNER JOIN public.clientes ON clientes.id = conversaciones.cliente_id
      WHERE conversaciones.id = mensajes.conversacion_id
        AND clientes.user_id = auth.uid()
    )
  );

-- Cliente: puede ver mensajes de sus conversaciones
CREATE POLICY "mensajes_clientes_select" ON public.mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversaciones
      INNER JOIN public.clientes ON clientes.id = conversaciones.cliente_id
      WHERE conversaciones.id = mensajes.conversacion_id
        AND clientes.user_id = auth.uid()
    )
  );

-- Cliente: puede actualizar sus mensajes (ej. marcar como leido)
CREATE POLICY "mensajes_clientes_update" ON public.mensajes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversaciones
      INNER JOIN public.clientes ON clientes.id = conversaciones.cliente_id
      WHERE conversaciones.id = mensajes.conversacion_id
        AND clientes.user_id = auth.uid()
    )
  );

-- ============================================
-- MENSAJES - ADMINS
-- ============================================

-- Admin: puede enviar mensajes
CREATE POLICY "mensajes_admins_insert" ON public.mensajes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.activo = true
    )
  );

-- Admin: puede ver todos los mensajes
CREATE POLICY "mensajes_admins_select" ON public.mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.activo = true
    )
  );

-- Admin: puede actualizar mensajes
CREATE POLICY "mensajes_admins_update" ON public.mensajes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.activo = true
    )
  );