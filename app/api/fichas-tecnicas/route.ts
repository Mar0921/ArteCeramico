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
      .from("solicitudes")
      .select("fichas_tecnicas")
      .eq("id", parseInt(solicitudId))
      .single()

    if (error) {
      console.error("Error obteniendo fichas tecnicas:", error)
      return NextResponse.json(
        { message: "Error al obtener fichas tecnicas.", details: error.message },
        { status: 500 }
      )
    }

    const fichas = ((data?.fichas_tecnicas as string[]) || []).map((item) => {
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    }).filter(Boolean)

    return NextResponse.json({ data: fichas })
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
    const { solicitud_id, tipo, nombre, fecha, url, secciones, dientes } = body

    if (!solicitud_id || !tipo || !nombre || !url) {
      return NextResponse.json(
        { message: "solicitud_id, tipo, nombre y url son requeridos." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ficha = {
      id: Date.now(),
      tipo,
      nombre,
      fecha: fecha || new Date().toISOString().split("T")[0],
      url,
      secciones: secciones || [],
      dientes: dientes || [],
    }

    const { data: current, error: fetchError } = await supabase
      .from("solicitudes")
      .select("fichas_tecnicas")
      .eq("id", solicitud_id)
      .single()

    if (fetchError || !current) {
      console.error("Error buscando solicitud:", fetchError)
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const serializadas = [...(current.fichas_tecnicas as string[] || []), JSON.stringify(ficha)]

    const { error } = await supabase
      .from("solicitudes")
      .update({ fichas_tecnicas: serializadas })
      .eq("id", solicitud_id)

    if (error) {
      console.error("Error creando ficha tecnica:", error)
      return NextResponse.json(
        { message: "Error al crear la ficha tecnica.", details: error.message, code: error.code, hint: error.hint },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: ficha }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado en POST /api/fichas-tecnicas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
