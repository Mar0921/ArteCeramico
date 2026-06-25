import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const url = new URL(request.url)
  const pathParts = url.pathname.split("/")
  const solicitudId = parseInt(pathParts[pathParts.indexOf("solicitudes") + 1])

  if (isNaN(solicitudId)) {
    return NextResponse.json({ error: "ID de solicitud inválido" }, { status: 400 })
  }

  const formData = await request.formData()
  const archivo = formData.get("archivo")

  if (!archivo || !(archivo instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
  }

  if (archivo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo ${archivo.name} supera el límite de 10 MB.` }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Error de configuración del servidor." }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const extension = archivo.name.split(".").pop()?.toLowerCase() || "bin"
  const nombreUnico = `comprobante-pago-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  
  const arrayBuffer = await archivo.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(nombreUnico, fileBuffer, {
      upsert: false,
      contentType: archivo.type || "application/octet-stream",
    })

  if (uploadError) {
    console.error("Error upload:", uploadError)
    return NextResponse.json(
      { error: `Error al guardar el archivo ${archivo.name}.`, details: uploadError.message },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage
    .from("documentos")
    .getPublicUrl(nombreUnico)

  const { error: updateError } = await supabase
    .from("solicitudes")
    .update({ comprobante_pago: urlData.publicUrl, estado_pago: "pendiente_validacion" })
    .eq("id", solicitudId)

  if (updateError) {
    console.error("Error updating:", updateError)
    return NextResponse.json({ error: "Error al actualizar solicitud." }, { status: 500 })
  }

  return NextResponse.json({ url: urlData.publicUrl })
}