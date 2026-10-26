with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar `factura_url` a la consulta SELECT
old_select = '.select("id, servicio, estado, created_at, cliente_id, dientes_trabajados, odontologo, cc_odontologo, paciente, cc_paciente, odontologo_registro_medico, fecha_elaboracion, fecha_entrega, odontologo_firma, color, guia, tipos_trabajo, materiales, urls_documentos, dibujo_odontologo, codigo_trazabilidad, caja, fase, orden_fabricacion_url, orden_materiales, orden_fases, terminos_garantia, fichas_tecnicas, historia_clinica, historia_clinica_paciente, tipo_impresion, observaciones_orden")'
new_select = '.select("id, servicio, estado, created_at, cliente_id, dientes_trabajados, odontologo, cc_odontologo, paciente, cc_paciente, odontologo_registro_medico, fecha_elaboracion, fecha_entrega, odontologo_firma, color, guia, tipos_trabajo, materiales, urls_documentos, dibujo_odontologo, codigo_trazabilidad, caja, fase, orden_fabricacion_url, orden_materiales, orden_fases, terminos_garantia, fichas_tecnicas, historia_clinica, historia_clinica_paciente, tipo_impresion, observaciones_orden, facturas_url")'
content = content.replace(old_select, new_select)

# 2. Agregar `factura_url` a la respuesta formateada
old_formatted = 'observaciones_orden: item.observaciones_orden || null,'
new_formatted = 'observaciones_orden: item.observaciones_orden || null,\n        facturas_url: item.facturas_url || null,'
content = content.replace(old_formatted, new_formatted)

with open('app/api/solicitudes/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("API actualizada")