"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Package,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  Loader2,
  Eye,
  FileText,
  Upload,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Cliente {
  id: number
  nombre: string
  tipo: string
  documento: string
  correo: string
  telefono: string
  clinica: string
  created_at: string
}

interface Solicitud {
  id: number
  servicio: string
  estado: string
  created_at: string
  observaciones: string
  urls_documentos: string[]
  precio: number | null
  cliente_id: number
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  historia_clinica: string | null
  odontologo: string | null
  cc_odontologo: string | null
  paciente: string | null
  cc_paciente: string | null
  direccion: string | null
  firma: string | null
  tipos_trabajo: string[] | null
  materiales: string[] | null
  chimenea: string | null
  prueba: string | null
  terminado: string | null
  color: string | null
  guia: string | null
  piezas_enviadas: string[] | null
  caja: string | null
  codigo_trazabilidad: string | null
}

interface Servicio {
  id: number
  nombre: string
  descripcion: string
  precio: number | null
  cantidad: number
  created_at: string
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
}

export default function ClientePerfilPage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<Cliente | null>(null)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [serviciosDetalle, setServiciosDetalle] = useState<Servicio[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [servicioDocs, setServicioDocs] = useState<Record<number, { declaracion_conformidad: File | null; guia_fabricacion: File | null; manual_uso: File | null }>>({})
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadClient = async () => {
      const numericId = parseInt(id)
      if (isNaN(numericId)) {
        setError("ID de cliente inválido")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", numericId)
        .single()

      if (error) {
        setError("Cliente no encontrado")
      } else {
        setClient(data)
      }
      setLoading(false)
    }

    loadClient()
  }, [id])

  useEffect(() => {
    const loadSolicitudes = async () => {
      if (!id) return
      setLoadingSolicitudes(true)
      const numericId = parseInt(id)
      if (isNaN(numericId)) {
        setLoadingSolicitudes(false)
        return
      }

      try {
        const response = await fetch(`/api/solicitudes?cliente_id=${numericId}`)
        if (response.ok) {
          const result = await response.json()
          const data = result.data || []
          setSolicitudes(data)
        }
      } catch (err) {
        console.error("Error cargando solicitudes del cliente:", err)
      } finally {
        setLoadingSolicitudes(false)
      }
    }

    loadSolicitudes()
  }, [id])

  const handleVerSolicitud = async (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setLoadingDetalle(true)
    try {
      const response = await fetch(`/api/solicitudes/${solicitud.id}`)
      if (response.ok) {
        const result = await response.json()
        setServiciosDetalle(result.data?.servicios || [])
      }
    } catch (err) {
      console.error("Error cargando detalle de solicitud:", err)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleCerrarDetalle = () => {
    setSelectedSolicitud(null)
    setServiciosDetalle([])
    setServicioDocs({})
  }

  const handleDocChange = (servicioId: number, campo: "declaracion_conformidad" | "guia_fabricacion" | "manual_uso", archivo: File) => {
    setServicioDocs((prev) => ({
      ...prev,
      [servicioId]: {
        ...(prev[servicioId] || { declaracion_conformidad: null, guia_fabricacion: null, manual_uso: null }),
        [campo]: archivo,
      },
    }))
  }

  const handleUploadDoc = async (servicioId: number, campo: "declaracion_conformidad" | "guia_fabricacion" | "manual_uso") => {
    const archivo = servicioDocs[servicioId]?.[campo]
    if (!archivo) return

    const uploadKey = `${servicioId}-${campo}`
    setUploadingDoc((prev) => ({ ...prev, [uploadKey]: true }))

    try {
      const formData = new FormData()
      formData.append("tipo", campo)
      formData.append("archivo", archivo)

      const response = await fetch(`/api/servicios/${servicioId}/documentos`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: "Error al subir documento" }))
        throw new Error(result.message || "Error al subir documento")
      }

      const result = await response.json()
      setServiciosDetalle((prev) => prev.map((s) => (s.id === servicioId ? result.data : s)))

    } catch (err) {
      console.error("Error subiendo documento:", err)
      alert(err instanceof Error ? err.message : "No se pudo subir el documento.")
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  const formatEstado = (estado: string) => {
    return estado
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getEstadoStyle = (estado: string) => {
    const styles: Record<string, string> = {
      pendiente: "bg-amber-100 text-amber-700",
      en_proceso: "bg-blue-100 text-blue-700",
      aprobado: "bg-green-100 text-green-700",
      completado: "bg-primary/10 text-primary",
      cancelado: "bg-red-100 text-red-700",
    }
    return styles[estado] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Users size={48} className="text-muted-foreground" />
        </motion.div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Cliente no encontrado</h2>
        <p className="mb-6 text-muted-foreground max-w-xl">
          El cliente que estás buscando no existe o ha sido eliminado.
        </p>
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Users size={18} />
          Volver a Clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{client.nombre}</h1>
          <p className="text-muted-foreground">
            Perfil del cliente
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Users size={18} />
            Volver a Clientes
          </Link>
        </div>
      </div>

      {/* Client Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {client.nombre.charAt(0)}
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">{client.nombre}</h2>
                <p className="text-muted-foreground">
                  {client.clinica}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} />
                <span>{client.correo}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} />
                <span>{client.telefono}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building2 size={16} />
                <span>
                  {client.tipo.toUpperCase()}: {client.documento}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle size={16} />
                <span className="text-green-600">
                  Activo
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Fecha Registro</p>
                <p className="font-semibold text-foreground">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Solicitudes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Solicitudes del Cliente
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
                  Servicio
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
                <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingSolicitudes ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Este cliente aún no tiene solicitudes registradas.
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      SOL-{String(solicitud.id).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {solicitud.servicio || "Sin descripción"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoStyle(solicitud.estado)}`}
                      >
                        {formatEstado(solicitud.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(solicitud.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                      {solicitud.precio ? `$${solicitud.precio.toLocaleString("es-CO")}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleVerSolicitud(solicitud)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Detalle de Solicitud */}
      {selectedSolicitud && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCerrarDetalle}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#7cb342] text-white p-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-wider">ARTE CERÁMICO</h3>
                <p className="text-xs italic opacity-90">Laboratorio Dental S.A.S</p>
              </div>
              <button
                onClick={handleCerrarDetalle}
                className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Número de Solicitud y Estado */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Nº Solicitud</p>
                  <p className="text-sm font-bold text-gray-800">SOL-{String(selectedSolicitud.id).padStart(3, "0")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Estado</p>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoStyle(selectedSolicitud.estado)}`}>
                    {formatEstado(selectedSolicitud.estado)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Fecha</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedSolicitud.created_at).toLocaleDateString("es-CO", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Datos del Odontólogo y Paciente */}
            <div className="p-4 border-b border-gray-200 space-y-2 text-xs">
              {(selectedSolicitud as any).odontologo && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">ODONTÓLOGO(A):</span>
                    <span className="text-sm text-gray-800">{((selectedSolicitud as any).odontologo as string) || "-"}</span>
                  </div>
                </div>
              )}
              {(selectedSolicitud as any).cc_odontologo && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">CC. ODONTÓLOGO:</span>
                    <span className="text-sm text-gray-800">{((selectedSolicitud as any).cc_odontologo as string) || "-"}</span>
                  </div>
                </div>
              )}
              {(selectedSolicitud as any).paciente && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">PACIENTE:</span>
                    <span className="text-sm text-gray-800">{((selectedSolicitud as any).paciente as string) || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1 w-32">
                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">CC.:</span>
                    <span className="text-sm text-gray-800">{((selectedSolicitud as any).cc_paciente as string) || "-"}</span>
                  </div>
                </div>
              )}
              {(selectedSolicitud as any).direccion && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">DIRECCIÓN:</span>
                  <span className="text-sm text-gray-800">{((selectedSolicitud as any).direccion as string) || "-"}</span>
                </div>
              )}
              {(selectedSolicitud as any).firma && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">FIRMA:</span>
                  <span className="text-sm text-gray-800">{((selectedSolicitud as any).firma as string) || "-"}</span>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Fecha Elaboración</p>
                  <p className="text-sm font-medium text-gray-800">{(selectedSolicitud as any).fecha_elaboracion || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Fecha Entrega</p>
                  <p className="text-sm font-medium text-gray-800">{(selectedSolicitud as any).fecha_entrega || "-"}</p>
                </div>
              </div>
              {(selectedSolicitud as any).historia_clinica && (
                <div className="mt-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Historia Clínica</p>
                  <p className="text-sm font-medium text-gray-800">{(selectedSolicitud as any).historia_clinica}</p>
                </div>
              )}
            </div>

            {/* Servicio Solicitado */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Servicio Solicitado</h4>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                {selectedSolicitud.servicio || "Sin descripción"}
              </p>
            </div>

            {/* Tipo de Trabajo y Materiales */}
            {(selectedSolicitud as any).tipos_trabajo?.length > 0 || (selectedSolicitud as any).materiales?.length > 0 ? (
              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {(selectedSolicitud as any).tipos_trabajo?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Tipo de Trabajo</h4>
                      <div className="flex flex-wrap gap-1">
                        {((selectedSolicitud as any).tipos_trabajo as string[]).map((tipo, i) => (
                          <span key={i} className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            {tipo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedSolicitud as any).materiales?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Materiales</h4>
                      <div className="flex flex-wrap gap-1">
                        {((selectedSolicitud as any).materiales as string[]).map((mat, i) => (
                          <span key={i} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Opciones Adicionales */}
            {(selectedSolicitud as any).chimenea === "Si" || (selectedSolicitud as any).prueba === "Si" || (selectedSolicitud as any).terminado === "Si" || (selectedSolicitud as any).color || (selectedSolicitud as any).guia || (selectedSolicitud as any).piezas_enviadas?.length > 0 || (selectedSolicitud as any).caja || (selectedSolicitud as any).codigo_trazabilidad ? (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Detalles Adicionales</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {(selectedSolicitud as any).chimenea === "Si" && (
                    <div><span className="text-gray-500">Chimenea:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).chimenea}</span></div>
                  )}
                  {(selectedSolicitud as any).prueba === "Si" && (
                    <div><span className="text-gray-500">Prueba:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).prueba}</span></div>
                  )}
                  {(selectedSolicitud as any).terminado === "Si" && (
                    <div><span className="text-gray-500">Terminado:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).terminado}</span></div>
                  )}
                  {(selectedSolicitud as any).color && (
                    <div><span className="text-gray-500">Color:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).color}</span></div>
                  )}
                  {(selectedSolicitud as any).guia && (
                    <div><span className="text-gray-500">Guía:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).guia}</span></div>
                  )}
                  {(selectedSolicitud as any).caja && (
                    <div><span className="text-gray-500">Caja:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).caja}</span></div>
                  )}
                  {(selectedSolicitud as any).codigo_trazabilidad && (
                    <div><span className="text-gray-500">Cód. Trazabilidad:</span> <span className="text-gray-800 font-medium">{(selectedSolicitud as any).codigo_trazabilidad}</span></div>
                  )}
                </div>
                {(selectedSolicitud as any).piezas_enviadas?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Piezas Enviadas</p>
                    <div className="flex flex-wrap gap-1">
                      {((selectedSolicitud as any).piezas_enviadas as string[]).map((pieza, i) => (
                        <span key={i} className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                          {pieza}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Observaciones */}
            {selectedSolicitud.observaciones && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Indicaciones / Observaciones</h4>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                  {selectedSolicitud.observaciones}
                </p>
              </div>
            )}

            {/* Servicios Vinculados */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Trabajos / Servicios Vinculados</h4>
              {loadingDetalle ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </div>
              ) : serviciosDetalle.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay trabajos adicionales registrados.</p>
              ) : (
                <div className="space-y-2">
                  {serviciosDetalle.map((servicio, idx) => (
                    <div key={servicio.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{idx + 1}. {servicio.nombre}</p>
                        {servicio.descripcion && <p className="text-xs text-gray-600 mt-0.5">{servicio.descripcion}</p>}

                        <div className="mt-2 space-y-1">
                          {(["declaracion_conformidad", "guia_fabricacion", "manual_uso"] as const).map((campo) => {
                            const etiqueta =
                              campo === "declaracion_conformidad"
                                ? "Declaración de Conformidad"
                                : campo === "guia_fabricacion"
                                  ? "Guía de Fabricación"
                                  : "Manual de Uso"
                            const url =
                              campo === "declaracion_conformidad"
                                ? servicio.declaracion_conformidad
                                : campo === "guia_fabricacion"
                                  ? servicio.guia_fabricacion
                                  : servicio.manual_uso

                            return (
                              <div key={campo} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-gray-500 shrink-0" />
                                  {url ? (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {etiqueta}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-500">{etiqueta}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    className="hidden"
                                    id={`${servicio.id}-${campo}`}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleDocChange(servicio.id, campo, file)
                                    }}
                                  />
                                  <label
                                    htmlFor={`${servicio.id}-${campo}`}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                                  >
                                    <Upload size={12} />
                                    {url ? "Reemplazar" : "Adjuntar"}
                                  </label>
                                  {(servicioDocs[servicio.id]?.[campo] || url) && (
                                    <button
                                      onClick={() => handleUploadDoc(servicio.id, campo)}
                                      disabled={uploadingDoc[`${servicio.id}-${campo}`]}
                                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                                    >
                                      {uploadingDoc[`${servicio.id}-${campo}`] ? (
                                        <>
                                          <Loader2 size={12} className="animate-spin" />
                                          Guardando
                                        </>
                                      ) : (
                                        "Guardar"
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-gray-800">{servicio.precio ? `$${servicio.precio.toLocaleString("es-CO")}` : "-"}</p>
                        <p className="text-[10px] text-gray-500">Cant: {servicio.cantidad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documentos Adjuntos */}
            {selectedSolicitud.urls_documentos && selectedSolicitud.urls_documentos.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Documentos Adjuntos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSolicitud.urls_documentos.map((url, index) => {
                    const fileName = url.split('/').pop() || `Documento ${index + 1}`
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={fileName}
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <FileText size={16} className={`shrink-0 ${isImage ? 'hidden' : ''}`} />
                        <span className="truncate">{fileName}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={handleCerrarDetalle}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
