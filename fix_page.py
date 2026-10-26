import os

filepath = 'app/dashboard/clientes/[id]/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar `factura_url` a la interfaz Solicitud (después de observacionesPago)
old_solicitud = """  observacionesPago: string | null
  conversacion_id?: number
}"""
new_solicitud = """  observacionesPago: string | null
  conversacion_id?: number
  factura_url?: string | null
}"""
content = content.replace(old_solicitud, new_solicitud)

# 2. Modificar handleSubirFactura para usar el nuevo campo
old_upload = """  const handleSubirFactura = async (solicitudId: number) => {
    const file = facturaDocs[solicitudId]
    if (!file) return

    setUploadingFactura((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `facturas/${solicitudId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName)

      setFacturasPorSolicitud((prev) => ({ ...prev, [solicitudId]: publicUrl }))

      const solicitud = solicitudes.find((s) => s.id === solicitudId)
      const urlsExistentes = solicitud?.urls_documentos || []
      const nuevasUrls = [...urlsExistentes.filter((u: string) => u !== (solicitud?.orden_fabricacion_url || null)), publicUrl]

      const { error: updateError } = await supabase
        .from("solicitudes")
        .update({ urls_documentos: nuevasUrls })
        .eq("id", solicitudId)

      if (updateError) throw updateError

      setSolicitudes((prev) =>
        prev.map((s: Solicitud) =>
          s.id === solicitudId ? { ...s, urls_documentos: nuevasUrls } : s
        )
      )

      setItemsEstadoCuenta((prev) => ({
        ...prev,
        [client!.id]: (prev[client!.id] || []).map((item) =>
          item.solicitudId === solicitudId ? { ...item, facturaUrl: publicUrl } : item
        ),
      ))"""

new_upload = """  const handleSubirFactura = async (solicitudId: number) => {
    const file = facturaDocs[solicitudId]
    if (!file) return

    setUploadingFactura((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `facturas/${solicitudId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName)

      setFacturasPorSolicitud((prev) => ({ ...prev, [solicitudId]: publicUrl }))

      const { error: updateError } = await supabase
        .from("solicitudes")
        .update({ urls_documentos: null, factura_url: publicUrl })
        .eq("id", solicitudId)

      if (updateError) throw updateError

      setSolicitudes((prev) =>
        prev.map((s: Solicitud) =>
          s.id === solicitudId ? { ...s, urls_documentos: null, factura_url: publicUrl } : s
        )
      )

      setItemsEstadoCuenta((prev) => ({
        ...prev,
        [client!.id]: (prev[client!.id] || []).map((item) =>
          item.solicitudId === solicitudId ? { ...item, facturaUrl: publicUrl } : item
        ),
      ))"""

content = content.replace(old_upload, new_upload)

# 3. Modificar loadEstadoCuenta para usar el nuevo campo
old_load = """      const items = solicitudes.flatMap((solicitud: any) => {
        const servicios = serviciosPorSolicitud.get(solicitud.id) || []
        const urlPdf = solicitud.urls_documentos?.[0] || null
        const facturaUrl = solicitud.urls_documentos?.[1] || null"""

new_load = """      const items = solicitudes.flatMap((solicitud: any) => {
        const servicios = serviciosPorSolicitud.get(solicitud.id) || []
        const urlPdf = solicitud.urls_documentos?.[0] || null
        const facturaUrl = solicitud.factura_url || null"""

content = content.replace(old_load, new_load)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cambios aplicados correctamente")