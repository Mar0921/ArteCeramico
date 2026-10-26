with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block and replace it
# The block starts with 'const items = solicitudes.map' and ends before 'setTotalPagarPorCliente'
idx = content.find('const items = solicitudes.map')
if idx >= 0:
    # Find the end of the block (the closing brace of the map)
    end_idx = content.find('})', idx)
    if end_idx >= 0:
        end_idx += 2  # Include the closing brace
        old_block = content[idx:end_idx]
        # Create the correct block with 'sudoku' as parameter and 'sudoku' inside
        new_block = """      const items = solicitudes.map((sudoku: any) => {
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
      })"""
        content = content.replace(old_block, new_block)
        with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Corregido')
    else:
        print('No se encontró el final del bloque')
else:
    print('No se encontró el inicio del bloque')