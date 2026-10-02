import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

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
