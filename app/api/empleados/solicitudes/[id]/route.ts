import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      .select(`id, servicio, observaciones, estado, created_at, updated_at, cliente_id, urls_documentos, fecha_elaboracion, fecha_entrega, historia_clinica, historia_clinica_paciente, odontologo, cc_odontologo, odontologo_tarjeta_profesional, odontologo_registro_medico, odontologo_correo, odontologo_telefono, odontologo_direccion, paciente, cc_paciente, color, guia, prueba, terminado, chimenea, caja, codigo_trazabilidad, dientes_trabajados, piezas_enviadas, tipos_trabajo, materiales, fase, orden_fabricacion_url, orden_materiales, orden_fases, dibujo_odontologo`)
      .eq("id", solicitudId)
      .single()

    if (solicitudError || !solicitud) {
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("id", solicitud.cliente_id)
      .single()

    const { data: servicios, error: serviciosError } = await supabaseAdmin
      .from("servicios")
      .select(
        "id, nombre, descripcion, cantidad, tipo_trabajo, material, dientes, piezas_enviadas, created_at"
      )
      .eq("solicitud_id", solicitudId)

    const { data: dientesData, error: dientesError } = await supabaseAdmin
      .from("dientes")
      .select("solicitud_id, numero, servicio, estado")
      .eq("solicitud_id", solicitudId)
      .order("numero", { ascending: true })

    if (serviciosError) throw serviciosError
    if (dientesError) throw dientesError

    const dientesDetallados = (dientesData || []).map((d: any) => ({
      numero: Number(d.numero),
      servicio: String(d.servicio || ""),
      estado: String(d.estado || "normal"),
    }))

    return NextResponse.json({
      data: {
        solicitud: { ...solicitud, dientes_detallados: dientesDetallados },
        cliente: cliente || null,
        servicios: servicios || [],
      },
    })
  } catch (error) {
    console.error("Error inesperado en /api/empleados/solicitudes/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
