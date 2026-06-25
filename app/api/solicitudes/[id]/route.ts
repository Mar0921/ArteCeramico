import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const allowedFields = [
      "estado",
      "observaciones",
      "fecha_elaboracion",
      "fecha_entrega",
      "odontologo",
      "cc_odontologo",
      "paciente",
      "cc_paciente",
      "color",
      "guia",
      "prueba",
      "terminado",
      "chimenea",
      "caja",
      "codigo_trazabilidad",
      "dientes_trabajados",
      "piezas_enviadas",
      "tipos_trabajo",
      "materiales",
      "estado_pago",
      "comprobante_pago",
      "fecha_pago",
      "observaciones_pago",
      "declaracion_conformidad",
      "guia_fabricacion",
      "manual_uso",
    ]

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
      .from("solicitudes")
      .update(updates)
      .eq("id", solicitudId)
      .select("id")
      .single()

    if (error) {
      console.error("Error actualizando solicitud:", error)
      return NextResponse.json(
        { message: "Error al actualizar la solicitud.", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error inesperado en PATCH /api/solicitudes/[id]:", error)
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

const { data: solicitud, error: solicitudError } = await supabase
        .from("solicitudes")
        .select("id, servicio, observaciones, estado, created_at, updated_at, cliente_id, urls_documentos, fecha_elaboracion, fecha_entrega, historia_clinica, odontologo, cc_odontologo, odontologo_direccion, odontologo_firma, paciente, cc_paciente, color, guia, prueba, terminado, chimenea, caja, codigo_trazabilidad, dientes_trabajados, piezas_enviadas, declaracion_conformidad, guia_fabricacion, manual_uso")
      .eq("id", solicitudId)
      .single()

    if (solicitudError || !solicitud) {
      return NextResponse.json(
        { message: "Solicitud no encontrada." },
        { status: 404 }
      )
    }

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("id", solicitud.cliente_id)
      .single()

    const { data: servicios, error: serviciosError } = await supabase
      .from("servicios")
      .select("id, nombre, descripcion, precio, cantidad, created_at, tipo_trabajo, material, dientes, piezas_enviadas, declaracion_conformidad, guia_fabricacion, manual_uso")
      .eq("solicitud_id", solicitudId)

    return NextResponse.json({
      data: {
        solicitud,
        cliente: cliente || null,
        servicios: servicios || [],
      },
    })
  } catch (error) {
    console.error("Error inesperado en GET /api/solicitudes/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
