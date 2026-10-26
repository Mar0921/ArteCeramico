with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the Solicitud interface and add `factura_url` after `conversacion_id?: number`
for i, line in enumerate(lines):
    if 'conversacion_id?: number' in line and i < len(lines) - 1:
        next_line = lines[i+1].strip()
        if next_line == '}':
            # Insert before the closing brace
            lines.insert(i+1, '  facturas_url?: string | null\n')
            print(f"Added facturas_url at line {i+2}")
            break

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")