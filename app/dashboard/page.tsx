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
import { supabase } from "@/lib/supabase"

const recentOrders = [
  {
    id: "ORD-001",
    client: "Clínica Dental Sonrisa",
    product: "Coronas Cerámicas x4",
    status: "En proceso",
    date: "2024-01-15",
    amount: "$1,200,000",
  },
  {
    id: "ORD-002",
    client: "Dr. Juan García",
    product: "Prótesis Completa",
    status: "Aprobado",
    date: "2024-01-14",
    amount: "$2,500,000",
  },
  {
    id: "ORD-003",
    client: "Centro Odontológico Elite",
    product: "Carillas x6",
    status: "Pendiente",
    date: "2024-01-14",
    amount: "$3,600,000",
  },
  {
    id: "ORD-004",
    client: "Dra. María López",
    product: "Inlays/Onlays x2",
    status: "Completado",
    date: "2024-01-13",
    amount: "$800,000",
  },
  {
    id: "ORD-005",
    client: "Clínica Dental Norte",
    product: "Diseño Digital",
    status: "En proceso",
    date: "2024-01-13",
    amount: "$450,000",
  },
]

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-primary/10 text-primary",
  cancelado: "bg-red-100 text-red-700",
}

interface Solicitud {
  id: number
  servicio: string
  estado: string
  created_at: string
  cliente: {
    nombre: string
  }
  precio?: number
}

export default function DashboardPage() {
  const [totalClientes, setTotalClientes] = useState<number | null>(null)
  const [recentSolicitudes, setRecentSolicitudes] = useState<Solicitud[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const { count } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })

      setTotalClientes(count || 0)
    }

    loadStats()
  }, [])

  useEffect(() => {
    const loadRecentOrders = async () => {
      setLoadingOrders(true)
      try {
        const response = await fetch("/api/solicitudes?limit=5")

        if (response.ok) {
          const result = await response.json()
          const data = result.data || []
          const formatted = data.map((item: any) => ({
            id: `SOL-${String(item.id).padStart(3, "0")}`,
            client: item.cliente_nombre || "Sin cliente",
            product: item.servicio || "Servicio",
            status: item.estado
              ? item.estado.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
              : "Pendiente",
            date: new Date(item.created_at).toLocaleDateString("es-CO"),
            amount: "-",
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

  const stats = [
    {
      label: "Total Clientes",
      value: totalClientes !== null ? totalClientes.toString() : "...",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Productos Activos",
      value: "356",
      change: "+8%",
      trend: "up",
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Trabajos Completados",
      value: "892",
      change: "+23%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-accent/20 text-accent",
    },
    {
      label: "Ingresos del Mes",
      value: "$45.2M",
      change: "-3%",
      trend: "down",
      icon: DollarSign,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

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
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart Placeholder */}
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
              <span>+15% este mes</span>
            </div>
          </div>
          <div className="flex h-64 items-center justify-center rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Gráfico de actividad (UI placeholder)
            </p>
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
          <div className="space-y-4">
            {[
              { label: "Pendientes", value: 23, color: "bg-amber-500" },
              { label: "En Proceso", value: 45, color: "bg-blue-500" },
              { label: "Aprobados", value: 18, color: "bg-green-500" },
              { label: "Completados", value: 89, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : recentSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
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
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status] || "bg-gray-100 text-gray-700"}`}
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
    </div>
  )
}