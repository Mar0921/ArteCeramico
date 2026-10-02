-- Notificación "Listo para envío" cuando una solicitud pasa a Terminado = Si
--
-- El trigger vive en la base de datos a propósito: el dashboard de admin
-- actualiza la solicitud con el cliente de Supabase directamente (no pasa por
-- una API route), así que un trigger es el único punto que cubre todos los
-- caminos de escritura sin depender del frontend.

-- Control de envío de correo (idempotencia: cada aviso se envía una sola vez)
alter table public.notificaciones
  add column if not exists email_enviado boolean not null default false;
alter table public.notificaciones
  add column if not exists email_enviado_at timestamp with time zone;

create index if not exists idx_notificaciones_pendientes_email
  on public.notificaciones (tipo, email_enviado)
  where email_enviado = false;

CREATE OR REPLACE FUNCTION public.crear_notificacion_listo_envio()
RETURNS TRIGGER AS $$
DECLARE
  v_terminado text;
  v_anterior text;
  v_cliente_id bigint;
  v_cliente_nombre text;
  v_servicio text;
  v_codigo text;
  v_conversacion_id bigint;
  v_contenido text;
BEGIN
  v_terminado := lower(trim(coalesce(NEW.terminado, '')));
  v_anterior := lower(trim(coalesce(OLD.terminado, '')));

  -- Solo cuando la casilla pasa de cualquier valor a "Si".
  -- Si ya estaba en "Si" no se repite, de modo que guardar el formulario
  -- varias veces no genera avisos duplicados.
  IF v_terminado IS DISTINCT FROM 'si' OR v_anterior = 'si' THEN
    RETURN NEW;
  END IF;

  SELECT s.cliente_id, c.nombre, s.servicio, s.codigo_trazabilidad
  INTO v_cliente_id, v_cliente_nombre, v_servicio, v_codigo
  FROM public.solicitudes s
  JOIN public.clientes c ON c.id = s.cliente_id
  WHERE s.id = NEW.id;

  IF v_cliente_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- conversacion_id es NOT NULL en la tabla: se reutiliza la conversación de
  -- la solicitud si existe y, si no, se usa 0 para marcar "sin conversación".
  SELECT id INTO v_conversacion_id
  FROM public.conversaciones
  WHERE solicitud_id = NEW.id
  ORDER BY id
  LIMIT 1;

  v_conversacion_id := coalesce(v_conversacion_id, 0);

  v_contenido := 'Tu trabajo "' || coalesce(nullif(trim(v_servicio), ''), 'sin servicio') || '"'
    || CASE
         WHEN v_codigo IS NOT NULL AND trim(v_codigo) <> '' THEN ' (Nº ' || v_codigo || ')'
         ELSE ''
       END
    || ' está terminado y listo para envío.';

  INSERT INTO public.notificaciones (
    cliente_id,
    solicitud_id,
    conversacion_id,
    tipo,
    titulo,
    contenido,
    vista,
    cliente_nombre,
    solicitud_servicio
  ) VALUES (
    v_cliente_id,
    NEW.id,
    v_conversacion_id,
    'listo_envio',
    'Listo para envío',
    v_contenido,
    false,
    v_cliente_nombre,
    v_servicio
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_crear_notificacion_listo_envio ON public.solicitudes;
CREATE TRIGGER trigger_crear_notificacion_listo_envio
  AFTER UPDATE OF terminado ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.crear_notificacion_listo_envio();
