import { NextResponse } from "next/server"
import { autenticarInterno } from "@/lib/autorizacion"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productoId = parseInt(id)
    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "ID de producto inválido." },
        { status: 400 }
      )
    }

    const auth = await autenticarInterno(request)
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status })
    }

    const body = await request.json()
    const updates: Record<string, any> = {}

    if (body.codigo !== undefined) updates.codigo = String(body.codigo).trim()
    if (body.nombre !== undefined) updates.nombre = String(body.nombre).trim()
    if (body.codigo_categoria !== undefined) {
      updates.codigo_categoria = body.codigo_categoria
        ? String(body.codigo_categoria).trim()
        : null
    }
    if (body.categoria !== undefined) {
      updates.categoria = body.categoria ? String(body.categoria).trim() : null
    }
    if (body.iva !== undefined) {
      updates.iva =
        body.iva === null || body.iva === "" ? 0 : Number(body.iva)
    }
    if (body.activo !== undefined) updates.activo = Boolean(body.activo)
    if (body.fases_fabricacion !== undefined) {
      updates.fases_fabricacion = Array.isArray(body.fases_fabricacion)
        ? JSON.stringify(body.fases_fabricacion.map(String).map((f: string) => f.trim()).filter(Boolean))
        : null
    }
    updates.updated_at = new Date().toISOString()

    const { data, error } = await auth.supabase
      .from("ProductosLab")
      .update(updates)
      .eq("id", productoId)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Ya existe un producto con ese código." },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al actualizar el producto.", details: error?.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productoId = parseInt(id)
    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "ID de producto inválido." },
        { status: 400 }
      )
    }

    const auth = await autenticarInterno(request)
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status })
    }

    const { error } = await auth.supabase
      .from("ProductosLab")
      .delete()
      .eq("id", productoId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al eliminar el producto.", details: error?.message },
      { status: 500 }
    )
  }
}
