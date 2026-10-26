with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add `factura_url?: string | null` to Solicitud interface after observacionesPago
old = '  observacionesPago: string | null\n  conversacion_id?: number\n}'
new = '  observacionesPago: string | null\n  conversacion_id?: number\n  factura_url?: string | null\n}'
content = content.replace(old, new)

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Interfaz actualizada")