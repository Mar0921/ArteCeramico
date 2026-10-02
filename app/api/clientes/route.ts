import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { autenticarInterno } from "@/lib/autorizacion"

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

export async function GET() {
  try {
    const [clientesRes, solicitudesRes] = await Promise.all([
      supabaseAdmin
        .from("clientes")
        .select("id, nombre, correo, telefono, clinica, tipo, documento, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("solicitudes").select("cliente_id"),
    ])

    if (clientesRes.error) throw clientesRes.error
    if (solicitudesRes.error) throw solicitudesRes.error

    const counts = new Map<number, number>()
    ;(solicitudesRes.data || []).forEach((row: { cliente_id: number }) => {
      if (row.cliente_id != null) {
        counts.set(row.cliente_id, (counts.get(row.cliente_id) || 0) + 1)
      }
    })

    const data = (clientesRes.data || []).map((cliente: any) => ({
      ...cliente,
      total_solicitudes: counts.get(cliente.id) || 0,
    }))

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}

/**
 * Alta de clientes por parte del personal interno.
 *
 * El cliente se crea sin `user_id`: hasta que esa persona se registre en el
 * portal no tendrá acceso propio, pero la solicitud queda asociada y el
 * administrador puede verla desde el dashboard.
 */
export async function POST(request: Request) {
  const interno = await autenticarInterno(request)

  if (!interno.ok) {
    return NextResponse.json({ error: interno.message }, { status: interno.status })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido." }, { status: 400 })
  }

  const nombre = String(body?.nombre || "").trim()
  const documento = String(body?.documento || "").trim()
  const correo = String(body?.correo || "").trim()
  const telefono = String(body?.telefono || "").trim()
  const clinica = String(body?.clinica || "").trim()
  const tipoDocumento = String(body?.tipodoc || "").trim()

  if (!nombre) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 })
  }

  if (!documento) {
    return NextResponse.json({ error: "El número de documento es obligatorio." }, { status: 400 })
  }

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return NextResponse.json({ error: "El correo no tiene un formato válido." }, { status: 400 })
  }

  // Evita duplicados: el mismo documento no puede registrarse dos veces, que es
  // el error más fácil de cometer al capturar datos de un odontólogo nuevo.
  const { data: existente, error: existenteError } = await supabaseAdmin
    .from("clientes")
    .select("id, nombre, clinica")
    .eq("documento", documento)
    .maybeSingle()

  if (existenteError) {
    return NextResponse.json(
      { error: existenteError.message || "Error al verificar el documento." },
      { status: 500 }
    )
  }

  if (existente) {
    return NextResponse.json(
      {
        error: `Ya existe un cliente con ese documento: ${existente.nombre}${
          existente.clinica ? ` (${existente.clinica})` : ""
        }.`,
        clienteExistente: existente,
      },
      { status: 409 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .insert({
      nombre,
      tipo: tipoDocumento,
      tipodoc: tipoDocumento,
      documento,
      correo,
      telefono,
      clinica,
    })
    .select("id, nombre, tipo, documento, correo, telefono, clinica")
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message || "No fue posible crear el cliente." },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}
