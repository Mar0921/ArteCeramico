import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solicitudId = parseInt(id)
    const formData = await request.formData()

    const tipo = String(formData.get("tipo") || "").trim()
    const archivo = formData.get("archivo")

    console.log("Recibiendo documento:", {
      solicitudId,
      tipo,
      archivoNombre: archivo instanceof File ? archivo.name : "no-file"
    })

    if (!tipo || !archivo || !(archivo instanceof File)) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (tipo y archivo)" },
        { status: 400 }
      )
    }

    const tiposValidos = ["declaracion_conformidad", "guia_fabricacion", "manual_uso"]
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de documento no válido" },
        { status: 400 }
      )
    }

    if (archivo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `El archivo ${archivo.name} supera el límite de 10 MB` },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const extension = archivo.name.split(".").pop()?.toLowerCase() || "bin"
    const nombreUnico = `${tipo}_solicitud_${solicitudId}_${Date.now()}.${extension}`
    const rutaStorage = `solicitudes/${solicitudId}/documentos/${nombreUnico}`

    const arrayBuffer = await archivo.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(rutaStorage, fileBuffer, {
        upsert: true,
        contentType: archivo.type || "application/octet-stream",
      })

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError)
      return NextResponse.json(
        {
          error: "Error al guardar el archivo en el storage",
          details: uploadError.message
        },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from("documentos")
      .getPublicUrl(rutaStorage)

    const publicUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from("solicitudes")
      .update({ [tipo]: publicUrl })
      .eq("id", solicitudId)

    if (updateError) {
      console.error("ERROR ACTUALIZANDO SOLICITUD:", {
        message: updateError.message,
        details: updateError,
        solicitudId,
        tipo,
        publicUrl
      })
      return NextResponse.json(
        {
          error: "Error al actualizar la solicitud con la URL del documento",
          details: updateError.message
        },
        { status: 500 }
      )
    }

    const { data: solicitudActualizada } = await supabase
      .from("solicitudes")
      .select("id, servicio, declaracion_conformidad, guia_fabricacion, manual_uso")
      .eq("id", solicitudId)
      .single()

    console.log("Documento subido exitosamente a la solicitud:", publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      data: solicitudActualizada,
      message: "Documento subido correctamente"
    })

  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}
