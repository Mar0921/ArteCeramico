import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fichaId = parseInt(id)
    if (isNaN(fichaId)) {
      return NextResponse.json(
        { message: "ID de ficha tecnica invalido." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updates: Record<string, unknown> = {}
    const allowedFields = ["tipo", "nombre", "fecha", "secciones"]
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
      .from("fichas_tecnicas")
      .update(updates)
      .eq("id", fichaId)
      .select("*")
      .single()

    if (error) {
      console.error("Error actualizando ficha tecnica:", error)
      return NextResponse.json(
        { message: "Error al actualizar la ficha tecnica.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error inesperado en PATCH /api/fichas-tecnicas/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fichaId = parseInt(id)
    if (isNaN(fichaId)) {
      return NextResponse.json(
        { message: "ID de ficha tecnica invalido." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from("fichas_tecnicas")
      .delete()
      .eq("id", fichaId)

    if (error) {
      console.error("Error eliminando ficha tecnica:", error)
      return NextResponse.json(
        { message: "Error al eliminar la ficha tecnica.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error inesperado en DELETE /api/fichas-tecnicas/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
