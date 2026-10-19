import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { construirDetalleDientes } from "@/lib/dientes"

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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
       "fase",
      "orden_fabricacion_url",
         "orden_materiales",
         "orden_fases",
         "historia_clinica_paciente",
         "tipo_impresion",
       ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    // Si se define tipo_impresion, (re)genera orden_fases a partir de los
    // servicios/productos de la solicitud para que solo salgan las fases
    // relacionadas.
    if ("tipo_impresion" in body) {
      try {
        const { data: servs } = await supabase
          .from("servicios")
          .select("nombre")
          .eq("solicitud_id", solicitudId)
        const tipo = String(body.tipo_impresion || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const sufijo = /analog/.test(tipo) ? "ANLG" : /intra/.test(tipo) ? "INT" : ""
        const { data: prods } = await supabase
          .from("ProductosLab")
          .select("nombre, fases_fabricacion")
        const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim()
        const byName = new Map<string, string[]>()
        for (const row of prods || []) {
          let fases: string[] = []
          try {
            const parsed = typeof row.fases_fabricacion === "string" ? JSON.parse(row.fases_fabricacion) : row.fases_fabricacion
            if (Array.isArray(parsed)) fases = parsed.map(String).map((f: string) => f.trim()).filter(Boolean)
          } catch { fases = [] }
          byName.set(norm(String(row.nombre)), fases)
        }
        const nombresBase = Array.from(new Set((servs || []).map((s: any) => String(s.nombre || "").trim()).filter(Boolean)))
        const nombres = nombresBase.map((n) => {
          const exact = byName.get(norm(n))
          if (exact && exact.length > 0) return n
          return sufijo ? `${n} ${sufijo}` : n
        })
        if (nombres.length > 0) {
          const allProds = (prods || []).map((r: any) => ({ key: norm(String(r.nombre)), fases: byName.get(norm(String(r.nombre))) || [], base: norm(String(r.nombre)).replace(/\s+(int|anlg)$/i, "") }))
          const ordenFases: any[] = []
          for (const n of nombres) {
            const nl = norm(n)
            const baseNl = nl.replace(/\s+(int|anlg)$/i, "")
            let fases = byName.get(nl) || []
            if (fases.length === 0) fases = byName.get(norm(`${n} ${sufijo}`)) || []
            if (fases.length === 0) {
              const match = allProds.find((p) => p.base === baseNl || p.key === baseNl || p.key.includes(baseNl) || baseNl.includes(p.base))
              if (match) fases = match.fases
            }
            for (const f of fases) {
              ordenFases.push({ tipo: f, estado: "pendiente", realizada_por: "", fecha_finalizacion: "", fecha_prueba: "", producto: n })
            }
          }
          if (ordenFases.length > 0) updates.orden_fases = ordenFases
        }
      } catch (e) {
        console.error("Error regenerando orden_fases:", e)
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

    return NextResponse.json({ success: true, data, orden_fases: updates.orden_fases ?? null })
  } catch (error) {
    console.error("Error inesperado en PATCH /api/solicitudes/[id]:", error)
    return NextResponse.json(
      { message: "Error interno del servidor.", details: error instanceof Error ? error.message : String(error) },
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

const { data: solicitud, error: solicitudError } = await supabase
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

    const { data: cliente } = await supabase
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("id", solicitud.cliente_id)
      .maybeSingle()

    const { data: servicios, error: serviciosError } = await supabase
      .from("servicios")
      .select("*")
      .eq("solicitud_id", solicitudId)
      .order("id", { ascending: true })

    if (serviciosError) throw serviciosError

    const { data: dientesData, error: dientesError } = await supabase
      .from("dientes")
      .select("solicitud_id, numero, servicio, estado")
      .eq("solicitud_id", solicitudId)
      .order("numero", { ascending: true })

    // Tabla opcional: si la migración 20250715_dientes.sql no está aplicada, el
    // detalle se reconstruye desde dientes_trabajados y los servicios.
    const dientesNoDisponible = dientesError?.code === "PGRST205"
    if (dientesError && !dientesNoDisponible) throw dientesError

    const dientesDetallados = construirDetalleDientes({
      tokens: solicitud.dientes_trabajados,
      filasDientes: dientesData || null,
      servicios: servicios || null,
    })

    const serviciosDetalle = (servicios || []).map((serv: any) => ({
      id: serv.id,
      nombre: serv.nombre,
      descripcion: serv.descripcion,
      precio: Number(serv.precio || 0),
      cantidad: serv.cantidad || 1,
      tipo_trabajo: serv.tipo_trabajo || null,
      material: serv.material || null,
      dientes: serv.dientes || null,
      piezas_enviadas: serv.piezas_enviadas || null,
    }))

    const solicitudFormateada = {
      ...solicitud,
      dientes_detallados: dientesDetallados,
      servicios_detalle: serviciosDetalle,
    }

    return NextResponse.json({
      data: {
        solicitud: solicitudFormateada,
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
