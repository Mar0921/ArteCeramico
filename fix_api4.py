with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar el select incorrecto con el correcto usando `factura_url`
old_select = '.select("id, servicio, estado, created_at, cliente_id, dientes_trabajados, odontologo, cc_odontologo, paciente, cc_paciente, odontologo_registro_medico, fecha_elaboracion, fecha_entrega, odontologo_firma, color, guia, tipos_trabajo, materiales, urls_documentos, dibujo_odontologo, codigo_trazabilidad, caja, fase, orden_fabricacion_url, orden_materiales, orden_fases, terminos_garantia, fichas_tecnicas, historia_clinica, historia_clinica_paciente, tipo_impresion, observaciones_orden")'
new_select = '.select("id, servicio, estado, created_at, cliente_id, dientes_trabajados, odontologo, cc_odontologo, paciente, cc_paciente, odontologo_registro_medico, fecha_elaboracion, fecha_entrega, odontologo_firma, color, guia, tipos_trabajo, materiales, urls_documentos, dibujo_odontologo, codigo_trazabilidad, caja, fase, orden_fabricacion_url, orden_materiales, orden_fases, terminos_garantia, fichas_tecnicas, historia_clinica, historia_clinica_paciente, tipo_impresion, observaciones_orden, facturas_url")'
content = content.replace(old_select, new_select)

# Buscar y corregir cualquier referencia a facturas_url -> facturas_url
content = content.replace('facturas_url', 'facturas_url')

with open('app/api/solicitudes/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("API actualizada")