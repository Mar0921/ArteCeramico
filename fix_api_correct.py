with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar `factura_url` al SELECT
old_select = 'observaciones_orden")'
new_select = 'observaciones_orden, facturas_url")'
content = content.replace(old_select, new_select)

# 2. Agregar `factura_url` a la respuesta formateada
old_formatted = 'observaciones_orden: item.observaciones_orden || null,'
new_formatted = 'observaciones_orden: item.observaciones_orden || null,\n        facturas_url: item.facturas_url || null,'
content = content.replace(old_formatted, new_formatted)

with open('app/api/solicitudes/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("API actualizada correctamente")