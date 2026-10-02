"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Package,
  Phone,
  Stethoscope,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Cliente {
  id: number
  nombre: string
  tipo: string | null
  documento: string | null
  correo: string | null
  telefono: string | null
  clinica: string | null
}

interface ServicioDetalle {
  id: number
  nombre: string
  descripcion: string | null
  cantidad: number | null
  tipo_trabajo: string | null
  material: string | null
  dientes: string | null
  piezas_enviadas: string[] | null
}

interface DienteDetalle {
  numero: number
  servicio: string
  estado: string
}

interface FaseProceso {
  tipo?: string
  estado?: string
  descripcion?: string
}

interface Solicitud {
  id: number
  servicio: string
  observaciones: string | null
  estado: string
  created_at: string
  updated_at: string | null
  cliente_id: number
  urls_documentos: string[] | null
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  historia_clinica: string | null
  historia_clinica_paciente: string | null
  odontologo: string | null
  cc_odontologo: string | null
  odontologo_tarjeta_profesional: string | null
  odontologo_registro_medico: string | null
  odontologo_correo: string | null
  odontologo_telefono: string | null
  odontologo_direccion: string | null
  paciente: string | null
  cc_paciente: string | null
  color: string | null
  guia: string | null
  prueba: string | null
  terminado: string | null
  chimenea: string | null
  caja: string | null
  codigo_trazabilidad: string | null
  dientes_trabajados: string[] | null
  piezas_enviadas: string[] | null
  tipos_trabajo: string[] | null
  materiales: string[] | null
  fase: string | null
  orden_fabricacion_url: string | null
  orden_materiales: string | null
  orden_fases: string | null
  dibujo_odontologo: string | null
  dientes_detallados: DienteDetalle[]
}

interface SolicitudDetalle {
  solicitud: Solicitud
  cliente: Cliente | null
  servicios: ServicioDetalle[]
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

const fasesProgreso = ["pendiente", "en_proceso", "completado"]

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

function formatDateTime(value: string | null) {
  if (!value) return "Sin fecha"
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function parseFases(value: string | null): FaseProceso[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as FaseProceso[]) : []
  } catch {
    return []
  }
}

function getFaseActual(solicitud: Solicitud) {
  if (solicitud.fase) return solicitud.fase
  const fases = parseFases(solicitud.orden_fases)
  const actual =
    fases.find((f) => f.estado === "en_proceso") ||
    fases.find((f) => f.estado === "pendiente")
  return actual?.tipo || (fases.length > 0 ? "Fase pendiente" : "Sin fase registrada")
}

function siNo(value: string | null | undefined) {
  const v = String(value || "").toLowerCase().trim()
  if (v === "si") return "Sí"
  if (v === "no" || v === "") return "No"
  return value || "-"
}

function joinList(value: string[] | null | undefined) {
  if (!value) return "-"
  return value.length > 0 ? value.join(", ") : "-"
}

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr] sm:py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground break-words">{children || "-"}</span>
  </div>
)

export default function EmpleadoSolicitudDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const solicitudId = id ? Number(id) : NaN
  const [data, setData] = useState<SolicitudDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSolicitud = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`)
      if (!res.ok) throw new Error("No se pudo cargar la solicitud.")
      const result = await res.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isNaN(solicitudId)) {
      setError("ID de solicitud inválido.")
      setLoading(false)
      return
    }
    loadSolicitud()
  }, [solicitudId])

  const handleAdvanceFase = async (idx: number) => {
    if (!data) return
    const s = data.solicitud
    const fases = parseFases(s.orden_fases)
    if (!fases[idx]) return
    const estadoActual = fases[idx].estado || "pendiente"
    const siguiente = fasesProgreso[(fasesProgreso.indexOf(estadoActual) + 1) % fasesProgreso.length]
    const updated = fases.map((fase, i) =>
      i === idx ? { ...fase, estado: siguiente } : fase
    )
    const nuevaFase = updated.find((fase) => fase.estado === "en_proceso")?.tipo || null

    setSaving(true)
    try {
      const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orden_fases: JSON.stringify(updated),
          fase: nuevaFase,
        }),
      })
      if (!res.ok) throw new Error("No se pudo actualizar la fase.")
      await loadSolicitud()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la fase.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando detalle de la solicitud...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!data) return null

  const { solicitud: s, cliente, servicios } = data

  return (
    <div className="w-full space-y-6 pt-6">
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Guardando fase...
          </span>
        )}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <Package className="size-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Detalle de Solicitud</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.codigo_trazabilidad || `Solicitud #${s.id}`}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            statusStyles[s.estado] || "bg-muted text-muted-foreground"
          )}
        >
          {statusLabels[s.estado] || s.estado}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <Stethoscope className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Cliente</h2>
            </div>
            <InfoRow label="Nombre">{cliente?.nombre}</InfoRow>
            <InfoRow label="Tipo / Documento">
              {cliente?.tipo
                ? `${cliente.tipo} ${cliente.documento || ""}`
                : cliente?.documento || "-"}
            </InfoRow>
            <InfoRow label="Clínica">{cliente?.clinica}</InfoRow>
            <InfoRow label="Correo">
              {cliente?.correo ? (
                <a
                  href={`mailto:${cliente.correo}`}
                  className="text-primary hover:underline"
                >
                  {cliente.correo}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Teléfono">
              {cliente?.telefono ? (
                <a
                  href={`https://wa.me/${(cliente.telefono || "").replace(/\D/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {cliente.telefono}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <User className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Doctor y Paciente</h2>
            </div>
            <InfoRow label="Doctor">{s.odontologo}</InfoRow>
            <InfoRow label="CC">{s.cc_odontologo}</InfoRow>
            <InfoRow label="Tarjeta profesional">{s.odontologo_tarjeta_profesional}</InfoRow>
            <InfoRow label="Registro médico">{s.odontologo_registro_medico}</InfoRow>
            <InfoRow label="Correo">
              {s.odontologo_correo ? (
                <a
                  href={`mailto:${s.odontologo_correo}`}
                  className="text-primary hover:underline"
                >
                  {s.odontologo_correo}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Teléfono">
              {s.odontologo_telefono ? (
                <a
                  href={`https://wa.me/${(s.odontologo_telefono || "").replace(/\D/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {s.odontologo_telefono}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Dirección">{s.odontologo_direccion}</InfoRow>
            <InfoRow label="Paciente">{s.paciente}</InfoRow>
            <InfoRow label="CC Paciente">{s.cc_paciente}</InfoRow>
            <InfoRow label="Historia clínica">{s.historia_clinica}</InfoRow>
            <InfoRow label="Historia clínica paciente">{s.historia_clinica_paciente}</InfoRow>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <CalendarDays className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Fechas</h2>
            </div>
            <InfoRow label="Fecha de solicitud">{formatDateTime(s.created_at)}</InfoRow>
            <InfoRow label="Última actualización">{formatDateTime(s.updated_at)}</InfoRow>
            <InfoRow label="Fecha de elaboración">{formatDate(s.fecha_elaboracion)}</InfoRow>
            <InfoRow label="Fecha de entrega">{formatDate(s.fecha_entrega)}</InfoRow>
            <InfoRow label="Fase actual">{getFaseActual(s)}</InfoRow>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <Package className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Documentos</h2>
            </div>
            <InfoRow label="Guía">{s.guia}</InfoRow>
            <InfoRow label="Orden de fabricación">
              {s.orden_fabricacion_url ? (
                <a
                  href={s.orden_fabricacion_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver documento
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Orden de materiales">
              {s.orden_materiales ? (
                <a
                  href={s.orden_materiales}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver documento
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            {s.dibujo_odontologo && (
              <InfoRow label="Dibujo odontólogo">
                <a
                  href={s.dibujo_odontologo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver dibujo
                </a>
              </InfoRow>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <Package className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Información del trabajo</h2>
            </div>
            <InfoRow label="Trabajo (servicio)">{s.servicio || s.observaciones}</InfoRow>
            <InfoRow label="Observaciones">{s.observaciones}</InfoRow>
            <InfoRow label="Tipo de servicio">{joinList(s.tipos_trabajo)}</InfoRow>
            <InfoRow label="Materiales">{joinList(s.materiales)}</InfoRow>
            <InfoRow label="Caja">{s.caja}</InfoRow>
            <InfoRow label="Color">{s.color}</InfoRow>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:py-1.5">
              <span className="text-xs text-muted-foreground">Chimenea</span>
              <span className="sm:col-span-2 text-sm text-foreground">{siNo(s.chimenea)}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:py-1.5">
              <span className="text-xs text-muted-foreground">Prueba</span>
              <span className="sm:col-span-2 text-sm text-foreground">{siNo(s.prueba)}</span>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:py-1.5">
              <span className="text-xs text-muted-foreground">Terminado</span>
              <span className="sm:col-span-2 text-sm text-foreground">{siNo(s.terminado)}</span>
            </div>
            <InfoRow label="Piezas enviadas">{joinList(s.piezas_enviadas)}</InfoRow>
            <InfoRow label="Dientes asociados">
              {s.dientes_detallados && s.dientes_detallados.length > 0
                ? s.dientes_detallados.map((d) => d.numero).join(", ")
                : s.dientes_trabajados && s.dientes_trabajados.length > 0
                  ? s.dientes_trabajados.join(", ")
                  : "-"}
            </InfoRow>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h2 className="font-semibold text-foreground">Guía de fabricación</h2>
              </div>
              {saving && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Guardando...
                </span>
              )}
            </div>
            {parseFases(s.orden_fases).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin guía de fabricación registrada.</p>
            ) : (
              <ul className="space-y-3">
                {parseFases(s.orden_fases).map((fase, idx) => {
                  const estado = fase.estado || "pendiente"
                  const isActual = estado === "en_proceso"
                  const siguiente =
                    fasesProgreso[(fasesProgreso.indexOf(estado) + 1) % fasesProgreso.length]
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            isActual
                              ? "bg-primary/10 text-primary"
                              : estado === "completado"
                                ? "bg-green-500/10 text-green-600"
                                : estado === "en_proceso"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium text-foreground">
                          {fase.tipo || fase.descripcion || `Fase ${idx + 1}`}
                        </span>
                        {fase.descripcion && fase.descripcion !== fase.tipo && (
                          <span className="hidden sm:inline text-xs text-muted-foreground">
                            / {fase.descripcion}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleAdvanceFase(idx)}
                        title={`Avanzar a ${statusLabels[siguiente] || siguiente}`}
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
                          estado === "completado"
                            ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            : estado === "en_proceso"
                              ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "border border-border bg-background text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {statusLabels[estado] || estado}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Avanza el progreso de cada fase (Pendiente → En proceso → Completado).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <Package className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Servicios</h2>
              <span className="ml-auto text-xs text-muted-foreground">Sin precios</span>
            </div>
            {servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay servicios registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Servicio</th>
                      <th className="px-3 py-2 font-medium">Descripción</th>
                      <th className="px-3 py-2 font-medium">Tipo de trabajo</th>
                      <th className="px-3 py-2 font-medium">Material</th>
                      <th className="px-3 py-2 font-medium">Dientes</th>
                      <th className="px-3 py-2 font-medium">Piezas</th>
                      <th className="px-3 py-2 font-medium text-right">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicios.map((serv) => (
                      <tr key={serv.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 break-words">{serv.nombre}</td>
                        <td className="px-3 py-2 break-words">{serv.descripcion || "-"}</td>
                        <td className="px-3 py-2 break-words">{serv.tipo_trabajo || "-"}</td>
                        <td className="px-3 py-2 break-words">{serv.material || "-"}</td>
                        <td className="px-3 py-2 break-words">{serv.dientes || "-"}</td>
                        <td className="px-3 py-2 break-words">
                          {(serv.piezas_enviadas && serv.piezas_enviadas.join(", ")) || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">{serv.cantidad ?? 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <Stethoscope className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Dientes asociados</h2>
            </div>
            {s.dientes_detallados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin dientes registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Servicio</th>
                      <th className="px-3 py-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.dientes_detallados.map((d, idx) => (
                      <tr
                        key={`${d.numero}-${idx}`}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2">{d.numero}</td>
                        <td className="px-3 py-2 break-words">{d.servicio || "-"}</td>
                        <td className="px-3 py-2 capitalize">{d.estado || "normal"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(s.urls_documentos && s.urls_documentos.length > 0) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                <Package className="size-4 text-primary" />
                <h2 className="font-semibold text-foreground">Archivos adjuntos</h2>
              </div>
              <ul className="space-y-2">
                {(s.urls_documentos || []).map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary break-all hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
