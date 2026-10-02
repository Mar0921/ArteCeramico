"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import ExpiracionMananaBanner, { VenceMananaItem } from "@/components/expiracion-manana-banner"
import { getDaysHastaEntrega } from "@/lib/fechas"

interface Trabajo {
  id: number
  servicio: string
  estado: string
  created_at: string
  cliente_nombre: string
  fecha_entrega: string | null
  codigo_trazabilidad: string | null
  paciente: string | null
  fase: string | null
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-blue-500/10 text-blue-600",
  cancelado: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  aprobado: "Aprobado",
  completado: "Completado",
  cancelado: "Cancelado",
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha"
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default function EmpleadoDashboardPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    enProceso: 0,
    completados: 0,
    pendientes: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/solicitudes?limit=50")
        if (!response.ok) throw new Error("No se pudieron cargar los trabajos.")
        const result = await response.json()
        const trabajosData: Trabajo[] = result.data || []

        setTrabajos(trabajosData)

        setStats({
          total: trabajosData.length,
          enProceso: trabajosData.filter((t) => t.estado === "en_proceso").length,
          completados: trabajosData.filter((t) => t.estado === "completado").length,
          pendientes: trabajosData.filter((t) => t.estado === "pendiente").length,
        })
      } catch (err) {
        console.error("Error cargando datos:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const statsCards = [
    {
      label: "Total Asignados",
      value: stats.total,
      icon: Package,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "En Proceso",
      value: stats.enProceso,
      icon: Clock,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Completados",
      value: stats.completados,
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: AlertCircle,
      color: "bg-amber-500/10 text-amber-600",
    },
  ]

  const venceMananaItems = useMemo<VenceMananaItem[]>(
    () =>
      trabajos
        .filter(
          (trabajo) =>
            trabajo.estado !== "completado" &&
            trabajo.estado !== "cancelado" &&
            getDaysHastaEntrega(trabajo.fecha_entrega) === 1
        )
        .map((trabajo) => ({
          codigo: trabajo.codigo_trazabilidad || `#${trabajo.id}`,
          fechaEntrega: trabajo.fecha_entrega,
        })),
    [trabajos]
  )

  return (
    <div className="space-y-6 mt-4">
      <ExpiracionMananaBanner items={venceMananaItems} />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Empleado</h1>
        <p className="mt-1 text-muted-foreground">Resumen de tus trabajos asignados</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <TrendingUp className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Mis Trabajos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fase Actual</th>
                <th className="px-6 py-4">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Cargando trabajos...
                  </td>
                </tr>
              ) : trabajos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No tienes trabajos asignados
                  </td>
                </tr>
              ) : (
                trabajos.map((trabajo) => (
                  <tr key={trabajo.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {trabajo.codigo_trazabilidad || `#${trabajo.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trabajo.servicio}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trabajo.cliente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{trabajo.paciente || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[trabajo.estado] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[trabajo.estado] || trabajo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{trabajo.fase || "Sin fase"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(trabajo.fecha_entrega)}</td>
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