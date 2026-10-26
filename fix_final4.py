with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the block with 'const items = solicitudes.map' and replace it
new_block = [
    '      const items = solicitudes.map((sudoku: any) => {\n',
    '        const servicios = serviciosPorSudoku.get(sudoku.id) || []\n',
    '        const urlPdf = sudoku.urls_documentos?.[0] || null\n',
    '        const facturaUrl = sudoku.factura_url || null\n',
    '        const nombresServicios = servicios.length > 0\n',
    '          ? servicios.map((s: any) => s.nombre).filter(Boolean).join(", ")\n',
    '          : (sudoku.servicio || "Servicio")\n',
    '        const precioTotal = servicios.length > 0\n',
    '          ? servicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0)\n',
    '          : (Number(sudoku.precio) || 0)\n',
    '        const fechaServicio = servicios.length > 0\n',
    '          ? (servicios[0].created_at || sudoku.created_at)\n',
    '          : sudoku.created_at\n',
    '        return {\n',
    '          id: String(sudoku.id),\n',
    '          solicitudId: sudoku.id,\n',
    '          servicio: nombresServicios,\n',
    '          precio: precioTotal,\n',
    '          estado: sudoku.estado || "pendiente",\n',
    '          fecha: fechaServicio,\n',
    '          estadoPago: sudoku.estadoPago || "pendientePago",\n',
    '          comprobantePago: sudoku.comprobantePago || null,\n',
    '          urlPdf,\n',
    '          facturaUrl,\n',
    '          seleccionado: false,\n',
    '        }\n',
    '      })\n',
]

start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'const items = solicitudes.map' in line:
        start_idx = i
    if start_idx is not None and 'setTotalPagarPorCliente' in line:
        end_idx = i
        break

if start_idx and end_idx:
    lines[start_idx:end_idx] = new_block
    with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Replaced lines {start_idx+1} to {end_idx}")
else:
    print(f"start_idx={start_idx}, end_idx={end_idx}")