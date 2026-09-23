"use client"

import { ComponentProps, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Package,
} from "lucide-react"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Solicitud {
  id: number
  servicio: string
  estado: string
  cliente_id: number
  cliente_nombre: string
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  codigo_trazabilidad: string | null
}

interface SolicitudConEntrega extends Solicitud {
  fechaEntregaDate: Date | null
  diasRestantes: number | null
  urgencia: "proxima" | "media" | "lejana" | "intermedia" | "sinFecha"
}

type Urgencia = SolicitudConEntrega["urgencia"]

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

const urgenciaStyles: Record<Urgencia, string> = {
  proxima: "border-red-200 bg-red-50 text-red-700",
  media: "border-amber-200 bg-amber-50 text-amber-700",
  lejana: "border-green-200 bg-green-50 text-green-700",
  intermedia: "border-slate-200 bg-slate-50 text-slate-600",
  sinFecha: "border-border bg-muted text-muted-foreground",
}

const urgenciaLabels: Record<Urgencia, string> = {
  proxima: "Entrega próxima",
  media: "Entrega en 5-6 días",
  lejana: "Entrega posterior",
  intermedia: "Entrega en 3-4 días",
  sinFecha: "Sin fecha de entrega",
}

const dayButtonUrgencyStyles: Record<Exclude<Urgencia, "sinFecha">, string> = {
  proxima: "!bg-red-100 !text-red-700 hover:!bg-red-200 font-semibold",
  media: "!bg-amber-100 !text-amber-800 hover:!bg-amber-200 font-semibold",
  lejana: "!bg-green-100 !text-green-700 hover:!bg-green-200",
  intermedia: "!bg-slate-100 !text-slate-700 hover:!bg-slate-200",
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value: string | null) {
  if (!value) return null
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

function getDaysUntil(value: string | null) {
  const deliveryDate = parseDate(value)
  if (!deliveryDate) return null
  const today = startOfDay(new Date())
  return Math.round((deliveryDate.getTime() - today.getTime()) / 86400000)
}

function getUrgencia(days: number | null): Urgencia {
  if (days === null) return "sinFecha"
  if (days <= 2) return "proxima"
  if (days >= 5 && days <= 6) return "media"
  if (days > 6) return "lejana"
  return "intermedia"
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDate(value: string | null) {
  const date = parseDate(value)
  if (!date) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatSelectedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}

function formatDays(days: number | null) {
  if (days === null) return "Sin fecha definida"
  if (days < 0) return `Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`
  if (days === 0) return "Entrega hoy"
  if (days === 1) return "Entrega mañana"
  return `Entrega en ${days} ${days === 1 ? "día" : "días"}`
}

function CalendarDayButtonConEntrega({
  modifiers,
  className,
  children,
  ...props
}: ComponentProps<typeof CalendarDayButton>) {
  const urgency = modifiers.entregaProxima
    ? "proxima"
    : modifiers.entregaMedia
      ? "media"
      : modifiers.entregaLejana
        ? "lejana"
        : modifiers.entregaIntermedia
          ? "intermedia"
          : null

  return (
    <CalendarDayButton
      {...props}
      modifiers={modifiers}
      className={cn(className, urgency ? dayButtonUrgencyStyles[urgency] : undefined)}
    >
      {children}
    </CalendarDayButton>
  )
}

export default function CalendarioPage() {
  const searchParams = useSearchParams()
  const solicitudIdParam = searchParams.get("solicitud")
  const solicitudId = solicitudIdParam ? Number(solicitudIdParam) : null
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [calendarMonth, setCalendarMonth] = useState<Date>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const solicitudesConEntrega = useMemo<SolicitudConEntrega[]>(
    () =>
      solicitudes.map((solicitud) => {
        const diasRestantes = getDaysUntil(solicitud.fecha_entrega)
        return {
          ...solicitud,
          fechaEntregaDate: parseDate(solicitud.fecha_entrega),
          diasRestantes,
          urgencia: getUrgencia(diasRestantes),
        }
      }),
    [solicitudes]
  )

  useEffect(() => {
    const loadCalendario = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/solicitudes?limit=100")
        if (!response.ok) throw new Error("No se pudo cargar el calendario.")
        const result = await response.json()
        setSolicitudes(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el calendario.")
      } finally {
        setLoading(false)
      }
    }

    loadCalendario()
  }, [])

  useEffect(() => {
    if (!solicitudId || solicitudesConEntrega.length === 0) return
    const solicitud = solicitudesConEntrega.find((item) => item.id === solicitudId)
    if (!solicitud?.fechaEntregaDate) return
    setSelectedDate(solicitud.fechaEntregaDate)
    setCalendarMonth(solicitud.fechaEntregaDate)
  }, [solicitudId, solicitudesConEntrega])

  const solicitudDestacada = solicitudId
    ? solicitudesConEntrega.find((solicitud) => solicitud.id === solicitudId)
    : null

  const solicitudesOrdenadas = useMemo(
    () =>
      [...solicitudesConEntrega].sort((a, b) => {
        if (a.fechaEntregaDate && b.fechaEntregaDate) {
          return a.fechaEntregaDate.getTime() - b.fechaEntregaDate.getTime()
        }
        if (a.fechaEntregaDate) return -1
        if (b.fechaEntregaDate) return 1
        return a.id - b.id
      }),
    [solicitudesConEntrega]
  )

  const entregasPorUrgencia = useMemo(
    () => ({
      proxima: solicitudesConEntrega.filter((solicitud) => solicitud.urgencia === "proxima"),
      media: solicitudesConEntrega.filter((solicitud) => solicitud.urgencia === "media"),
      lejana: solicitudesConEntrega.filter((solicitud) => solicitud.urgencia === "lejana"),
      intermedia: solicitudesConEntrega.filter((solicitud) => solicitud.urgencia === "intermedia"),
    }),
    [solicitudesConEntrega]
  )

  const alertas = useMemo(
    () =>
      solicitudesConEntrega
        .filter(
          (solicitud) =>
            solicitud.diasRestantes !== null &&
            solicitud.diasRestantes <= 6 &&
            solicitud.estado !== "completado" &&
            solicitud.estado !== "cancelado"
        )
        .sort((a, b) => (a.diasRestantes || 0) - (b.diasRestantes || 0)),
    [solicitudesConEntrega]
  )

  const eventosPorFecha = useMemo(
    () =>
      solicitudesConEntrega.reduce<Record<string, SolicitudConEntrega[]>>((agrupados, solicitud) => {
        if (!solicitud.fechaEntregaDate) return agrupados
        const key = dateKey(solicitud.fechaEntregaDate)
        agrupados[key] = [...(agrupados[key] || []), solicitud]
        return agrupados
      }, {}),
    [solicitudesConEntrega]
  )

  const selectedKey = selectedDate ? dateKey(selectedDate) : ""
  const eventosSeleccionados = selectedKey ? eventosPorFecha[selectedKey] || [] : []

  return (
    <div className="w-full space-y-5 pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario de entregas</h1>
          <p className="mt-1 text-muted-foreground">
            Consulta todas las solicitudes y controla las fechas de entrega.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700">
            <span className="size-2 rounded-full bg-red-500" />
            0-2 días
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
            <span className="size-2 rounded-full bg-amber-500" />
            5-6 días
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
            <span className="size-2 rounded-full bg-green-500" />
            Más de 6 días
          </span>
        </div>
      </div>

      {solicitudDestacada && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary">Solicitud destacada</p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {solicitudDestacada.codigo_trazabilidad || `Solicitud #${solicitudDestacada.id}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {solicitudDestacada.fecha_entrega
                  ? `Entrega: ${formatDate(solicitudDestacada.fecha_entrega)}`
                  : "Sin fecha de entrega registrada"}
              </p>
            </div>
            <Link
              href={`/dashboard/clientes/${solicitudDestacada.cliente_id}?solicitud=${solicitudDestacada.id}`}
              className="shrink-0 rounded-lg border border-primary/20 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando calendario...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)]">
            <section className="min-w-0 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-semibold text-foreground">Todas las solicitudes</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{solicitudesConEntrega.length} registros</p>
                </div>
                <Package className="size-5 text-primary" />
              </div>

              <div className="max-h-[680px] divide-y divide-border overflow-y-auto">
                {solicitudesOrdenadas.length === 0 ? (
                  <div className="flex min-h-[260px] items-center justify-center p-6 text-sm text-muted-foreground">
                    No hay solicitudes registradas.
                  </div>
                ) : (
                  solicitudesOrdenadas.map((solicitud) => (
                    <Link
                      key={solicitud.id}
                      href={`/dashboard/clientes/${solicitud.cliente_id}?solicitud=${solicitud.id}`}
                      className={cn(
                        "group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40",
                        solicitudDestacada?.id === solicitud.id && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-medium text-muted-foreground">
                            {solicitud.codigo_trazabilidad || `Solicitud #${solicitud.id}`}
                          </p>
                          {solicitud.urgencia === "proxima" && (
                            <span className="size-2 shrink-0 rounded-full bg-red-500" />
                          )}
                        </div>
                        <h3 className="mt-1 truncate font-medium text-foreground">{solicitud.servicio || "Sin servicio"}</h3>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{solicitud.cliente_nombre}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDays(solicitud.diasRestantes)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${urgenciaStyles[solicitud.urgencia]}`}>
                          {urgenciaLabels[solicitud.urgencia]}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[solicitud.estado] || "bg-muted text-muted-foreground"}`}>
                          {statusLabels[solicitud.estado] || solicitud.estado}
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <aside className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">Calendario</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Fechas marcadas según entrega</p>
                </div>
                <CalendarDays className="size-5 text-primary" />
              </div>

              <div className="mt-4 overflow-x-auto">
                <Calendar
                  mode="multiple"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  selected={selectedDate ? [selectedDate] : undefined}
                  onSelect={(dates) => setSelectedDate(dates?.[0])}
                  modifiers={{
                    entregaProxima: entregasPorUrgencia.proxima
                      .map((solicitud) => solicitud.fechaEntregaDate)
                      .filter((date): date is Date => date !== null),
                    entregaMedia: entregasPorUrgencia.media
                      .map((solicitud) => solicitud.fechaEntregaDate)
                      .filter((date): date is Date => date !== null),
                    entregaLejana: entregasPorUrgencia.lejana
                      .map((solicitud) => solicitud.fechaEntregaDate)
                      .filter((date): date is Date => date !== null),
                    entregaIntermedia: entregasPorUrgencia.intermedia
                      .map((solicitud) => solicitud.fechaEntregaDate)
                      .filter((date): date is Date => date !== null),
                  }}
                  components={{ DayButton: CalendarDayButtonConEntrega }}
                  weekStartsOn={1}
                  className="mx-auto"
                />
              </div>

              <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {selectedKey ? formatSelectedDate(selectedKey) : "Selecciona una fecha"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedKey
                        ? `${eventosSeleccionados.length} ${eventosSeleccionados.length === 1 ? "entrega" : "entregas"}`
                        : "para ver sus entregas"}
                    </p>
                  </div>
                  <CalendarDays className="size-4 text-muted-foreground" />
                </div>

                {selectedKey && eventosSeleccionados.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {eventosSeleccionados.map((solicitud) => (
                      <Link
                        key={solicitud.id}
                        href={`/dashboard/clientes/${solicitud.cliente_id}?solicitud=${solicitud.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-xs transition-colors hover:border-primary"
                      >
                        <span className="truncate font-medium text-foreground">
                          {solicitud.codigo_trazabilidad || `Solicitud #${solicitud.id}`}
                        </span>
                        <span className={`shrink-0 rounded-full px-2 py-1 ${urgenciaStyles[solicitud.urgencia]}`}>
                          {urgenciaLabels[solicitud.urgencia]}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Alertas de entrega próxima</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Solicitudes con entrega en los próximos 6 días
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
                {alertas.length} {alertas.length === 1 ? "alerta" : "alertas"}
              </span>
            </div>

            {alertas.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No hay entregas próximas pendientes.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {alertas.map((solicitud) => (
                  <Link
                    key={solicitud.id}
                    href={`/dashboard/clientes/${solicitud.cliente_id}?solicitud=${solicitud.id}`}
                    className="group rounded-lg border border-red-200 bg-red-50/60 p-4 transition-colors hover:bg-red-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-red-700">Entrega próxima</p>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {solicitud.codigo_trazabilidad || `Solicitud #${solicitud.id}`} · {solicitud.servicio}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{solicitud.cliente_nombre}</p>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-red-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-700">
                        {formatDays(solicitud.diasRestantes)}
                      </span>
                      <span className="text-muted-foreground">{formatDate(solicitud.fecha_entrega)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
