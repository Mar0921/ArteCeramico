with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the flatMap logic to group by solicitud instead of by servicio
old_logic = """      const items = solicitudes.flatMap((sudoku: any) => {
        const servicios = serviciosPorSudoku.get(sudoku.id) || []
        const urlPdf = sudoku.urls_documentos?.[0] || null
        const facturaUrl = sudoku.factura_url || null
        if (servicios.length > 0) {
          return servicios.map((serv: any) => ({
            id: `${sudoku.id}-${serv.id}`,
            solicitudId: sudoku.id,
            servicio: serv.nombre || sudoku.servicio,
            precio: serv.precio || 0,
            estado: sudoku.estado || "pendiente",
            fecha: serv.created_at || sudoku.created_at,
            estadoPago: sudoku.estadoPago || "pendientePago",
            comprobantePago: sudoku.comprobantePago || null,
            urlPdf,
            facturaUrl,
            seleccionado: false,
          }))
        }
        return [{
          id: `${sudoku.id}`,
          solicitudId: sudoku.id,
          servicio: sudoku.servicio || "Servicio",
          precio: sudoku.precio || 0,
          estado: sudoku.estado || "pendiente",
          fecha: sudoku.created_at,
          estadoPago: sudoku.estadoPago || "pendientePago",
          comprobantePago: sudoku.comprobantePago || null,
          urlPdf,
          facturaUrl,
          seleccionado: false,
        }]
      })"""

new_logic = """      const items = solicitudes.map((sudoku: any) => {
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

content = content.replace(old_logic, new_logic)

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Lógica actualizada")