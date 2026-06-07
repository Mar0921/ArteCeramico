"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  ImageIcon,
  Paperclip,
  Calendar,
  User,
  Stethoscope,
  Package,
  Upload,
  Eye,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Cliente {
  id: number
  nombre: string
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
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  historia_clinica: string | null
  odontologo: string | null
  paciente: string | null
  tipos_trabajo: string[] | null
  materiales: string[] | null
  chimenea: string | null
  prueba: string | null
  terminado: string | null
  color: string | null
  piezas_enviadas: string[] | null
  caja: string | null
  codigo_trazabilidad: string | null
  dientes_trabajados: string[] | null
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
}

interface ClienteConSolicitudes extends Cliente {
  solicitudes: Solicitud[]
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<ClienteConSolicitudes[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCliente, setExpandedCliente] = useState<number | null>(null)
  const [expandedSolicitud, setExpandedSolicitud] = useState<{ [key: number]: boolean }>({})
  const [loadingSolicitudes, setLoadingSolicitudes] = useState<{ [key: number]: boolean }>({})
  const [loadingServicios, setLoadingServicios] = useState<{ [key: number]: boolean }>({})
  const [serviciosPorSolicitud, setServiciosPorSolicitud] = useState<{ [key: number]: any[] }>({})
  const [solicitudDocs, setSolicitudDocs] = useState<Record<number, { 
    declaracion_conformidad: File | null
    guia_fabricacion: File | null
    manual_uso: File | null 
  }>>({})
  const [uploadingSolicitudDoc, setUploadingSolicitudDoc] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        const clientesConSolicitudes = (data as Cliente[]).map((cliente) => ({
          ...cliente,
          solicitudes: [],
        }))
        setClientes(clientesConSolicitudes as ClienteConSolicitudes[])
      }
      setLoading(false)
    }

    loadClients()
  }, [])

  const toggleCliente = async (clienteId: number) => {
    if (expandedCliente === clienteId) {
      setExpandedCliente(null)
      return
    }

    setExpandedCliente(clienteId)

    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return

    if (cliente.solicitudes.length === 0 && !loadingSolicitudes[clienteId]) {
      setLoadingSolicitudes((prev) => ({ ...prev, [clienteId]: true }))

      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      const solicitudes = !error && data ? (data as Solicitud[]) : []
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteId ? { ...c, solicitudes } : c))
      )
      setLoadingSolicitudes((prev) => ({ ...prev, [clienteId]: false }))
    }
  }

  const toggleSolicitud = async (solicitudId: number) => {
    const isExpanding = !expandedSolicitud[solicitudId]

    setExpandedSolicitud((prev) => ({
      ...prev,
      [solicitudId]: !prev[solicitudId],
    }))

    if (isExpanding && !serviciosPorSolicitud[solicitudId]) {
      setLoadingServicios((prev) => ({ ...prev, [solicitudId]: true }))

      try {
        const response = await fetch(`/api/solicitudes/${solicitudId}`)
        if (response.ok) {
          const result = await response.json()
          setServiciosPorSolicitud((prev) => ({
            ...prev,
            [solicitudId]: result.data?.servicios || []
          }))
        }
      } catch (error) {
        console.error("Error cargando servicios:", error)
      }
      setLoadingServicios((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const handleSolicitudDocChange = (
    solicitudId: number, 
    campo: "declaracion_conformidad" | "guia_fabricacion" | "manual_uso", 
    archivo: File
  ) => {
    setSolicitudDocs((prev) => ({
      ...prev,
      [solicitudId]: {
        ...(prev[solicitudId] || { declaracion_conformidad: null, guia_fabricacion: null, manual_uso: null }),
        [campo]: archivo,
      },
    }))
    
    // Limpiar errores previos
    const errorKey = `${solicitudId}-${campo}`
    setUploadError((prev) => {
      const newErrors = { ...prev }
      delete newErrors[errorKey]
      return newErrors
    })
    setUploadSuccess((prev) => {
      const newSuccess = { ...prev }
      delete newSuccess[errorKey]
      return newSuccess
    })
  }

  const handleUploadSolicitudDoc = async (
    solicitudId: number, 
    campo: "declaracion_conformidad" | "guia_fabricacion" | "manual_uso"
  ) => {
    const archivo = solicitudDocs[solicitudId]?.[campo]
    if (!archivo) return

    const uploadKey = `${solicitudId}-${campo}`
    setUploadingSolicitudDoc((prev) => ({ ...prev, [uploadKey]: true }))
    setUploadError((prev) => {
      const newErrors = { ...prev }
      delete newErrors[uploadKey]
      return newErrors
    })
    setUploadSuccess((prev) => {
      const newSuccess = { ...prev }
      delete newSuccess[uploadKey]
      return newSuccess
    })

    try {
      const formData = new FormData()
      formData.append("tipo", campo)
      formData.append("archivo", archivo)

      const response = await fetch(`/api/solicitudes/${solicitudId}/documentos`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir documento")
      }

      const result = await response.json()

      // Actualizar la solicitud con la nueva URL del documento
      setClientes((prev) =>
        prev.map((cliente) => ({
          ...cliente,
          solicitudes: cliente.solicitudes.map((s) =>
            s.id === solicitudId
              ? { ...s, [campo]: result.url }
              : s
          ),
        }))
      )

      // Limpiar el archivo seleccionado y mostrar éxito
      setSolicitudDocs((prev) => ({
        ...prev,
        [solicitudId]: {
          ...(prev[solicitudId] || { declaracion_conformidad: null, guia_fabricacion: null, manual_uso: null }),
          [campo]: null,
        },
      }))
      
      setUploadSuccess((prev) => ({ ...prev, [uploadKey]: true }))
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setUploadSuccess((prev) => {
          const newSuccess = { ...prev }
          delete newSuccess[uploadKey]
          return newSuccess
        })
      }, 3000)

    } catch (err) {
      console.error("Error subiendo documento:", err)
      setUploadError((prev) => ({ 
        ...prev, 
        [uploadKey]: err instanceof Error ? err.message : "Error al subir documento"
      }))
    } finally {
      setUploadingSolicitudDoc((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.clinica?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const esImagen = (url: string) => url.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)$/i)
  const esDocumento = (url: string) => url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes y sus solicitudes
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l-2 2l3 3"></path>
            </svg>
            Volver al Dashboard
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark">
            <Plus size={18} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClientes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay clientes registrados</p>
          </div>
        ) : (
          filteredClientes.map((cliente) => {
            const isClienteExpanded = expandedCliente === cliente.id

            return (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Client Card Header - Clickable */}
                <div
                  className="p-5 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCliente(cliente.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {cliente.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{cliente.nombre}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail size={12} />
                            {cliente.correo}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone size={12} />
                            {cliente.telefono}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clínica: {cliente.clinica}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Activo
                      </span>
                      {isClienteExpanded ? (
                        <ChevronUp size={20} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={20} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Solicitudes del cliente */}
                <AnimatePresence>
                  {isClienteExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border bg-muted/20"
                    >
                      <div className="p-5">
                        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Package size={16} />
                          Solicitudes de Servicio ({cliente.solicitudes.length})
                        </h4>

                        {loadingSolicitudes[cliente.id] ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : cliente.solicitudes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Sin solicitudes registradas
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {cliente.solicitudes.map((solicitud) => {
                              const isSolicitudExpanded = expandedSolicitud[solicitud.id] || false

                              return (
                                <div
                                  key={solicitud.id}
                                  className="rounded-xl border border-border bg-white overflow-hidden"
                                >
                                  {/* Clickable header de solicitud */}
                                  <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleSolicitud(solicitud.id)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-foreground text-sm">
                                          {solicitud.servicio}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                                            {solicitud.estado.replace("_", " ")}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(solicitud.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {solicitud.precio && (
                                          <span className="text-sm font-bold text-primary">
                                            ${solicitud.precio?.toLocaleString()}
                                          </span>
                                        )}
                                        {isSolicitudExpanded ? (
                                          <ChevronUp size={18} className="text-muted-foreground" />
                                        ) : (
                                          <ChevronDown size={18} className="text-muted-foreground" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detalles expandidos de la solicitud */}
                                  <AnimatePresence>
                                    {isSolicitudExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-border bg-gray-50"
                                      >
                                        <div className="p-4">
                                          {/* Datos principales */}
                                          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                            {solicitud.historia_clinica && (
                                              <div>
                                                <span className="text-gray-500">Historia Clínica:</span>
                                                <span className="ml-1 font-medium text-gray-800">
                                                  #{solicitud.historia_clinica}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.fecha_elaboracion && (
                                              <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" />
                                                <span className="text-gray-500">Elaboración:</span>
                                                <span className="font-medium text-gray-800">
                                                  {solicitud.fecha_elaboracion}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.fecha_entrega && (
                                              <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" />
                                                <span className="text-gray-500">Entrega:</span>
                                                <span className="font-medium text-gray-800">
                                                  {solicitud.fecha_entrega}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.odontologo && (
                                              <div className="flex items-center gap-1">
                                                <User size={12} className="text-gray-400" />
                                                <span className="text-gray-500">Dr(a):</span>
                                                <span className="font-medium text-gray-800">
                                                  {solicitud.odontologo}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.paciente && (
                                              <div className="flex items-center gap-1">
                                                <Stethoscope size={12} className="text-gray-400" />
                                                <span className="text-gray-500">Paciente:</span>
                                                <span className="font-medium text-gray-800">
                                                  {solicitud.paciente}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.caja && (
                                              <div>
                                                <span className="text-gray-500">Caja:</span>
                                                <span className="ml-1 font-medium text-gray-800">
                                                  #{solicitud.caja}
                                                </span>
                                              </div>
                                            )}
                                            {solicitud.codigo_trazabilidad && (
                                              <div>
                                                <span className="text-gray-500">Cód. Trazabilidad:</span>
                                                <span className="ml-1 font-medium text-gray-800">
                                                  #{solicitud.codigo_trazabilidad}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Opciones adicionales */}
                                          {(solicitud.chimenea === "Si" || solicitud.prueba === "Si" || solicitud.terminado === "Si" || solicitud.color || (solicitud.dientes_trabajados && solicitud.dientes_trabajados.length > 0)) && (
                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3 p-2 bg-white rounded border border-gray-200">
                                              {solicitud.chimenea === "Si" && (
                                                <div>
                                                  <span className="text-gray-500">Chimenea:</span>
                                                  <span className="ml-1 font-medium text-gray-800">{solicitud.chimenea}</span>
                                                </div>
                                              )}
                                              {solicitud.prueba === "Si" && (
                                                <div>
                                                  <span className="text-gray-500">Prueba:</span>
                                                  <span className="ml-1 font-medium text-gray-800">{solicitud.prueba}</span>
                                                </div>
                                              )}
                                              {solicitud.terminado === "Si" && (
                                                <div>
                                                  <span className="text-gray-500">Terminado:</span>
                                                  <span className="ml-1 font-medium text-gray-800">{solicitud.terminado}</span>
                                                </div>
                                              )}
                                              {solicitud.color && (
                                                <div>
                                                  <span className="text-gray-500">Color:</span>
                                                  <span className="ml-1 font-medium text-gray-800">{solicitud.color}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Tipos de trabajo */}
                                          {solicitud.tipos_trabajo && solicitud.tipos_trabajo.length > 0 && (
                                            <div className="mb-3">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                                                Tipos de Trabajo
                                              </p>
                                              <div className="flex flex-wrap gap-1">
                                                {solicitud.tipos_trabajo.map((tipo, i) => (
                                                  <span
                                                    key={i}
                                                    className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                                                  >
                                                    {tipo}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Materiales */}
                                          {solicitud.materiales && solicitud.materiales.length > 0 && (
                                            <div className="mb-3">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                                                Materiales
                                              </p>
                                              <div className="flex flex-wrap gap-1">
                                                {solicitud.materiales.map((mat, i) => (
                                                  <span
                                                    key={i}
                                                    className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700"
                                                  >
                                                    {mat}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Dientes trabajados */}
                                          {solicitud.dientes_trabajados && solicitud.dientes_trabajados.length > 0 && (
                                            <div className="mb-3">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                                                Dientes Trabajados
                                              </p>
                                              <div className="flex flex-wrap gap-1">
                                                {solicitud.dientes_trabajados.map((diente, i) => (
                                                  <span
                                                    key={i}
                                                    className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700"
                                                  >
                                                    #{diente}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Piezas enviadas */}
                                          {solicitud.piezas_enviadas && solicitud.piezas_enviadas.length > 0 && (
                                            <div className="mb-3">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                                                Piezas Enviadas
                                              </p>
                                              <div className="flex flex-wrap gap-1">
                                                {solicitud.piezas_enviadas.map((pieza, i) => (
                                                  <span
                                                    key={i}
                                                    className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700"
                                                  >
                                                    {pieza}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Observaciones */}
                                          {solicitud.observaciones && (
                                            <div className="mb-3">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                                                Observaciones
                                              </p>
                                              <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                                                {solicitud.observaciones}
                                              </p>
                                            </div>
                                          )}

                                          {/* Documentos de la solicitud (Declaración, Guía, Manual) */}
                                          <div className="mb-4">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                              Documentos de la Solicitud
                                            </p>
                                            <div className="space-y-2">
                                              {(["declaracion_conformidad", "guia_fabricacion", "manual_uso"] as const).map((campo) => {
                                                const etiqueta =
                                                  campo === "declaracion_conformidad"
                                                    ? "Declaración de Conformidad"
                                                    : campo === "guia_fabricacion"
                                                      ? "Guía de Fabricación"
                                                      : "Manual de Uso"
                                                
                                                const urlActual = solicitud[campo]
                                                const uploadKey = `${solicitud.id}-${campo}`
                                                const error = uploadError[uploadKey]
                                                const success = uploadSuccess[uploadKey]

                                                return (
                                                  <div key={campo} className="p-2 bg-white rounded border border-gray-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <FileText size={14} className="text-muted-foreground shrink-0" />
                                                        {urlActual ? (
                                                          <a
                                                            href={urlActual}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-primary hover:underline truncate"
                                                          >
                                                            {etiqueta}
                                                          </a>
                                                        ) : (
                                                          <span className="text-[10px] text-muted-foreground truncate">
                                                            {etiqueta} - No subido
                                                          </span>
                                                        )}
                                                        {success && (
                                                          <CheckCircle size={12} className="text-green-500 shrink-0" />
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-2 shrink-0">
                                                        <input
                                                          type="file"
                                                          className="hidden"
                                                          id={`solicitud-${solicitud.id}-${campo}`}
                                                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                                          onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleSolicitudDocChange(solicitud.id, campo, file)
                                                          }}
                                                        />
                                                        <label
                                                          htmlFor={`solicitud-${solicitud.id}-${campo}`}
                                                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                                                        >
                                                          <Upload size={12} />
                                                          {solicitudDocs[solicitud.id]?.[campo] 
                                                            ? solicitudDocs[solicitud.id]?.[campo]?.name.substring(0, 15) + "..." 
                                                            : urlActual 
                                                              ? "Reemplazar" 
                                                              : "Adjuntar"
                                                          }
                                                        </label>
                                                        {solicitudDocs[solicitud.id]?.[campo] && (
                                                          <button
                                                            onClick={() => handleUploadSolicitudDoc(solicitud.id, campo)}
                                                            disabled={uploadingSolicitudDoc[uploadKey]}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                                                          >
                                                            {uploadingSolicitudDoc[uploadKey] ? (
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
                                                    {error && (
                                                      <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600">
                                                        <AlertCircle size={12} />
                                                        {error}
                                                      </div>
                                                    )}
                                                    {success && (
                                                      <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600">
                                                        <CheckCircle size={12} />
                                                        Documento subido correctamente
                                                      </div>
                                                    )}
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>

                                          {/* Documentos adjuntos generales */}
                                          {solicitud.urls_documentos && solicitud.urls_documentos.length > 0 && (
                                            <div className="mb-4">
                                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                                Documentos Adjuntos ({solicitud.urls_documentos.length})
                                              </p>
                                              <div className="grid grid-cols-3 gap-2">
                                                {solicitud.urls_documentos.map((url, docIndex) => {
                                                  const esImg = esImagen(url)
                                                  const esDoc = esDocumento(url)

                                                  if (esImg) {
                                                    return (
                                                      <div
                                                        key={docIndex}
                                                        className="overflow-hidden rounded-lg border border-border bg-white"
                                                      >
                                                        <a
                                                          href={url}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="block"
                                                        >
                                                          <img
                                                            src={url}
                                                            alt={`Adjunto ${docIndex + 1}`}
                                                            className="h-24 w-full object-cover"
                                                          />
                                                        </a>
                                                        <div className="p-1.5 flex items-center justify-between">
                                                          <span className="text-[10px] text-muted-foreground truncate">
                                                            Imagen
                                                          </span>
                                                          <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-primary hover:underline"
                                                          >
                                                            Ver
                                                          </a>
                                                        </div>
                                                      </div>
                                                    )
                                                  }

                                                  if (esDoc) {
                                                    return (
                                                      <a
                                                        key={docIndex}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 hover:border-primary transition-colors"
                                                      >
                                                        <FileText size={18} className="text-red-500 shrink-0" />
                                                        <span className="text-[10px] font-medium text-foreground truncate">
                                                          Documento {docIndex + 1}
                                                        </span>
                                                      </a>
                                                    )
                                                  }

                                                  return (
                                                    <a
                                                      key={docIndex}
                                                      href={url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 hover:border-primary transition-colors"
                                                    >
                                                      <Paperclip size={18} className="text-primary shrink-0" />
                                                      <span className="text-[10px] font-medium text-foreground truncate">
                                                        Adjunto {docIndex + 1}
                                                      </span>
                                                    </a>
                                                  )
                                                })}
                                              </div>
                                            </div>
                                          )}

                                          {/* Servicios */}
                                          <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
                                              Trabajos / Servicios
                                            </p>
                                            {loadingServicios[solicitud.id] ? (
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Loader2 size={14} className="animate-spin" />
                                                Cargando servicios...
                                              </div>
                                            ) : (
                                              <div className="space-y-3">
                                                {serviciosPorSolicitud[solicitud.id]?.map((servicio: any) => (
                                                  <div key={servicio.id} className="border border-border rounded-lg p-3 bg-white">
                                                    <p className="text-xs font-medium text-foreground mb-2">{servicio.nombre}</p>
                                                    {servicio.descripcion && (
                                                      <p className="text-[10px] text-muted-foreground mb-2">{servicio.descripcion}</p>
                                                    )}
                                                    {servicio.precio && (
                                                      <p className="text-[10px] font-medium text-primary">
                                                        Precio: ${servicio.precio?.toLocaleString()}
                                                      </p>
                                                    )}
                                                  </div>
                                                ))}
                                                {(!serviciosPorSolicitud[solicitud.id] || serviciosPorSolicitud[solicitud.id].length === 0) && (
                                                  <p className="text-xs text-muted-foreground">No hay servicios registrados.</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}