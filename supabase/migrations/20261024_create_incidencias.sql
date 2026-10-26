-- Migration: create incidencias table and related tables
CREATE TABLE IF NOT EXISTS public.incidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora time,
  tipo text,
  empleado_id uuid REFERENCES public.empleados(id) ON DELETE SET NULL,
  fase text,
  coste numeric(12,2) DEFAULT 0,
  visible_cliente boolean DEFAULT false,
  descripcion text,
  solicitud_id uuid REFERENCES public.solicitudes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incidencia_productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incidencia_id uuid REFERENCES public.incidencias(id) ON DELETE CASCADE,
  producto_id uuid,
  producto_nombre text
);

CREATE TABLE IF NOT EXISTS public.incidencia_medidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incidencia_id uuid REFERENCES public.incidencias(id) ON DELETE CASCADE,
  estado text,
  fecha_resolucion date,
  responsable text,
  medidas_tomadas text
);

ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidencias_all" ON public.incidencias FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.incidencia_productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidencia_productos_all" ON public.incidencia_productos FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.incidencia_medidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidencia_medidas_all" ON public.incidencia_medidas FOR ALL USING (true) WITH CHECK (true);
