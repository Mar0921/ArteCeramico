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
    const [fasesRes, empleadosRes, asignacionesRes] = await Promise.all([
      supabaseAdmin
        .from("fases_template")
        .select("*")
        .order("orden", { ascending: true }),
      supabaseAdmin
        .from("empleados")
        .select("id, nombre, email, rol")
        .eq("activo", true)
        .order("nombre"),
      supabaseAdmin.from("empleado_fases").select("empleado_id, fase_template_id"),
    ])

    if (fasesRes.error) throw fasesRes.error
    if (empleadosRes.error) throw empleadosRes.error
    if (asignacionesRes.error) throw asignacionesRes.error

    return NextResponse.json({
      data: {
        fases: fasesRes.data || [],
        empleados: empleadosRes.data || [],
        empleadoFases: asignacionesRes.data || [],
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}
