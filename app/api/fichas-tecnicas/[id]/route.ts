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

    const { data: solicitud, error: fetchError } = await supabase
      .from("solicitudes")
      .select("id, fichas_tecnicas")
      .eq("id", body.solicitud_id)
      .single()

    if (fetchError || !solicitud) {
      console.error("Error buscando solicitud:", fetchError)
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const fichas = ((solicitud.fichas_tecnicas as string[]) || []).map((item) => {
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    }).filter(Boolean)

    const index = fichas.findIndex((f) => f.id === fichaId)
    if (index === -1) {
      return NextResponse.json(
        { message: "Ficha tecnica no encontrada." },
        { status: 404 }
      )
    }

    const updated = { ...fichas[index], ...body }
    fichas[index] = updated

    const serializadas = fichas.map((f) => JSON.stringify(f))

    const { error } = await supabase
      .from("solicitudes")
      .update({ fichas_tecnicas: serializadas })
      .eq("id", solicitud.id)

    if (error) {
      console.error("Error actualizando ficha tecnica:", error)
      return NextResponse.json(
        { message: "Error al actualizar la ficha tecnica.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updated })
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

    const body = await request.json().catch(() => ({}))
    const solicitudId = body.solicitud_id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: solicitud, error: fetchError } = await supabase
      .from("solicitudes")
      .select("id, fichas_tecnicas")
      .eq("id", solicitudId)
      .single()

    if (fetchError || !solicitud) {
      console.error("Error buscando solicitud:", fetchError)
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const fichas = ((solicitud.fichas_tecnicas as string[]) || []).map((item) => {
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    }).filter(Boolean)

    const filtradas = fichas.filter((f) => f.id !== fichaId)
    const serializadas = filtradas.map((f) => JSON.stringify(f))

    const { error } = await supabase
      .from("solicitudes")
      .update({ fichas_tecnicas: serializadas })
      .eq("id", solicitud.id)

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
