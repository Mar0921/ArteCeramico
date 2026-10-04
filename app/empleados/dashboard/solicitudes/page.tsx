"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Loader2,
  Package,
  Plus,
  Search,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { esCancelada } from "@/lib/trabajos"

interface Solicitud {
  id: number
  cliente_id: number
  cliente_nombre: string
  servicio: string
  estado: string
  created_at: string
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  codigo_trazabilidad: string | null
  odontologo: string | null
  paciente: string | null
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-primary/10 text-primary",
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

const estadoOptions = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "aprobado", label: "Aprobado" },
  { value: "completado", label: "Completado" },
]

export default function EmpleadosSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const searchParams = useSearchParams()
  const clienteIdParam = searchParams.get("cliente_id")

  useEffect(() => {
    if (clienteIdParam) {
      setEstadoFilter("")
      setSearchTerm("")
    }
  }, [clienteIdParam])

  useEffect(() => {
    const loadSolicitudes = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/solicitudes?limit=100")
        if (!res.ok) throw new Error("No se pudieron cargar las solicitudes.")
        const result = await res.json()
        setSolicitudes(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las solicitudes.")
      } finally {
        setLoading(false)
      }
    }
    loadSolicitudes()
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const clienteId = clienteIdParam ? Number(clienteIdParam) : null
    // Las canceladas no se muestran al empleado en ningún filtro.
    return solicitudes.filter((s) => {
      if (esCancelada(s.estado)) return false
      const matchesEstado = estadoFilter ? s.estado === estadoFilter : true
      const matchesCliente = clienteId ? s.cliente_id === clienteId : true
      const matchesTerm = term
        ? [s.codigo_trazabilidad, s.cliente_nombre, s.servicio, s.odontologo, s.paciente]
            .filter(Boolean)
            .some((val) => String(val).toLowerCase().includes(term))
        : true
      return matchesEstado && matchesCliente && matchesTerm
    })
  }, [solicitudes, searchTerm, estadoFilter, clienteIdParam])

  const porEstado = useMemo(() => {
    const grupos: Record<string, Solicitud[]> = {}
    for (const s of filtered) {
      const key = s.estado || "sin_estado"
      if (!grupos[key]) grupos[key] = []
      grupos[key].push(s)
    }
    return grupos
  }, [filtered])

  const ordenEstado: Record<string, number> = {
    pendiente: 1,
    en_proceso: 2,
    aprobado: 3,
    completado: 4,
    finalizado: 4,
    sin_estado: 6,
  }

  const estadosConDatos = Object.keys(porEstado).sort(
    (a, b) => (ordenEstado[a] ?? 99) - (ordenEstado[b] ?? 99)
  )

  return (
    <div className="w-full space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes</h1>
          <p className="mt-1 text-muted-foreground">
            Solicitudes del laboratorio agrupadas por estado.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full sm:max-w-lg">
          <Link
            href="/empleados/dashboard/solicitudes/nueva"
            className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 sm:min-w-[190px]"
          >
            <Plus size={16} />
            Nueva solicitud
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, código o servicio"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-card py-2.5 pl-9 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {estadoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando solicitudes...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          No se encontraron solicitudes.
        </div>
      ) : (
        <div className="space-y-6">
          {estadosConDatos.map((estado) => (
            <section key={estado} className="rounded-xl border border-border bg-card shadow-sm">
              <div
                className={cn(
                  "flex items-center justify-between border-b border-border px-5 py-3",
                  estado === "en_proceso"
                    ? "bg-blue-500/5"
                    : estado === "pendiente"
                      ? "bg-amber-500/5"
                      : estado === "completado"
                        ? "bg-primary/5"
                        : estado === "aprobado"
                          ? "bg-green-500/5"
                          : estado === "cancelado"
                            ? "bg-red-500/5"
                            : "bg-background/40"
                )}
              >
                <div className="flex items-center gap-2">
                  {estado === "en_proceso" ? (
                    <Clock size={16} className="text-blue-600" />
                  ) : estado === "pendiente" ? (
                    <Package size={16} className="text-amber-600" />
                  ) : estado === "completado" ? (
                    <CheckCircle size={16} className="text-primary" />
                  ) : estado === "aprobado" ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : estado === "cancelado" ? (
                    <Package size={16} className="text-red-600" />
                  ) : (
                    <Package size={16} className="text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">
                    {statusLabels[estado] || estado}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {porEstado[estado].length} {porEstado[estado].length === 1 ? "solicitud" : "solicitudes"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Código</th>
                      <th className="px-4 py-2.5 font-medium">Cliente</th>
                      <th className="px-4 py-2.5 font-medium">Servicio</th>
                      <th className="px-4 py-2.5 font-medium">Doctor</th>
                      <th className="px-4 py-2.5 font-medium">Paciente</th>
                      <th className="px-4 py-2.5 font-medium">Entrega</th>
                      <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porEstado[estado].map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-2.5 align-top">
                        <div className="max-w-[180px] break-words font-medium text-foreground">
                          {s.codigo_trazabilidad || `#${s.id}`}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 align-top text-sm text-foreground break-words">
                        {s.cliente_nombre || "Sin cliente"}
                      </td>
                      <td className="px-4 py-2.5 align-top text-sm text-muted-foreground break-words">
                        {s.servicio || "-"}
                      </td>
                      <td className="px-4 py-2.5 align-top text-sm text-muted-foreground break-words">
                        {s.odontologo || "-"}
                      </td>
                      <td className="px-4 py-2.5 align-top text-sm text-muted-foreground break-words">
                        {s.paciente || "-"}
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDate(s.fecha_entrega)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/empleados/dashboard/solicitudes/${s.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                            title="Ver detalle"
                          >
                            <Eye size={13} />
                            Detalle
                          </Link>
                          <Link
                            href={`/empleados/dashboard/calendario?solicitud=${s.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                            title="Ver en el calendario"
                          >
                            <CalendarDays size={13} />
                            Calendario
                          </Link>
                        </div>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
