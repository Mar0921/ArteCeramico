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
  Plus,
  Stethoscope,
  User,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FASES_PROCESO, hoyISO, parseFases, type FaseProceso } from "@/lib/fases"
import { supabase } from "@/lib/supabase"

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
  tipoTrabajo: string
  material: string
}

interface MaterialOrden {
  material: string
  producto: string
  lote: string
  fabricante: string
  proveedor: string
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
  const [empleadoNombre, setEmpleadoNombre] = useState("")
  const [mostrandoFormFase, setMostrandoFormFase] = useState(false)
  const [nuevaFase, setNuevaFase] = useState({
    tipo: "",
    estado: "pendiente",
    realizada_por: "",
    fecha_finalizacion: "",
  })
  const [materialesOrden, setMaterialesOrden] = useState<MaterialOrden[]>([])
  const [savingMateriales, setSavingMateriales] = useState(false)

  /** Envía el arreglo completo de fases: el endpoint reemplaza `orden_fases`. */
  const guardarFases = async (fases: FaseProceso[]) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.")
      return false
    }

    const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ orden_fases: JSON.stringify(fases) }),
    })

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}))
      throw new Error(cuerpo.message || "No se pudo guardar la fase.")
    }

    await loadSolicitud()
    return true
  }

  /** Guarda los materiales en la orden de fabricación. */
  const guardarMateriales = async (materiales: MaterialOrden[]) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.")
      return false
    }

    const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ orden_materiales: JSON.stringify(materiales) }),
    })

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}))
      throw new Error(cuerpo.message || "No se pudieron guardar los materiales.")
    }

    await loadSolicitud()
    return true
  }

  // El nombre del empleado se sella como responsable de la fase que cierre.
  useEffect(() => {
    const cargarEmpleado = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("empleados")
        .select("nombre")
        .eq("user_id", user.id)
        .maybeSingle()
      if (data?.nombre) setEmpleadoNombre(data.nombre)
    }
    cargarEmpleado()
  }, [])

  const loadSolicitud = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`)
      if (!res.ok) {
        // Se propaga el mensaje del servidor: un texto genérico ocultaba
        // errores de esquema (p. ej. tablas sin migrar) difíciles de detectar.
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.details || body?.message || "No se pudo cargar la solicitud."
        )
      }
      const result = await res.json()
      setData(result.data)
      // Cargar materiales de la orden de fabricación
      if (result.data?.solicitud?.orden_materiales) {
        try {
          const materiales = JSON.parse(result.data.solicitud.orden_materiales)
          setMaterialesOrden(Array.isArray(materiales) ? materiales : [])
        } catch {
          setMaterialesOrden([])
        }
      } else {
        setMaterialesOrden([])
      }
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
    const actual = fases[idx]
    if (!actual) return

    // Una fase completada no retrocede: es el registro de un trabajo ya hecho.
    if (actual.estado === "completado") {
      setError("Esa fase ya está completada y no se puede devolver a pendiente.")
      return
    }

    const siguiente =
      actual.estado === "en_proceso" ? "completado" : "en_proceso"

    const updated = fases.map((fase, i) => {
      if (i !== idx) return fase
      return {
        ...fase,
        estado: siguiente,
        // Al cerrar la fase se sella la fecha y el responsable; si el
        // administrador ya los había puesto, se respetan.
        fecha_finalizacion:
          siguiente === "completado" ? fase.fecha_finalizacion || hoyISO() : fase.fecha_finalizacion,
        realizada_por:
          siguiente === "completado" ? fase.realizada_por || empleadoNombre : fase.realizada_por,
      }
    })

    setSaving(true)
    try {
      await guardarFases(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la fase.")
    } finally {
      setSaving(false)
    }
  }

  const handleFechaTerminacion = async (idx: number, fecha: string) => {
    if (!data) return
    const fases = parseFases(data.solicitud.orden_fases)
    if (!fases[idx]) return

    const updated = fases.map((fase, i) =>
      i === idx ? { ...fase, fecha_finalizacion: fecha } : fase
    )

    setSaving(true)
    try {
      await guardarFases(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la fecha.")
    } finally {
      setSaving(false)
    }
  }

  const handleAgregarFase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data) return

    const fases = parseFases(data.solicitud.orden_fases)
    const completada = nuevaFase.estado === "completado"

    const fase: FaseProceso = {
      tipo: nuevaFase.tipo,
      estado: nuevaFase.estado,
      // Si la fase nace terminada, se sellan fecha y responsable para que no
      // quede un registro de trabajo sin quién lo hizo.
      fecha_finalizacion: completada
        ? nuevaFase.fecha_finalizacion || hoyISO()
        : "",
      realizada_por: completada
        ? nuevaFase.realizada_por || empleadoNombre
        : nuevaFase.realizada_por,
      fecha_prueba: "",
    }

    setSaving(true)
    try {
      await guardarFases([...fases, fase])
      setNuevaFase({ tipo: "", estado: "pendiente", realizada_por: "", fecha_finalizacion: "" })
      setMostrandoFormFase(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar la fase.")
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
            <InfoRow label="CC">
              {s.cc_odontologo || cliente?.documento || "-"}
            </InfoRow>
            <InfoRow label="Tarjeta profesional">
              {s.odontologo_tarjeta_profesional || "-"}
            </InfoRow>
            <InfoRow label="Registro médico">
              {s.odontologo_registro_medico || "-"}
            </InfoRow>
            <InfoRow label="Correo">
              {(s.odontologo_correo || cliente?.correo) ? (
                <a
                  href={`mailto:${s.odontologo_correo || cliente?.correo}`}
                  className="text-primary hover:underline"
                >
                  {s.odontologo_correo || cliente?.correo}
                </a>
              ) : (
                "-"
              )}
            </InfoRow>
            <InfoRow label="Teléfono">
              {(s.odontologo_telefono || cliente?.telefono) ? (
                <a
                  href={`https://wa.me/${(s.odontologo_telefono || cliente?.telefono || "").replace(/\D/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {s.odontologo_telefono || cliente?.telefono}
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
              {s.dientes_detallados.length > 0
                ? s.dientes_detallados
                    .map((d) => `#${d.numero}${d.tipoTrabajo ? ` (${d.tipoTrabajo})` : ""}`)
                    .join(", ")
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
              <div className="flex items-center gap-2">
                {saving && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Guardando...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMostrandoFormFase((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3.5" />
                  Agregar fase
                </button>
              </div>
            </div>

            {mostrandoFormFase && (
              <form
                onSubmit={handleAgregarFase}
                className="mb-4 rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="fase-tipo"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Tipo
                    </label>
                    <select
                      id="fase-tipo"
                      required
                      value={nuevaFase.tipo}
                      onChange={(e) => setNuevaFase({ ...nuevaFase, tipo: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="">Selecciona la fase...</option>
                      {FASES_PROCESO.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="fase-estado"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Estado
                    </label>
                    <select
                      id="fase-estado"
                      value={nuevaFase.estado}
                      onChange={(e) => setNuevaFase({ ...nuevaFase, estado: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="fase-realizada"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Realizada por
                    </label>
                    <input
                      id="fase-realizada"
                      type="text"
                      value={nuevaFase.realizada_por}
                      onChange={(e) =>
                        setNuevaFase({ ...nuevaFase, realizada_por: e.target.value })
                      }
                      placeholder={empleadoNombre || "Nombre"}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fase-fecha"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Fecha finalización
                    </label>
                    <input
                      id="fase-fecha"
                      type="date"
                      value={nuevaFase.fecha_finalizacion}
                      onChange={(e) =>
                        setNuevaFase({ ...nuevaFase, fecha_finalizacion: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrandoFormFase(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !nuevaFase.tipo}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    Guardar fase
                  </button>
                </div>
              </form>
            )}

            {parseFases(s.orden_fases).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin guía de fabricación registrada.</p>
            ) : (
              <ul className="space-y-3">
                {parseFases(s.orden_fases).map((fase, idx) => {
                  const estado = fase.estado || "pendiente"
                  const isActual = estado === "en_proceso"
                  const completada = estado === "completado"
                  const siguiente = estado === "en_proceso" ? "completado" : "en_proceso"
                  return (
                    <li
                      key={idx}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3",
                        completada && "border-green-200 bg-green-50/40"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            isActual
                              ? "bg-primary/10 text-primary"
                              : completada
                                ? "bg-green-500/10 text-green-600"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {completada ? <CheckCircle className="size-3.5" /> : idx + 1}
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

                      {completada ? (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-medium text-green-700">
                            <CheckCircle className="size-3" />
                            Completado
                          </span>
                          <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            Terminada
                            <input
                              type="date"
                              value={fase.fecha_finalizacion || ""}
                              disabled={saving}
                              onChange={(e) => handleFechaTerminacion(idx, e.target.value)}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
                            />
                          </label>
                          {fase.realizada_por && (
                            <span className="text-[11px] text-muted-foreground">
                              por {fase.realizada_por}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleAdvanceFase(idx)}
                          title={`Avanzar a ${statusLabels[siguiente] || siguiente}`}
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium capitalize transition-colors",
                            estado === "en_proceso"
                              ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "border border-border bg-background text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {statusLabels[estado] || estado}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Avanza el progreso de cada fase (Pendiente → En proceso → Completado). Al completarla
              se registra la fecha de terminación y tu nombre; las fases ya terminadas se conservan y
              solo puedes corregir su fecha.
            </p>
          </div>

          {/* Materiales de la Orden de Fabricación */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                <h2 className="font-semibold text-foreground">Materiales de la Orden de Fabricación</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead className="bg-muted">
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Material</th>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 font-medium">Número de lote</th>
                    <th className="px-3 py-2 font-medium">Fabricante</th>
                    <th className="px-3 py-2 font-medium">Proveedor</th>
                    <th className="px-3 py-2 font-medium text-center w-16">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materialesOrden.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                        Sin materiales registrados
                      </td>
                    </tr>
                  ) : (
                    materialesOrden.map((mat, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={mat.material}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setMaterialesOrden((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, material: newVal } : m))
                              )
                            }}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="Material"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={mat.producto}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setMaterialesOrden((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, producto: newVal } : m))
                              )
                            }}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="Producto"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={mat.lote}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setMaterialesOrden((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, lote: newVal } : m))
                              )
                            }}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="N° Lote"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={mat.fabricante}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setMaterialesOrden((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, fabricante: newVal } : m))
                              )
                            }}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="Fabricante"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={mat.proveedor}
                            onChange={(e) => {
                              const newVal = e.target.value
                              setMaterialesOrden((prev) =>
                                prev.map((m, i) => (i === idx ? { ...m, proveedor: newVal } : m))
                              )
                            }}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="Proveedor"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            disabled={savingMateriales}
                            onClick={() => {
                              setMaterialesOrden((prev) => prev.filter((_, i) => i !== idx))
                            }}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            title="Eliminar material"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMaterialesOrden((prev) => [
                    ...prev,
                    { material: "", producto: "", lote: "", fabricante: "", proveedor: "" },
                  ])
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="size-3.5" />
                Agregar material
              </button>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={savingMateriales || materialesOrden.length === 0}
                onClick={async () => {
                  setSavingMateriales(true)
                  try {
                    await guardarMateriales(materialesOrden)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error al guardar los materiales.")
                  } finally {
                    setSavingMateriales(false)
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {savingMateriales && <Loader2 className="size-3 animate-spin" />}
                {savingMateriales ? "Guardando..." : "Guardar materiales"}
              </button>
            </div>
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
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Diente</th>
                      <th className="px-3 py-2 font-medium">Tipo de trabajo</th>
                      <th className="px-3 py-2 font-medium">Servicio</th>
                      <th className="px-3 py-2 font-medium">Material</th>
                      <th className="px-3 py-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.dientes_detallados.map((d, idx) => (
                      <tr
                        key={`${d.numero}-${idx}`}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2 font-semibold text-foreground">
                          {d.numero}
                        </td>
                        <td className="px-3 py-2 break-words">{d.tipoTrabajo || "-"}</td>
                        <td className="px-3 py-2 break-words">{d.servicio || "-"}</td>
                        <td className="px-3 py-2 break-words">{d.material || "-"}</td>
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
