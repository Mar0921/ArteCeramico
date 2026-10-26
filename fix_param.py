with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the parameter name 'sudoku' with 'sudoku' in the map callback
content = content.replace(
    'const items = solicitudes.map((sudoku: any) => {',
    'const items = solicitudes.map((sudoku: any) => {'
)

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Parámetro corregido')