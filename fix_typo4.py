with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the block with 'const items = solicitudes.map' and replace it
# The block starts with 'const items = solicitudes.map' and ends before 'setTotalPagarPorCliente'
import re

# Find the exact block
pattern = r'      const items = solicitudes\.map\(\(sudoku: any\) => \{.*?\}\)'
match = re.search(pattern, content, re.DOTALL)
if match:
    old_block = match.group(0)
    # Replace 'sudoku' with 'sudoku' in the block
    new_block = old_block.replace('(sudoku: any)', '(sudoku: any)')
    # Wait, that's the same. Let me think...
    # The issue is that the parameter is 'sudoku' but inside we use 'sudoku'
    # Actually, looking at the output, the parameter IS 'sudoku' and inside we use 'sudoku'
    # That's the bug! The parameter should be 'sudoku' and inside should use 'sudoku'
    # OR the parameter should be 'sudoku' and inside should use 'sudoku'
    # Let me check the original code...
    # The original flatMap used 'sudoku' as parameter and 'sudoku' inside
    # So the new block should use 'sudoku' as parameter and 'sudoku' inside
    # But in my new block, I used 'sudoku' as parameter and 'sudoku' inside
    # That's the bug! Let me fix it.
    new_block = old_block.replace('(sudoku: any)', '(sudoku: any)')
    # Now replace all 'sudoku' with 'sudoku' inside the block
    # But only the ones that are not the parameter
    # Actually, let's just replace the whole block with the correct one
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
    print('No encontrado')
    idx = content.find('const items = solicitudes.map')
    if idx >= 0:
        print(content[idx:idx+1100])