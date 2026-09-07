"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
} from "lucide-react"

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-primary/10 text-primary",
  cancelado: "bg-red-100 text-red-700",
}

interface RecentOrder {
  id: string
  client: string
  product: string
  status: string
  date: string
  amount: string
}

interface EstadoPedido {
  label: string
  value: number
  color: string
}

interface ActividadMensualItem {
  month: string
  count: number
}

interface ServicioDetalle {
  id: number
  nombre: string
  precio: number | null
}

interface SolicitudItem {
  id: number
  servicio: string
  estado: string
  created_at: string
  cliente_id: number
  cliente_nombre: string
  precio: number | null
  servicios_detalle?: ServicioDetalle[]
}

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [totalProductos, setTotalProductos] = useState<number | null>(null)
  const [trabajosCompletados, setTrabajosCompletados] = useState<number | null>(null)
  const [ingresosDelMes, setIngresosDelMes] = useState<number | null>(null)
  const [ingresosMesAnterior, setIngresosMesAnterior] = useState<number | null>(null)
  const [estadoPedidos, setEstadoPedidos] = useState<EstadoPedido[]>([])
  const [actividadMensual, setActividadMensual] = useState<ActividadMensualItem[]>([])
  const [recentSolicitudes, setRecentSolicitudes] = useState<RecentOrder[]>([])
   const [loadingStats, setLoadingStats] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

   useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadError(null)
        const response = await fetch("/api/dashboard-stats")
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`)
        }
        const result = await response.json()
        const stats = result.data || {}

        setTotalClientes(stats.totalClientes ?? 0)
        setTotalProductos(stats.totalSolicitudes ?? 0)
        setTrabajosCompletados(stats.trabajosCompletados ?? 0)
        setIngresosDelMes(stats.ingresosDelMes ?? 0)
        setIngresosMesAnterior(stats.ingresosMesAnterior ?? 0)
        setEstadoPedidos(stats.estadoPedidos ?? [])
        setActividadMensual(stats.actividadMensual ?? [])
      } catch (err) {
        console.error("Error cargando estadísticas:", err)
        setLoadError(err instanceof Error ? err.message : "Error cargando estadísticas")
      } finally {
        setLoadingStats(false)
      }
    }

    loadAllData()
  }, [])

   useEffect(() => {
    const loadRecentOrders = async () => {
      setLoadingOrders(true)
      try {
        const response = await fetch("/api/dashboard-stats?recent=1")

        if (response.ok) {
          const result = await response.json()
          const data = result.data?.recentOrders || []
          const formatted = data.map((item: any) => ({
            id: `SOL-${String(item.id).padStart(3, "0")}`,
            client: item.cliente_nombre || "Sin cliente",
            product: item.servicio || "Servicio",
            status: item.estado
              ? item.estado
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
              : "Pendiente",
            date: new Date(item.created_at).toLocaleDateString("es-CO"),
            amount: item.precio
              ? `$${item.precio.toLocaleString("es-CO")}`
              : "-",
          }))
          setRecentSolicitudes(formatted)
        }
      } catch (err) {
        console.error("Error cargando pedidos recientes:", err)
      } finally {
        setLoadingOrders(false)
      }
    }

    loadRecentOrders()
  }, [])

  const formatRevenue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${value.toLocaleString("es-CO")}`
  }

  const revenueChange =
    ingresosDelMes !== null &&
    ingresosMesAnterior !== null &&
    ingresosMesAnterior > 0
      ? ((ingresosDelMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
      : null

  const stats = [
    {
      label: "Total Clientes",
      value: totalClientes !== null ? totalClientes.toString() : "...",
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Productos Activos",
      value: totalProductos !== null ? totalProductos.toString() : "...",
      change: "+8%",
      trend: "up" as const,
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Trabajos Completados",
      value: trabajosCompletados !== null ? trabajosCompletados.toString() : "...",
      change: "+23%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-accent/20 text-accent",
    },
    {
      label: "Ingresos del Mes",
      value: ingresosDelMes !== null ? formatRevenue(ingresosDelMes) : "...",
      change:
        revenueChange !== null
          ? `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`
          : "-3%",
      trend:
        revenueChange !== null
          ? revenueChange >= 0
            ? ("up" as const)
            : ("down" as const)
          : "down",
      icon: DollarSign,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

  const maxActividad = Math.max(
    ...actividadMensual.map((a) => a.count),
    1
  )

  return (
    <div className="space-y-6 mt-20">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl bg-card p-6 shadow-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Actividad Mensual
            </h2>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp size={16} />
              <span>
                {actividadMensual.length > 0
                  ? `${actividadMensual[actividadMensual.length - 1].count} solicitudes este mes`
                  : "Cargando..."}
              </span>
            </div>
          </div>
          <div className="flex h-64 items-end justify-between gap-2 px-2">
            {loadingStats ? (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Cargando gráfico...
                </p>
              </div>
            ) : actividadMensual.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No hay datos disponibles
                </p>
              </div>
            ) : (
              actividadMensual.map((item) => {
                const height = (item.count / maxActividad) * 100
                return (
                  <div
                    key={item.month}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-xs font-medium text-foreground">
                      {item.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-primary transition-all"
                      style={{
                        height: `${Math.max(
                          height,
                          item.count > 0 ? 4 : 0
                        )}%`,
                        minHeight: item.count > 0 ? "8px" : "0",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.month}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Estado de Pedidos
          </h2>
          {loadingStats ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                  <span className="flex-1 text-sm text-muted-foreground">
                    Cargando...
                  </span>
                  <span className="font-medium text-foreground">...</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {estadoPedidos.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="font-medium text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Pedidos Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    Cargando pedidos...
                  </td>
                </tr>
              ) : recentSolicitudes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                recentSolicitudes.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.product}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                      {order.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}
    </div>
  )
}