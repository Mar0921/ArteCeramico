import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const solicitudId = searchParams.get("solicitud_id")
    if (!solicitudId || isNaN(parseInt(solicitudId))) {
      return NextResponse.json(
        { message: "solicitud_id es requerido." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("fichas_tecnicas")
      .select("*")
      .eq("solicitud_id", parseInt(solicitudId))
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error obteniendo fichas tecnicas:", error)
      return NextResponse.json(
        { message: "Error al obtener fichas tecnicas.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error inesperado en GET /api/fichas-tecnicas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { solicitud_id, tipo, nombre, fecha, secciones } = body

    if (!solicitud_id || !tipo || !nombre) {
      return NextResponse.json(
        { message: "solicitud_id, tipo y nombre son requeridos." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("fichas_tecnicas")
      .insert({
        solicitud_id,
        tipo,
        nombre,
        fecha: fecha || new Date().toISOString().split("T")[0],
        secciones: secciones || [],
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creando ficha tecnica:", error)
      return NextResponse.json(
        { message: "Error al crear la ficha tecnica.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado en POST /api/fichas-tecnicas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
