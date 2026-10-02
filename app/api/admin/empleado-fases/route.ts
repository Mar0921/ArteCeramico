import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

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
    const { data, error } = await supabaseAdmin
      .from("empleado_fases")
      .select("empleado_id, fase_template_id")

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empleado_id, fase_template_id } = body

    if (!empleado_id || !fase_template_id) {
      return NextResponse.json({ error: "empleado_id y fase_template_id son requeridos" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("empleado_fases")
      .upsert(
        { empleado_id, fase_template_id },
        { onConflict: "empleado_id,fase_template_id" }
      )
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { empleado_id, fase_template_id } = body

    if (!empleado_id || !fase_template_id) {
      return NextResponse.json({ error: "empleado_id y fase_template_id son requeridos" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("empleado_fases")
      .delete()
      .eq("empleado_id", empleado_id)
      .eq("fase_template_id", fase_template_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}