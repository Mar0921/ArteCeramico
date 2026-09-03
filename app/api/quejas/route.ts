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
      .from("buzon_quejas")
      .select("*")
      .eq("solicitud_id", parseInt(solicitudId))
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo quejas:", error)
      return NextResponse.json(
        { message: "Error al obtener quejas.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error inesperado en GET /api/quejas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { solicitud_id, email, tipo, descripcion, notificacion, nombre_completo, correo_electronico, comentarios_adicionales } = body

    if (!solicitud_id || !email || !tipo || !descripcion || !nombre_completo || !correo_electronico) {
      return NextResponse.json(
        { message: "Campos requeridos faltantes." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("buzon_quejas")
      .insert({
        solicitud_id,
        email,
        tipo,
        descripcion,
        notificacion: notificacion || [],
        nombre_completo,
        correo_electronico,
        comentarios_adicionales: comentarios_adicionales || "",
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creando queja:", error)
      return NextResponse.json(
        { message: "Error al crear la queja.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado en POST /api/quejas:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
