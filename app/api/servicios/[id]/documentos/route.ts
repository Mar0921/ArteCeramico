import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

type TipoDocumentoServicio =
  | "declaracion_conformidad"
  | "guia_fabricacion"
  | "manual_uso"

const TIPOS_VALIDOS: TipoDocumentoServicio[] = [
  "declaracion_conformidad",
  "guia_fabricacion",
  "manual_uso",
]

async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  file: File,
  servicioId: number
) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin"
  const nombreUnico = `servicios/${servicioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(nombreUnico, fileBuffer, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    })

  if (uploadError) {
    throw new Error(
      `Error al subir el archivo ${file.name}: ${uploadError.message}`
    )
  }

  const { data } = supabase.storage.from("documentos").getPublicUrl(nombreUnico)
  return data.publicUrl
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const servicioId = parseInt(id)
    if (isNaN(servicioId)) {
      return NextResponse.json(
        { message: "ID de servicio inválido." },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const tipo = String(formData.get("tipo") || "").trim() as TipoDocumentoServicio
    const archivo = formData.get("archivo")

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { message: "Tipo de documento inválido." },
        { status: 400 }
      )
    }

    if (!archivo || !(archivo instanceof File)) {
      return NextResponse.json(
        { message: "Debes enviar un archivo." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const url = await uploadFile(supabase, archivo, servicioId)

    const { data, error } = await supabase
      .from("servicios")
      .update({ [tipo]: url })
      .eq("id", servicioId)
      .select("id, nombre, descripcion, precio, cantidad, created_at, tipo_trabajo, material, dientes, piezas_enviadas, declaracion_conformidad, guia_fabricacion, manual_uso")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { message: error?.message || "Error al guardar el documento." },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("Error en POST /api/servicios/[id]/documentos:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const servicioId = parseInt(id)
    if (isNaN(servicioId)) {
      return NextResponse.json(
        { message: "ID de servicio inválido." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from("servicios")
      .select("id, nombre, descripcion, precio, cantidad, created_at, tipo_trabajo, material, dientes, piezas_enviadas, declaracion_conformidad, guia_fabricacion, manual_uso")
      .eq("id", servicioId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { message: "Servicio no encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error en GET /api/servicios/[id]/documentos:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
