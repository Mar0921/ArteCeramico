import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function PATCH(
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

    const body = await request.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const allowedFields = ["nombre", "descripcion", "precio", "cantidad", "tipo_trabajo", "material", "dientes", "piezas_enviadas"]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No hay campos para actualizar." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("servicios")
      .update(updates)
      .eq("id", servicioId)
      .select("id")
      .single()

    if (error) {
      console.error("Error actualizando servicio:", error)
      return NextResponse.json(
        { message: "Error al actualizar el servicio.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error inesperado en PATCH /api/servicios/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
