with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Corregir el nombre del campo a `factura_url` (singular)
content = content.replace('facturas_url', 'factura_url')

with open('app/api/solicitudes/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Nombre del campo corregido")