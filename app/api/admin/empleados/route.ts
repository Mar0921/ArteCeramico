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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, password, rol, activo } = body

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    const { error: insertError } = await supabaseAdmin.from("empleados").insert([
      {
        user_id: authData.user.id,
        nombre,
        email,
        rol: rol || "empleado",
        activo: activo !== false,
      },
    ])

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: authData.user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const body = await request.json()
    const { nombre, email, password, rol, activo } = body

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const { data: empleado, error: fetchError } = await supabaseAdmin
      .from("empleados")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    const updates: any = {}
    if (nombre) updates.nombre = nombre
    if (email) updates.email = email
    if (rol) updates.rol = rol
    if (activo !== undefined) updates.activo = activo

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("empleados")
        .update(updates)
        .eq("id", id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    }

    if (password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        empleado.user_id,
        { password }
      )
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const { data: empleado, error: fetchError } = await supabaseAdmin
      .from("empleados")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    const { error: deleteError } = await supabaseAdmin.from("empleados").delete().eq("id", id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(empleado.user_id)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}