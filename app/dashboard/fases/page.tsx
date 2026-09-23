"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Search,
} from "lucide-react"

interface Fase {
  tipo: string
  estado: string
  realizada_por: string
  fecha_finalizacion: string
  fecha_prueba: string
}

interface Trabajo {
  id: number
  servicio: string
  estado: string
  cliente_id: number
  cliente_nombre: string
  codigo_trazabilidad: string | null
  orden_fases: string | null
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

const phaseStyles: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_proceso: "bg-blue-100 text-blue-700",
  completado: "bg-green-100 text-green-700",
}

function parseFases(value: string | null): Fase[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((fase): fase is Fase => typeof fase === "object" && fase !== null) : []
  } catch {
    return []
  }
}

function getPhaseSummary(fases: Fase[]) {
  const completadas = fases.filter((fase) => fase.estado === "completado").length
  const enProceso = fases.find((fase) => fase.estado === "en_proceso")
  const actual = enProceso || fases.find((fase) => fase.estado === "pendiente")
  return {
    total: fases.length,
    completadas,
    actual: actual?.tipo || (fases.length > 0 ? "Fase pendiente" : "Sin fases registradas"),
    progress: fases.length ? Math.round((completadas / fases.length) * 100) : 0,
  }
}

export default function FasesPage() {
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
        if (!response.ok) throw new Error("No se pudieron cargar las fases.")
        const result = await response.json()
        setTrabajos(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las fases.")
      } finally {
        setLoading(false)
      }
    }

    loadTrabajos()
  }, [])

  const trabajosConFases = useMemo(
    () =>
      trabajos.map((trabajo) => ({
        trabajo,
        fases: parseFases(trabajo.orden_fases),
      })),
    [trabajos]
  )

  const filteredTrabajos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return trabajosConFases
    return trabajosConFases.filter(({ trabajo }) =>
      [trabajo.servicio, trabajo.cliente_nombre, trabajo.codigo_trazabilidad]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
  }, [searchTerm, trabajosConFases])

  const totalFases = trabajosConFases.reduce((total, { fases }) => total + fases.length, 0)
  const fasesCompletadas = trabajosConFases.reduce(
    (total, { fases }) => total + fases.filter((fase) => fase.estado === "completado").length,
    0
  )
  const trabajosEnProceso = trabajosConFases.filter(({ fases }) =>
    fases.some((fase) => fase.estado === "en_proceso")
  ).length
  const trabajosSinFases = trabajosConFases.filter(({ fases }) => fases.length === 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fases</h1>
          <p className="mt-1 text-muted-foreground">
            Sigue el avance de fabricación de cada solicitud.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar trabajo o cliente"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Fases registradas", value: totalFases, icon: CalendarDays, className: "bg-primary/10 text-primary" },
          { label: "Fases completadas", value: fasesCompletadas, icon: CheckCircle, className: "bg-green-500/10 text-green-600" },
          { label: "Trabajos en proceso", value: trabajosEnProceso, icon: Clock, className: "bg-blue-500/10 text-blue-600" },
          { label: "Sin fases", value: trabajosSinFases, icon: AlertCircle, className: "bg-amber-500/10 text-amber-600" },
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

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando fases...
          </div>
        </div>
      ) : filteredTrabajos.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
          No se encontraron fases.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredTrabajos.map(({ trabajo, fases }) => {
            const summary = getPhaseSummary(fases)
            return (
              <div key={trabajo.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {trabajo.codigo_trazabilidad || `Solicitud #${trabajo.id}`}
                    </p>
                    <h2 className="mt-1 truncate font-semibold text-foreground">{trabajo.servicio || "Sin servicio"}</h2>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{trabajo.cliente_nombre}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[trabajo.estado] || "bg-muted text-muted-foreground"}`}>
                    {statusLabels[trabajo.estado] || trabajo.estado}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Avance de fabricación</span>
                    <span className="font-medium text-foreground">{summary.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${summary.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Fase actual</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{summary.actual}</p>
                </div>

                {fases.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {fases.slice(0, 4).map((fase, index) => (
                      <div key={`${fase.tipo}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-foreground">{fase.tipo || `Fase ${index + 1}`}</span>
                        <span className={`shrink-0 rounded-full px-2 py-1 ${phaseStyles[fase.estado] || "bg-muted text-muted-foreground"}`}>
                          {fase.estado === "en_proceso" ? "En proceso" : fase.estado === "completado" ? "Completada" : "Pendiente"}
                        </span>
                      </div>
                    ))}
                    {fases.length > 4 && (
                      <p className="text-xs text-muted-foreground">+{fases.length - 4} fases adicionales</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">Este trabajo aún no tiene fases registradas.</p>
                )}

                <Link
                  href={`/dashboard/clientes/${trabajo.cliente_id}?solicitud=${trabajo.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Ver trabajo
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
