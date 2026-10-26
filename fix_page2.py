with open('app/dashboard/clientes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the lines one by one
content = content.replace(
    '      const solicitud = solicitudes.find((s) => s.id === solicitudId)\n      const urlsExistentes = solicitud?.urls_documentos || []\n      const nuevasUrls = [...urlsExistentes.filter((u: string) => u !== (solicitud?.orden_fabricacion_url || null)), publicUrl]\n\n      const { error: updateError } = await supabase\n        .from("solicitudes")\n        .update({ urls_documentos: nuevasUrls })\n        .eq("id", solicitudId)\n\n      if (updateError) throw updateError\n\n      setSolicitudes((prev) =>\n        prev.map((s: Solicitud) =>\n          s.id === solicitudId ? { ...s, urls_documentos: nuevasUrls } : s\n        )\n      )',
    '      const { error: updateError } = await supabase\n        .from("solicitudes")\n        .update({ urls_documentos: null, factura_url: publicUrl })\n        .eq("id", solicitudId)\n\n      if (updateError) throw updateError\n\n      setSolicitudes((prev) =>\n        prev.map((s: Solicitud) =>\n          s.id === solicitudId ? { ...s, urls_documentos: null, factura_url: publicUrl } : s\n        )\n      )'
)

with open('app/dashboard/clientes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Hecho")