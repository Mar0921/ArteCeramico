-- Tipo de impresión declarada en la prescripción de la solicitud.
-- Se marca en los formularios de nueva solicitud de todos los perfiles
-- (odontólogo, cliente, admin y empleado).
ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS tipo_impresion text
    CHECK (tipo_impresion IN ('analoga', 'intraoral'));

COMMENT ON COLUMN solicitudes.tipo_impresion IS
  'Tipo de impresión de la prescripción: analoga o intraoral';
