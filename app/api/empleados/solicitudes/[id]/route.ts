import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { construirDetalleDientes } from "@/lib/dientes"

export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solicitudId = parseInt(id)
    if (isNaN(solicitudId)) {
      return NextResponse.json(
        { message: "ID de solicitud inválido." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { orden_fases, fase } = body

    const updates: Record<string, unknown> = {}
    if (orden_fases !== undefined) updates.orden_fases = orden_fases
    if (fase !== undefined) updates.fase = fase

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No hay campos para actualizar." },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("solicitudes")
      .update(updates)
      .eq("id", solicitudId)
      .select("id")
      .single()

    if (error) {
      return NextResponse.json(
        { message: "Error al actualizar la solicitud.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error inesperado en PATCH /api/empleados/solicitudes/[id]:", error)
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
    const solicitudId = parseInt(id)
    if (isNaN(solicitudId)) {
      return NextResponse.json(
        { message: "ID de solicitud inválido." },
        { status: 400 }
      )
    }

    const { data: solicitud, error: solicitudError } = await supabaseAdmin
      .from("solicitudes")
      .select("*")
      .eq("id", solicitudId)
      .single()

    if (solicitudError || !solicitud) {
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const { data: cliente } = await supabaseAdmin
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("id", solicitud.cliente_id)
      .maybeSingle()

    const { data: servicios, error: serviciosError } = await supabaseAdmin
      .from("servicios")
      .select("*")
      .eq("solicitud_id", solicitudId)
      .order("id", { ascending: true })

    if (serviciosError) throw serviciosError

    const { data: dientesData, error: dientesError } = await supabaseAdmin
      .from("dientes")
      .select("solicitud_id, numero, servicio, estado")
      .eq("solicitud_id", solicitudId)
      .order("numero", { ascending: true })

    // `dientes` es una tabla opcional: si la migración 20250715_dientes.sql no
    // está aplicada, el detalle se reconstruye igual desde
    // `dientes_trabajados` y los servicios. Cualquier otro error sí se propaga.
    const dientesNoDisponible = dientesError?.code === "PGRST205"
    if (dientesError && !dientesNoDisponible) throw dientesError
    if (dientesNoDisponible) {
      console.warn(
        "Tabla `dientes` no disponible. Aplique supabase/migrations/20250715_dientes.sql"
      )
    }

    const dientesDetallados = construirDetalleDientes({
      tokens: solicitud.dientes_trabajados,
      filasDientes: dientesData || null,
      servicios: servicios || null,
    })

    return NextResponse.json({
      data: {
        solicitud: { ...solicitud, dientes_detallados: dientesDetallados },
        cliente: cliente || null,
        servicios: servicios || [],
      },
    })
  } catch (error) {
    console.error("Error inesperado en /api/empleados/solicitudes/[id]:", error)
    const detalle =
      error && typeof (error as any).message === "string"
        ? (error as any).message
        : undefined
    return NextResponse.json(
      { message: "Error interno del servidor.", details: detalle },
      { status: 500 }
    )
  }
}
