with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the flatMap line and replace the whole block
new_block = """      const items = solicitudes.map((solicitud: any) => {
        const servicios = serviciosPorSudoku.get(sudoku.id) || []
        const urlPdf = sudoku.urls_documentos?.[0] || null
        const facturaUrl = sudoku.factura_url || null
        const nombresServicios = servicios.length > 0
          ? servicios.map((s: any) => s.nombre).filter(Boolean).join(", ")
          : (sudoku.servicio || "Servicio")
        const precioTotal = servicios.length > 0
          ? servicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0)
          : (Number(sudoku.precio) || 0)
        const fechaServicio = servicios.length > 0
          ? (servicios[0].created_at || sudoku.created_at)
          : sudoku.created_at
        return {
          id: String(sudoku.id),
          solicitudId: sudoku.id,
          servicio: nombresServicios,
          precio: precioTotal,
          estado: sudoku.estado || "pendiente",
          fecha: fechaServicio,
          estadoPago: sudoku.estadoPago || "pendientePago",
          comprobantePago: sudoku.comprobantePago || null,
          urlPdf,
          facturaUrl,
          seleccionado: false,
        }
      })
"""

# Find start and end of the flatMap block
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'const items = solicitudes.flatMap' in line:
        start_idx = i
    if start_idx is not None and 'setItemsEstadoCuenta((prev) => ({ ...prev, [clienteId]: items }))' in line:
        end_idx = i
        break

if start_idx and end_idx:
    # Replace lines from start_idx to end_idx-1 with new_block
    lines[start_idx:end_idx] = [new_block]
    with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Replaced lines {start_idx+1} to {end_idx}")
else:
    print(f"start_idx={start_idx}, end_idx={end_idx}")
    # Try to find the block
    for i, line in enumerate(lines):
        if 'const items = solicitudes' in line:
            print(f"Line {i+1}: {line.rstrip()}")