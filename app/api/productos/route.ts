import { NextResponse } from "next/server"
import { autenticarInterno } from "@/lib/autorizacion"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = await autenticarInterno(request)
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  try {
    const { data, error } = await auth.supabase
      .from("ProductosLab")
      .select("*")
      .order("categoria", { ascending: true })
      .order("codigo", { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error al cargar los productos.", details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await autenticarInterno(request)
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { codigo, nombre, codigo_categoria, categoria, iva, activo, fases_fabricacion } = body

    if (!codigo || !nombre) {
      return NextResponse.json(
        { message: "El código y el nombre son obligatorios." },
        { status: 400 }
      )
    }

    const { data, error } = await auth.supabase
      .from("ProductosLab")
      .insert({
        codigo: String(codigo).trim(),
        nombre: String(nombre).trim(),
        codigo_categoria: codigo_categoria ? String(codigo_categoria).trim() : null,
        categoria: categoria ? String(categoria).trim() : null,
        iva: iva === null || iva === undefined || iva === "" ? 0 : Number(iva),
        activo: activo !== false,
        fases_fabricacion: Array.isArray(fases_fabricacion)
          ? JSON.stringify(fases_fabricacion.map(String).map((f) => f.trim()).filter(Boolean))
          : null,
      })
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
      { message: "Error al crear el producto.", details: error?.message },
      { status: 500 }
    )
  }
}
