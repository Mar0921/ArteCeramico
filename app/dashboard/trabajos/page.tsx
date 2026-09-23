"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  Search,
} from "lucide-react"

interface Trabajo {
  id: number
  servicio: string
  estado: string
  created_at: string
  cliente_id: number
  cliente_nombre: string
  precio: number | null
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  codigo_trazabilidad: string | null
  caja: string | null
  odontologo: string | null
  paciente: string | null
  fase: string | null
  orden_fases: string | null
  tiposTrabajo: string[]
  materiales: string[]
}

interface Fase {
  tipo?: string
  estado?: string
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-primary/10 text-primary",
  cancelado: "bg-red-100 text-red-100",
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

function parseFases(value: string | null): Fase[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((fase): fase is Fase => typeof fase === "object" && fase !== null)
      : []
  } catch {
    return []
  }
}

function getFaseActual(trabajo: Trabajo) {
  if (trabajo.fase) return trabajo.fase
  const fases = parseFases(trabajo.orden_fases)
  const actual = fases.find((fase) => fase.estado === "en_proceso") || fases.find((fase) => fase.estado === "pendiente")
  return actual?.tipo || (fases.length > 0 ? "Fase pendiente" : "Sin fase registrada")
}

export default function TrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadTrabajos = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/solicitudes?limit=100")
        if (!response.ok) throw new Error("No se pudieron cargar los trabajos.")
        const result = await response.json()
        setTrabajos(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los trabajos.")
      } finally {
        setLoading(false)
      }
    }

    loadTrabajos()
  }, [])

  const filteredTrabajos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return trabajos
    return trabajos.filter((trabajo) =>
      [
        trabajo.servicio,
        trabajo.cliente_nombre,
        trabajo.codigo_trazabilidad,
        ...trabajo.tiposTrabajo,
        ...trabajo.materiales,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [searchTerm, trabajos])

  const totalTrabajos = trabajos.length
  const trabajosCompletados = trabajos.filter((trabajo) => trabajo.estado === "completado").length
  const trabajosEnProceso = trabajos.filter((trabajo) => trabajo.estado === "en_proceso").length
  const totalPendientes = trabajos.filter((trabajo) => trabajo.estado === "pendiente").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trabajos</h1>
          <p className="mt-1 text-muted-foreground">
            Consulta y administra las solicitudes del laboratorio.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por cliente, servicio o código"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de trabajos", value: totalTrabajos, icon: Package, className: "bg-primary/10 text-primary" },
          { label: "Completados", value: trabajosCompletados, icon: CheckCircle, className: "bg-green-500/10 text-green-600" },
          { label: "En proceso", value: trabajosEnProceso, icon: Clock, className: "bg-blue-500/10 text-blue-600" },
          { label: "Pendientes", value: totalPendientes, icon: AlertCircle, className: "bg-amber-500/10 text-amber-600" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${stat.className}`}>
                  <Icon size={19} />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-0 xl:min-w-[1200px] border-collapse">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[8%]" />
            <col className="w-[6%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="min-w-0 px-3 py-3 font-medium">Código del trabajo</th>
              <th className="min-w-0 px-3 py-3 font-medium">Estado</th>
              <th className="min-w-0 px-3 py-3 font-medium">Caja</th>
              <th className="min-w-0 px-3 py-3 font-medium">Cliente</th>
              <th className="min-w-0 px-3 py-3 font-medium">Doctor</th>
              <th className="min-w-0 px-3 py-3 font-medium">Paciente</th>
              <th className="min-w-0 px-3 py-3 font-medium">Fase actual</th>
              <th className="min-w-0 px-3 py-3 font-medium">Fecha de entrega</th>
              <th className="min-w-0 px-3 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando trabajos...
                  </div>
                </td>
              </tr>
            ) : filteredTrabajos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No se encontraron trabajos.
                </td>
              </tr>
            ) : (
              filteredTrabajos.map((trabajo) => (
                <tr key={trabajo.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="min-w-0 px-3 py-3 align-top">
                    <div className="max-w-full break-words">
                      <p className="break-words font-medium text-foreground">
                        {trabajo.codigo_trazabilidad || `Solicitud #${trabajo.id}`}
                      </p>
                      <p className="mt-1 break-words text-xs text-muted-foreground">{trabajo.servicio || "Sin servicio"}</p>
                    </div>
                  </td>
                  <td className="min-w-0 px-3 py-3 align-top">
                    <span className={`inline-flex max-w-full rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[trabajo.estado] || "bg-muted text-muted-foreground"}`}>
                      <span className="break-words">{statusLabels[trabajo.estado] || trabajo.estado}</span>
                    </span>
                  </td>
                  <td className="min-w-0 px-3 py-3 align-top text-sm text-foreground break-words">{trabajo.caja || "-"}</td>
                  <td className="min-w-0 px-3 py-3 align-top text-sm text-foreground break-words">{trabajo.cliente_nombre}</td>
                  <td className="min-w-0 px-3 py-3 align-top text-sm text-foreground break-words">{trabajo.odontologo || "-"}</td>
                  <td className="min-w-0 px-3 py-3 align-top text-sm text-foreground break-words">{trabajo.paciente || "-"}</td>
                  <td className="min-w-0 px-3 py-3 align-top text-sm text-foreground break-words">{getFaseActual(trabajo)}</td>
                  <td className="min-w-0 px-3 py-3 align-top">
                    <span className="inline-flex max-w-full items-start gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0 mt-0.5" />
                      <span className="break-words">{formatDate(trabajo.fecha_entrega)}</span>
                    </span>
                  </td>
                  <td className="min-w-0 px-3 py-3 align-top">
                    <div className="flex items-start gap-1.5">
                      <Link
                        href={`/dashboard/calendario?solicitud=${trabajo.id}`}
                        aria-label={`Ver ${trabajo.codigo_trazabilidad || `solicitud ${trabajo.id}`} en el calendario`}
                        title="Ver en el calendario"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <CalendarDays className="size-3.5" />
                        <span className="hidden xl:inline">Calendario</span>
                      </Link>
                      <Link
                        href={`/dashboard/clientes/${trabajo.cliente_id}?solicitud=${trabajo.id}`}
                        aria-label={`Ver detalle de ${trabajo.codigo_trazabilidad || `solicitud ${trabajo.id}`}`}
                        title="Ver detalle"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden xl:inline">Detalle</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
