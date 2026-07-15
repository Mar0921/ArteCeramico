"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Wallet,
  MessageCircle,
  Send,
  Shield,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  cliente_id: number
  servicio: string
  estado: string
  created_at: string
  updated_at: string | null
  observaciones: string
  urls_documentos: string[]
  precio: number | null
  fecha_elaboracion: string | null
  fecha_entrega: string | null
  historia_clinica: string | null
  odontologo: string | null
  cc_odontologo: string | null
  paciente: string | null
  cc_paciente: string | null
  direccion: string | null
  odontologo_firma: string | null
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
  dientes_trabajados: string[] | null
  dientes_detallados: { numero: number; servicio: string; estado: string }[] | null
  servicios_detalle: {
    id: number
    nombre: string
    descripcion: string
    precio: number | null
    cantidad: number
    tipo_trabajo?: string | null
    material?: string | null
    dientes?: string | null
    piezas_enviadas?: string | null
  }[]
  dibujo_odontologo: string | null
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
}

interface MensajeChat {
  id: number
  solicitud_id: number
  autor: "admin" | "cliente"
  contenido: string
  created_at: string
  leido: boolean
}

interface ClienteConSolicitudes extends Cliente {
  solicitudes: Solicitud[]
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<ClienteConSolicitudes[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCliente, setExpandedCliente] = useState<number | null>(null)
  const [expandedSolicitud, setExpandedSolicitud] = useState<{ [key: number]: boolean }>({})
  const [loadingSolicitudes, setLoadingSolicitudes] = useState<{ [key: number]: boolean }>({})
  const [loadingServicios, setLoadingServicios] = useState<{ [key: number]: boolean }>({})
  const [loadingEstadoCuenta, setLoadingEstadoCuenta] = useState<{ [key: number]: boolean }>({})
  const [serviciosPorSolicitud, setServiciosPorSolicitud] = useState<{ [key: number]: any[] }>({})
  const [solicitudDocs, setSolicitudDocs] = useState<{
    [key: number]: {
      declaracion_conformidad: File | null
      guia_fabricacion: File | null
      manual_uso: File | null
    }
  }>({})
  const [uploadingSolicitudDoc, setUploadingSolicitudDoc] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})
  const [mostrarEstadoCuenta, setMostrarEstadoCuenta] = useState<{ [key: number]: boolean }>({})
  const [itemsEstadoCuenta, setItemsEstadoCuenta] = useState<{ [key: number]: { solicitudId: number; servicio: string; precio: number | null; estado: string; fecha: string }[] }>({})
  const [totalPagarPorCliente, setTotalPagarPorCliente] = useState<{ [key: number]: number }>({})

  // --- Chat state ---
  const [activeTab, setActiveTab] = useState<{ [solicitudId: number]: "detalle" | "chat" }>({})
  const [mensajesPorSolicitud, setMensajesPorSolicitud] = useState<{ [solicitudId: number]: MensajeChat[] }>({})
  const [loadingMensajes, setLoadingMensajes] = useState<{ [solicitudId: number]: boolean }>({})
  const [mensajeInput, setMensajeInput] = useState<{ [solicitudId: number]: string }>({})
  const [enviandoMensaje, setEnviandoMensaje] = useState<{ [solicitudId: number]: boolean }>({})
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<{ [solicitudId: number]: number }>({})
  const chatBottomRefs = useRef<{ [solicitudId: number]: HTMLDivElement | null }>({})
  const router = useRouter()

  const [adminId, setAdminId] = useState<number | null>(null)
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [notificacionesVistas, setNotificacionesVistas] = useState<number[]>([])

  useEffect(() => {
    const getAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", user.id)
          .single()
        setAdminId(data?.id || null)
      }
    }
    getAdmin()
  }, [])

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

  useEffect(() => {
    const channel = supabase
      .channel("solicitudes-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "solicitudes",
        },
        (payload) => {
          const nuevaSolicitud = payload.new as Solicitud

          setClientes((prev) =>
            prev.map((cliente) =>
              cliente.id === nuevaSolicitud.cliente_id
                ? {
                  ...cliente,
                  solicitudes: [
                    nuevaSolicitud,
                    ...(cliente.solicitudes || []),
                  ],
                }
                : cliente
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleCliente = async (clienteId: number) => {
    if (expandedCliente === clienteId) {
      setExpandedCliente(null)
      return
    }

    setExpandedCliente(clienteId)

    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return

    if (!loadingSolicitudes[clienteId]) {
      setLoadingSolicitudes((prev) => ({ ...prev, [clienteId]: true }))

      const { data } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      const solicitudes = data || []
      setClientes((prev) =>
        prev.map((c) =>
          c.id === clienteId
            ? { ...c, solicitudes }
            : c
        )
      )

      if (solicitudes.length > 0) {
        for (const sol of solicitudes) {
          cargarNoLeidos(sol.id)
        }
      }

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

  const cargarEstadoCuenta = async (clienteId: number) => {
    setLoadingEstadoCuenta((prev) => ({ ...prev, [clienteId]: true }))
    try {
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from("solicitudes")
        .select("id, estado, created_at")
        .eq("cliente_id", clienteId)

      if (solicitudesError) throw solicitudesError

      const solicitudesIds = solicitudesData?.map(s => s.id) || []
      if (solicitudesIds.length === 0) {
        setItemsEstadoCuenta((prev) => ({ ...prev, [clienteId]: [] }))
        setTotalPagarPorCliente((prev) => ({ ...prev, [clienteId]: 0 }))
        return
      }

      const { data: serviciosData, error: serviciosError } = await supabase
        .from("servicios")
        .select("id, solicitud_id, nombre, precio, created_at")
        .in("solicitud_id", solicitudesIds)
        .order("created_at", { ascending: true })

      if (serviciosError) throw serviciosError

      const solicitudesMap = new Map((solicitudesData || []).map((s: any) => [s.id, s]))

      const items = (serviciosData ?? [])
        .filter((item: any) => item.precio && Number(item.precio) > 0)
        .map((item: any) => {
          const solicitud = solicitudesMap.get(item.solicitud_id)
          return {
            solicitudId: item.solicitud_id,
            servicio: item.nombre,
            precio: Number(item.precio),
            estado: solicitud?.estado || "pendiente",
            fecha: solicitud?.created_at || item.created_at || "",
          }
        })

      setItemsEstadoCuenta((prev) => ({ ...prev, [clienteId]: items }))
      setTotalPagarPorCliente((prev) => ({ ...prev, [clienteId]: items.reduce((acc, item) => acc + item.precio, 0) }))
    } catch (err) {
      console.error("Error cargando estado de cuenta:", err)
    } finally {
      setLoadingEstadoCuenta((prev) => ({ ...prev, [clienteId]: false }))
    }
  }

  const handleToggleEstadoCuenta = async (clienteId: number) => {
    const abrir = !mostrarEstadoCuenta[clienteId]
    setMostrarEstadoCuenta((prev) => ({ ...prev, [clienteId]: abrir }))

    if (abrir && (!itemsEstadoCuenta[clienteId] || itemsEstadoCuenta[clienteId].length === 0)) {
      await cargarEstadoCuenta(clienteId)
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

      setSolicitudDocs((prev) => ({
        ...prev,
        [solicitudId]: {
          ...(prev[solicitudId] || { declaracion_conformidad: null, guia_fabricacion: null, manual_uso: null }),
          [campo]: null,
        },
      }))

      setUploadSuccess((prev) => ({ ...prev, [uploadKey]: true }))

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

  // --- Chat handlers ---

  const cargarNoLeidos = async (solicitudId: number) => {
    try {
      const { count } = await supabase
        .from("mensajes_solicitud")
        .select("*", { count: "exact", head: true })
        .eq("solicitud_id", solicitudId)
        .eq("autor", "cliente")
        .eq("leido", false)

      setMensajesNoLeidos((prev) => ({ ...prev, [solicitudId]: count ?? 0 }))
    } catch (err) {
      console.error("Error cargando no leídos:", err)
    }
  }

  const cargarMensajes = async (solicitudId: number) => {
    if (mensajesPorSolicitud[solicitudId]) return
    setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const { data, error } = await supabase
        .from("mensajes_solicitud")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setMensajesPorSolicitud((prev) => ({ ...prev, [solicitudId]: data as MensajeChat[] }))
      }
    } catch (err) {
      console.error("Error cargando mensajes:", err)
    } finally {
      setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const marcarLeidos = async (solicitudId: number) => {
    await supabase
      .from("mensajes_solicitud")
      .update({ leido: true })
      .eq("solicitud_id", solicitudId)
      .eq("autor", "cliente")
      .eq("leido", false)

    setMensajesNoLeidos((prev) => ({ ...prev, [solicitudId]: 0 }))
  }

  const handleSwitchTab = async (solicitudId: number, tab: "detalle" | "chat") => {
    setActiveTab((prev) => ({ ...prev, [solicitudId]: tab }))
    if (tab === "chat") {
      await cargarMensajes(solicitudId)
      await marcarLeidos(solicitudId)
      setTimeout(() => {
        chatBottomRefs.current[solicitudId]?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  const handleEnviarMensaje = async (solicitudId: number) => {
    const texto = mensajeInput[solicitudId]?.trim()
    if (!texto) return

    setEnviandoMensaje((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const { data, error } = await supabase
        .from("mensajes_solicitud")
        .insert({
          solicitud_id: solicitudId,
          autor: "admin",
          contenido: texto,
          leido: false,
        })
        .select()
        .single()

      if (!error && data) {
        setMensajesPorSolicitud((prev) => ({
          ...prev,
          [solicitudId]: [...(prev[solicitudId] || []), data as MensajeChat],
        }))
        setMensajeInput((prev) => ({ ...prev, [solicitudId]: "" }))
        setTimeout(() => {
          chatBottomRefs.current[solicitudId]?.scrollIntoView({ behavior: "smooth" })
        }, 50)
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err)
    } finally {
      setEnviandoMensaje((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const formatFechaMensaje = (fecha: string) => {
    const d = new Date(fecha)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)

    const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })

    if (d.toDateString() === hoy.toDateString()) return `Hoy ${hora}`
    if (d.toDateString() === ayer.toDateString()) return `Ayer ${hora}`
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) + " " + hora
  }

  useEffect(() => {
    const canal = supabase
      .channel("notificaciones-admin")

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_solicitud",
        },
        async (payload) => {
          const mensaje: any = payload.new

          if (mensaje.autor !== "cliente") return

          const { data: solicitud, error } = await supabase
            .from("solicitudes")
            .select(`
              id,
              cliente_id,
              servicio
            `)
            .eq("id", mensaje.solicitud_id)
            .single()

          if (error || !solicitud) return

          const { data: cliente } = await supabase
            .from("clientes")
            .select("nombre")
            .eq("id", solicitud.cliente_id)
            .single()

          // La notificación se crea automáticamente vía trigger
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  useEffect(() => {
    const canal = supabase
      .channel("notificaciones")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificaciones",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotificaciones((prev) => {
              const existe = prev.find((n) => n.id === payload.new.id)
              if (existe) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setNotificaciones((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
          }
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  useEffect(() => {
    if (!adminId) return

    const cargarNotificaciones = async () => {
      // Admin ve notificaciones donde admin_id es NULL (para todos los admins)
      const { data } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("admin_id", adminId).eq("tipo", "nuevo_mensaje")
        .order("created_at", { ascending: false });

      if (data) {
        setNotificaciones(data)
      }
    }

    cargarNotificaciones()
  }, [adminId])

  const abrirNotificacion = async (n: any) => {
    await supabase
      .from("notificaciones")
      .update({ vista: true })
      .eq("id", n.id)

    setNotificaciones((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, vista: true } : x))
    )
    setNotificacionesVistas((prev) => [...prev, n.id])
    setMostrarNotificaciones(false)

    if (n.cliente_id && n.solicitud_id) {
      router.push(`/dashboard/clientes/${n.cliente_id}?solicitud=${n.solicitud_id}`)
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
    <div className="space-y-6 mt-20">
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
          <div className="relative">
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              className="relative text-xl"
            >
              🔔
              {notificaciones.filter((n) => !n.vista).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2">
                  {notificaciones.filter((n) => !n.vista).length}
                </span>
              )}
            </button>
            {mostrarNotificaciones && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg p-3 z-50 border border-border max-h-96 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                ) : (
                  notificaciones.map((n) => (
                    <div
                      key={n.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        abrirNotificacion(n)
                      }}
                      className={`cursor-pointer p-4 border-b border-border/40 last:border-0 transition ${n.vista ? "bg-white" : "bg-green-100"
                        } hover:bg-gray-100`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">💬 {n.titulo}</h4>
                        {!n.vista && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Nueva
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-2">
                        👤 Cliente: {n.cliente_nombre || n.cliente || "Cliente"}
                      </p>
                      <p className="text-sm">
                        📋 Solicitud: {n.solicitud_servicio || n.solicitud || `Solicitud #${n.solicitud_id}`}
                      </p>
                      <p className="text-gray-600 text-sm mt-2">"{n.contenido}"</p>
                      <small className="text-gray-400 text-[10px]">
                        {new Date(n.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
                        <Link
                          href={`/dashboard/clientes/${cliente.id}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {cliente.nombre}
                        </Link>
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
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Activo
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleEstadoCuenta(cliente.id) }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Wallet size={12} />
                        Estado de Cuenta
                      </button>
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
                          <div className="space-y-2">
                            {cliente.solicitudes.map((solicitud) => (
                              <div
                                key={solicitud.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {(solicitud as any).servicios_detalle?.length > 0
                                      ? (solicitud as any).servicios_detalle.map((s: any) => s.nombre).join(", ")
                                      : solicitud.servicio}
                                  </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">
                    {solicitud.estado?.replace("_", " ") || "Pendiente"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(solicitud.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>
                {(solicitud as any).servicios_detalle?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(solicitud as any).servicios_detalle.map((serv: any) => (
                      <div key={serv.id} className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-700">{serv.nombre}</span>
                        <span className="font-medium text-primary">${serv.precio ? Number(serv.precio).toLocaleString("es-CO") : "0"}</span>
                      </div>
                    ))}
                  </div>
                )}
                {solicitud.odontologo_firma && (
                  <div className="mt-2">
                    {String(solicitud.odontologo_firma).startsWith("data:image") ? (
                      <img
                        src={solicitud.odontologo_firma}
                        alt="Firma del doctor"
                        className="h-12 w-auto rounded border border-border bg-white"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Firma: {solicitud.odontologo_firma}</span>
                    )}
                  </div>
                )}
              </div>
                                <div className="flex items-center gap-2">
                                  {solicitud.precio && (
                                    <span className="text-sm font-bold text-primary">
                                      ${solicitud.precio?.toLocaleString("es-CO")}
                                    </span>
                                  )}
                                  <Link
                                    href={`/dashboard/clientes/${cliente.id}?solicitud=${solicitud.id}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted"
                                  >
                                    <Eye size={12} />
                                    Ver
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mostrarEstadoCuenta[cliente.id] && (
                  <div className="border-t border-border bg-background/40 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Wallet size={16} />
                        Estado de Cuenta
                      </h4>
                      {loadingEstadoCuenta[cliente.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Total: <span className="font-semibold text-foreground">${(totalPagarPorCliente[cliente.id] || 0).toLocaleString("es-CO")}</span>
                        </span>
                      )}
                    </div>

                    {!itemsEstadoCuenta[cliente.id] || itemsEstadoCuenta[cliente.id].length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        No hay servicios con precio registrado para este cliente.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/60">
                              <th className="pb-2 pr-3 font-medium text-muted-foreground">#</th>
                              <th className="pb-2 pr-3 font-medium text-muted-foreground">Servicio</th>
                              <th className="pb-2 pr-3 font-medium text-muted-foreground">Solicitud</th>
                              <th className="pb-2 pr-3 font-medium text-muted-foreground">Fecha</th>
                              <th className="pb-2 pr-3 font-medium text-muted-foreground">Estado</th>
                              <th className="pb-2 text-right font-medium text-muted-foreground">Precio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {(itemsEstadoCuenta[cliente.id] || []).map((item, index) => (
                              <tr key={item.solicitudId}>
                                <td className="py-2 pr-3 text-muted-foreground">{index + 1}</td>
                                <td className="py-2 pr-3 font-medium text-foreground">{item.servicio}</td>
                                <td className="py-2 pr-3">
                                  <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    SOL-{String(item.solicitudId).padStart(3, "0")}
                                  </span>
                                </td>
                                <td className="py-2 pr-3 text-muted-foreground">
                                  {new Date(item.fecha).toLocaleDateString()}
                                </td>
                                <td className="py-2 pr-3">
                                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary capitalize">
                                    {item.estado.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="py-2 text-right font-semibold text-foreground">
                                  {item.precio ? `$${item.precio.toLocaleString("es-CO")}` : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}