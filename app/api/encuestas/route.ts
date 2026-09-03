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
      .from("encuestas_postadaptacion")
      .select("*")
      .eq("solicitud_id", parseInt(solicitudId))
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo encuestas:", error)
      return NextResponse.json(
        { message: "Error al obtener encuestas.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error inesperado en GET /api/encuestas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { solicitud_id, email, paciente, evaluaciones, opinion, nombre_profesional, fecha_entrega } = body

    if (!solicitud_id || !email || !paciente || !evaluaciones || !opinion || !nombre_profesional || !fecha_entrega) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("encuestas_postadaptacion")
      .insert({
        solicitud_id,
        email,
        paciente,
        evaluaciones,
        opinion,
        nombre_profesional,
        fecha_entrega,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creando encuesta:", error)
      return NextResponse.json(
        { message: "Error al crear la encuesta.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado en POST /api/encuestas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
