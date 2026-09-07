import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: solicitudes, error } = await supabase
      .from("solicitudes")
      .select("id, estado, created_at, cliente_id")
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("Error obteniendo solicitudes para dashboard:", error)
      return NextResponse.json(
        { message: "Error al obtener estadísticas.", details: error.message },
        { status: 500 }
      )
    }

    const uniqueClientes = new Set((solicitudes || []).map((s: any) => s.cliente_id).filter(Boolean)).size
    const totalSolicitudes = (solicitudes || []).length
    const trabajosCompletados = (solicitudes || []).filter((s: any) => s.estado === "completado").length

    const clienteIds = [...new Set((solicitudes || []).map((s: any) => s.cliente_id).filter(Boolean))]
    const clientesMap = new Map<number, string>()
    if (clienteIds.length > 0) {
      const { data: clientes, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre")
        .in("id", clienteIds)

      if (!clientesError && clientes) {
        clientes.forEach((c: any) => clientesMap.set(c.id, c.nombre))
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const ingresosActual = (solicitudes || [])
      .filter((s: any) => new Date(s.created_at) >= startOfMonth)
      .reduce((acc: number, s: any) => acc + (s.precio || 0), 0)

    const ingresosAnterior = (solicitudes || [])
      .filter((s: any) => {
        const fecha = new Date(s.created_at)
        return fecha >= startOfPrevMonth && fecha <= endOfPrevMonth
      })
      .reduce((acc: number, s: any) => acc + (s.precio || 0), 0)

    const estadoCounts = {
      pendiente: 0,
      en_proceso: 0,
      aprobado: 0,
      completado: 0,
      cancelado: 0,
    }
    ;(solicitudes || []).forEach((s: any) => {
      if (estadoCounts.hasOwnProperty(s.estado)) {
        estadoCounts[s.estado as keyof typeof estadoCounts]++
      }
    })

    const meses: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString("es-CO", {
        month: "short",
        year: "2-digit",
      })
      meses[key] = 0
    }
    ;(solicitudes || []).forEach((s: any) => {
      const d = new Date(s.created_at)
      const key = d.toLocaleDateString("es-CO", {
        month: "short",
        year: "2-digit",
      })
      if (meses.hasOwnProperty(key)) {
        meses[key]++
      }
    })

    return NextResponse.json({
      data: {
        totalClientes: uniqueClientes,
        totalSolicitudes,
        trabajosCompletados,
        ingresosDelMes: ingresosActual,
        ingresosMesAnterior: ingresosAnterior,
        estadoPedidos: [
          { label: "Pendientes", value: estadoCounts.pendiente, color: "bg-amber-500" },
          { label: "En Proceso", value: estadoCounts.en_proceso, color: "bg-blue-500" },
          { label: "Aprobados", value: estadoCounts.aprobado, color: "bg-green-500" },
          { label: "Completados", value: estadoCounts.completado, color: "bg-primary" },
        ],
        actividadMensual: Object.entries(meses).map(([month, count]) => ({ month, count })),
        recentOrders: (solicitudes || []).slice(0, 5).map((item: any) => ({
          id: item.id,
          cliente_nombre: clientesMap.get(item.cliente_id) || "Sin cliente",
          servicio: item.servicio || "Servicio",
          estado: item.estado || "pendiente",
          created_at: item.created_at,
          precio: item.precio || 0,
        })),
      },
    })
  } catch (error) {
    console.error("Error inesperado en dashboard-stats:", error)
    return NextResponse.json(
      { message: "Error interno del servidor.", details: "Error inesperado en dashboard-stats" },
      { status: 500 }
    )
  }
}
