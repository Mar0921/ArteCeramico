with open('app/api/solicitudes/route.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and modify the select line
for i, line in enumerate(lines):
    if '.select("id, servicio' in line and 'observaciones_orden' in line:
        # Add facturas_url before the closing quote
        lines[i] = line.replace(
            'observaciones_orden")',
            'observaciones_orden, facturas_url")'
        )
        print(f"Modified line {i+1}")
        break

# Find and modify the formatted return
for i, line in enumerate(lines):
    if 'observaciones_orden: item.observaciones_orden || null,' in line:
        lines[i] = line.replace(
            'observaciones_orden: item.observaciones_orden || null,',
            'observaciones_orden: item.observaciones_orden || null,\n        facturas_url: item.facturas_url || null,'
        )
        print(f"Modified line {i+1}")
        break

with open('app/api/solicitudes/route.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")