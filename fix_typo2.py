with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block and replace it using exact string matching
old = '      const items = solicitudes.map((solicitud: any) => {\n        const servicios = serviciosPorSudoku.get(sudoku.id) || []\n        const urlPdf = sudoku.urls_documentos?.[0] || null\n        const facturaUrl = sudoku.factura_url || null\n        const nombresServicios = servicios.length > 0\n          ? servicios.map((s: any) => s.nombre).filter(Boolean).join(", ")\n          : (sudoku.servicio || "Servicio")\n        const precioTotal = servicios.length > 0\n          ? servicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0)\n          : (Number(sudoku.precio) || 0)\n        const fechaServicio = servicios.length > 0\n          ? (servicios[0].created_at || sudoku.created_at)\n          : sudoku.created_at\n        return {\n          id: String(sudoku.id),\n          solicitudId: sudoku.id,\n          servicio: nombresServicios,\n          precio: precioTotal,\n          estado: sudoku.estado || "pendiente",\n          fecha: fechaServicio,\n          estadoPago: sudoku.estadoPago || "pendientePago",\n          comprobantePago: sudoku.comprobantePago || null,\n          urlPdf,\n          facturaUrl,\n          seleccionado: false,\n        }\n      })'

new = '      const items = solicitudes.map((solicitud: any) => {\n        const servicios = serviciosPorSudoku.get(sudoku.id) || []\n        const urlPdf = sudoku.urls_documentos?.[0] || null\n        const facturaUrl = sudoku.factura_url || null\n        const nombresServicios = servicios.length > 0\n          ? servicios.map((s: any) => s.nombre).filter(Boolean).join(", ")\n          : (sudoku.servicio || "Servicio")\n        const precioTotal = servicios.length > 0\n          ? servicios.reduce((sum: number, s: any) => sum + (Number(s.precio) || 0), 0)\n          : (Number(sudoku.precio) || 0)\n        const fechaServicio = servicios.length > 0\n          ? (servicios[0].created_at || sudoku.created_at)\n          : sudoku.created_at\n        return {\n          id: String(sudoku.id),\n          solicitudId: sudoku.id,\n          servicio: nombresServicios,\n          precio: precioTotal,\n          estado: sudoku.estado || "pendiente",\n          fecha: fechaServicio,\n          estadoPago: sudoku.estadoPago || "pendientePago",\n          comprobantePago: sudoku.comprobantePago || null,\n          urlPdf,\n          facturaUrl,\n          seleccionado: false,\n        }\n      })'

if old in content:
    content = content.replace(old, new)
    with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Corregido')
else:
    print('No encontrado')
    # Try to find the block
    idx = content.find('const items = solicitudes.map')
    if idx >= 0:
        print(content[idx:idx+1100])