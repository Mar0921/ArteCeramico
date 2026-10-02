import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { enviarEmail, emailHabilitado, cuerpoListoEnvio } from "@/lib/email"

export const runtime = "nodejs"

const TIPO = "listo_envio"
const LOTE = 50

/**
 * Envía por correo los avisos "Listo para envío" que el trigger de base de datos
 * registra en la tabla notificaciones.
 *
 * La notificación del portal la crea el trigger (así existe aunque nadie llame a
 * esta ruta); aquí solo se materializa el correo. Es idempotente: cada aviso se
 * marca con email_enviado = true, así que se puede llamar tras cada guardado sin
 * enviar correos duplicados.
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json(
        { message: "Configuración de Supabase incompleta." },
        { status: 500 }
      )
    }

    // Solo administradores pueden disparar el envío de correos.
    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")

    if (!token) {
      return NextResponse.json(
        { message: "No autenticado." },
        { status: 401 }
      )
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { message: "Sesión inválida o vencida." },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("activo", true)
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { message: "No tienes permisos para enviar notificaciones." },
        { status: 403 }
      )
    }

    if (!emailHabilitado()) {
      // La notificación del portal ya existe; solo falta el correo.
      return NextResponse.json({
        enviado: 0,
        omitidos: 0,
        fallidos: 0,
        correoDeshabilitado: true,
        mensaje: "Configura RESEND_API_KEY para enviar los correos.",
      })
    }

    const { data: pendientes, error: pendientesError } = await supabase
      .from("notificaciones")
      .select("id, cliente_id, solicitud_id, created_at")
      .eq("tipo", TIPO)
      .eq("email_enviado", false)
      .order("created_at", { ascending: true })
      .limit(LOTE)

    if (pendientesError) {
      console.error("Error leyendo notificaciones pendientes:", pendientesError)
      return NextResponse.json(
        { message: "Error al leer las notificaciones pendientes.", details: pendientesError.message },
        { status: 500 }
      )
    }

    if (!pendientes || pendientes.length === 0) {
      return NextResponse.json({ enviado: 0, omitidos: 0, fallidos: 0 })
    }

    const solicitudIds = [...new Set(pendientes.map((n: any) => n.solicitud_id).filter(Boolean))]
    const clienteIds = [...new Set(pendientes.map((n: any) => n.cliente_id).filter(Boolean))]

    const { data: solicitudes } = await supabase
      .from("solicitudes")
      .select("id, servicio, codigo_trazabilidad, fecha_entrega, paciente, odontologo")
      .in("id", solicitudIds)

    const { data: clientes } = await supabase
      .from("clientes")
      .select("id, nombre, correo")
      .in("id", clienteIds)

    const solicitudesMap = new Map<number, any>((solicitudes || []).map((s: any) => [s.id, s]))
    const clientesMap = new Map<number, any>((clientes || []).map((c: any) => [c.id, c]))

    const origen = new URL(request.url).origin
    const resultados: { id: number; enviado: boolean; omitido?: boolean; error?: string }[] = []

    for (const notificacion of pendientes) {
      const solicitud = solicitudesMap.get(notificacion.solicitud_id)
      const cliente = clientesMap.get(notificacion.cliente_id)

      if (!solicitud || !cliente) {
        resultados.push({
          id: notificacion.id,
          enviado: false,
          error: "No se encontró la solicitud o el cliente.",
        })
        continue
      }

      if (!cliente.correo) {
        resultados.push({
          id: notificacion.id,
          enviado: false,
          omitido: true,
          error: "El cliente no tiene correo registrado.",
        })
        continue
      }

      const { asunto, html, text } = cuerpoListoEnvio({
        nombreCliente: solicitud.paciente || cliente.nombre || "",
        servicio: solicitud.servicio || "",
        codigoTrazabilidad: solicitud.codigo_trazabilidad || null,
        fechaEntrega: solicitud.fecha_entrega || null,
        urlPortal: `${origen}/page_clientes`,
      })

      const resultado = await enviarEmail({ to: cliente.correo, subject: asunto, html, text })

      resultados.push({ id: notificacion.id, ...resultado })
    }

    // Solo se marcan como enviados los correos que realmente salieron, para que
    // un fallo puntual de Resend pueda reintentarse en la siguiente llamada.
    const enviadosIds = resultados.filter((r) => r.enviado).map((r) => r.id)

    if (enviadosIds.length > 0) {
      const { error: marcarError } = await supabase
        .from("notificaciones")
        .update({ email_enviado: true, email_enviado_at: new Date().toISOString() })
        .in("id", enviadosIds)

      if (marcarError) {
        console.error("Error marcando notificaciones como enviadas:", marcarError)
      }
    }

    const fallidos = resultados.filter((r) => !r.enviado && !r.omitido)
    const omitidos = resultados.filter((r) => r.omitido)

    for (const fallo of fallidos) {
      console.error(`Fallo al enviar correo de la notificación ${fallo.id}:`, fallo.error)
    }

    return NextResponse.json({
      enviado: enviadosIds.length,
      omitidos: omitidos.length,
      fallidos: fallidos.length,
    })
  } catch (error) {
    console.error("Error inesperado en POST /api/notificaciones/enviar-pendientes:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
