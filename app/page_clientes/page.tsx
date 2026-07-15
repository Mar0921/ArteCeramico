"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase, getValidUser } from "@/lib/supabase"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

import {
  User,
  LogOut,
  MessageSquare,
  MessageCircle,
  Package,
  Send,
  X,
  Loader2,
  Edit,
  Save,
  Home,
  Trash2,
  Paperclip,
  Upload,
  CheckCircle2,
  ImageIcon,
  FileText,
  Search,
  Eye,
  AlertCircle,
  Wallet,
  Check,
  Bell,
} from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Checkbox } from "@/components/ui/checkbox"
import { WhatsAppButton } from "@/components/whatsapp-button"

interface Servicio {
  id: number
  nombre: string
  descripcion: string
  precio: number | null
  cantidad: number
  created_at: string
  tipo_trabajo?: string | null
  material?: string | null
  dientes?: string | null
  piezas_enviadas?: string | null
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
}

interface Solicitud {
  id: number
  cliente_id: number
  servicio: string
  estado: string
  created_at: string
  updated_at: string | null
  observaciones: string
  precio: number | null
  urls_documentos: string[]
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
  dientes_trabajados: string[] | null
  dientesTrabajados: string[]
  tiposTrabajo: string[]
  piezasEnviadas: number
  dibujo_odontologo: string | null
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
}

interface Cliente {
  id?: number
  nombre: string
  tipo: string
  documento: string
  correo: string
  telefono: string
  clinica: string
  created_at: string
}

interface Message {
  id: number
  text: string
  isBot: boolean
}

interface MensajeSolicitud {
  id: number
  conversacion_id: number
  remitente: string
  contenido: string
  leido: boolean
  created_at: string
}

export default function ClientesPage() {
  const router = useRouter()

  const [clientData, setClientData] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [chatOpen, setChatOpen] = useState(false)
  const [notificacionesOpen, setNotificacionesOpen] = useState(false)
  const [notificacionesLista, setNotificacionesLista] = useState<any[]>([])
  const [chatSolicitudOpen, setChatSolicitudOpen] = useState(false)
  const [conversacionActual, setConversacionActual] = useState<any>(null)
  const [mensajesSolicitud, setMensajesSolicitud] = useState<any[]>([])
  const [mensajeSolicitudInput, setMensajeSolicitudInput] = useState("")
  const [enviandoMensajeSolicitud, setEnviandoMensajeSolicitud] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy el asistente virtual de Arte Cerámico. ¿En qué puedo ayudarte hoy?",
      isBot: true,
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [submittingSolicitud, setSubmittingSolicitud] = useState(false)
  const [solicitudMensaje, setSolicitudMensaje] = useState<string | null>(null)
  const [busquedaSolicitud, setBusquedaSolicitud] = useState("")
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([])
  const [archivosParaEliminar, setArchivosParaEliminar] = useState<number[]>([])
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const [serviciosDetalle, setServiciosDetalle] = useState<Servicio[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [servicioDocs, setServicioDocs] = useState<Record<number, { declaracion_conformidad: File | null; guia_fabricacion: File | null; manual_uso: File | null }>>({})
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})
  const [mostrarEstadoCuenta, setMostrarEstadoCuenta] = useState(false)
  const [itemsEstadoCuenta, setItemsEstadoCuenta] = useState<{
    id: number
    solicitudId: number
    nombre: string
    descripcion: string
    precio: number
    cantidad: number
    fecha: string
    estado: string
  }[]>([])
  const [totalPagar, setTotalPagar] = useState(0)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())

  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<Cliente>>({})
  const [saving, setSaving] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<Record<number, number>>({})

  const { toast } = useToast()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mensajesSolicitudEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  useEffect(() => {
    mensajesSolicitudEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [mensajesSolicitud])

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true)

        const user = await getValidUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("user_id", user.id)
          .single()


        if (error) throw error

        setClientData(data)

        if (data?.id) {
          await cargarSolicitudes(data.id)
          await cargarNotificacionesNoVistas(data.id)
          await cargarTodasLasNotificaciones(data.id)
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error cargando datos"
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [router])

  useEffect(() => {
    if (!clientData?.id) return

    const channel = supabase
      .channel(`notificaciones-${clientData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `cliente_id=eq.${clientData.id}`,
        },
        (payload) => {
          const nuevaNotificacion: any = payload.new

          if (nuevaNotificacion.tipo !== "nuevo_mensaje") return

          setNotificacionesLista(prev => [nuevaNotificacion, ...prev])
          setNotificacionesNoLeidas(prev => ({
            ...prev,
            [nuevaNotificacion.solicitud_id]:
              (prev[nuevaNotificacion.solicitud_id] || 0) + 1
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientData?.id])

  const cargarSolicitudes = async (clienteId: number) => {
    setLoadingSolicitudes(true)
    try {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const solicitudesData = data ?? []

      const solicitudIds = solicitudesData.map(s => s.id)
      const serviciosMap = new Map<
        number,
        {
          precio: number
          dientes: string[]
          tipoTrabajo: string[]
          materiales: string[]
          piezas: number
        }
      >()

      const normalizarPiezas = (valor: any) => {
        if (Array.isArray(valor)) return valor.length
        const numero = Number(valor)
        return Number.isFinite(numero) ? numero : 0
      }

      if (solicitudIds.length > 0) {
        const { data: servicios } = await supabase
          .from("servicios")
          .select(`
            solicitud_id,
            precio,
            dientes,
            tipo_trabajo,
            material,
            piezas_enviadas
          `)
          .in("solicitud_id", solicitudIds)

        servicios?.forEach((serv: any) => {
          const actual = serviciosMap.get(serv.solicitud_id) || {
            precio: 0,
            dientes: [],
            tipoTrabajo: [],
            materiales: [],
            piezas: 0,
          }

          serviciosMap.set(serv.solicitud_id, {
            precio: actual.precio + Number(serv.precio || 0),
            dientes: [
              ...actual.dientes,
              ...(serv.dientes ? [serv.dientes] : []),
            ],
            tipoTrabajo: [
              ...actual.tipoTrabajo,
              ...(serv.tipo_trabajo ? [serv.tipo_trabajo] : []),
            ],
            materiales: [
              ...actual.materiales,
              ...(serv.material ? [serv.material] : []),
            ],
            piezas: actual.piezas + normalizarPiezas(serv.piezas_enviadas),
          })
        })
      }

      const solicitudesConPrecio = solicitudesData.map((s: any) => {
        const info = serviciosMap.get(s.id)

        return {
          ...s,
          precio: info?.precio || 0,
          dientesTrabajados: info?.dientes || [],
          tiposTrabajo: info?.tipoTrabajo || [],
          materiales: info?.materiales || [],
          piezasEnviadas: info?.piezas || 0,
        }
      })

      setSolicitudes(solicitudesConPrecio)
      await cargarEstadoCuenta(clienteId, solicitudesConPrecio)
    } catch (err) {
      console.error("Error cargando solicitudes", err)
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  const cargarEstadoCuenta = async (clienteId: number, solicitudesData: Solicitud[]) => {
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select(`
                id,
                solicitud_id,
                nombre,
                descripcion,
                precio,
                cantidad,
                created_at
              `)
        .in("solicitud_id", solicitudesData.map(s => s.id))
        .order("created_at", { ascending: true })

      if (error) throw error

      const solicitudesMap = new Map(solicitudesData.map(s => [s.id, s]))

      const items = (data ?? [])
        .filter((item: any) => item.precio && Number(item.precio) > 0)
        .map((item: any) => {
          const solicitud = solicitudesMap.get(item.solicitud_id)
          return {
            id: item.id,
            solicitudId: item.solicitud_id,
            nombre: item.nombre,
            descripcion: item.descripcion || "",
            precio: Number(item.precio),
            cantidad: item.cantidad || 1,
            estado: solicitud?.estado || "pendiente",
            fecha: solicitud?.created_at || item.created_at,
          }
        })

      setItemsEstadoCuenta(items)
      setTotalPagar(items.reduce((acc, item) => acc + item.precio, 0))
    } catch (err) {
      console.error("Error cargando estado de cuenta:", err)
    }
  }

  const cargarNotificacionesNoVistas = async (clienteId: number) => {
    try {
      const { data } = await supabase
        .from("notificaciones")
        .select("solicitud_id, id")
        .eq("cliente_id", clienteId)
        .eq("vista", false)
        .eq("tipo", "nuevo_mensaje")
        .order("created_at", { ascending: false })

      const counts: Record<number, number> = {}
      data?.forEach((n: any) => {
        counts[n.solicitud_id] = (counts[n.solicitud_id] || 0) + 1
      })
      setNotificacionesNoLeidas(counts)
    } catch (err) {
      console.error("Error cargando notificaciones:", err)
    }
  }

  const cargarTodasLasNotificaciones = async (clienteId: number) => {
    try {
      if (!clientData) return

      const { data } = await supabase
        .from("notificaciones")
        .select(`
          id,
          solicitud_id,
          contenido,
          titulo,
          vista,
          created_at
        `)
        .eq("cliente_id", clienteId)
        .eq("tipo", "nuevo_mensaje")
        .order("created_at", { ascending: false })
        .limit(50)

      setNotificacionesLista(data || [])
    } catch (err) {
      console.error("Error cargando lista de notificaciones:", err)
    }
  }

  const handleAbrirNotificacion = async (notificacion: any) => {
    if (!clientData?.id) return

    try {
      // Verificar que la conversación pertenece al cliente
      const { data: conversacion } = await supabase
        .from("conversaciones")
        .select("id, solicitud_id, cliente_id")
        .eq("id", notificacion.conversacion_id)
        .eq("cliente_id", clientData.id)
        .single()

      if (!conversacion) {
        return
      }

      await supabase
        .from("notificaciones")
        .update({ vista: true })
        .eq("id", notificacion.id)

      setNotificacionesLista(prev =>
        prev.map(n => n.id === notificacion.id ? { ...n, vista: true } : n)
      )
      setNotificacionesNoLeidas(prev => {
        const next = { ...prev }
        delete next[notificacion.solicitud_id]
        return next
      })

      setNotificacionesOpen(false)

      const solicitud = solicitudes.find(s => s.id === conversacion.solicitud_id)
      if (solicitud) {
        await abrirChatSolicitud(solicitud)
      }
    } catch (err) {
      console.error("Error abriendo notificación:", err)
    }
  }

  const handleMarcarTodasLeidas = async () => {
    if (!clientData?.id) return

    try {
      await supabase

        .from("notificaciones")
        .update({ vista: true })
        .eq("cliente_id", clientData.id)
        .eq("tipo", "nuevo_mensaje")
        .eq("vista", false)

      setNotificacionesLista(prev => prev.map(n => ({ ...n, vista: true })))
      setNotificacionesNoLeidas({})
    } catch (err) {
      console.error("Error marcando todas como leídas:", err)
    }
  }

  const handlePagarSeleccionados = async () => {
    const itemsPagar = itemsEstadoCuenta.filter(item =>
      seleccionados.has(item.solicitudId * 1000 + itemsEstadoCuenta.findIndex(i => i.solicitudId === item.solicitudId))
    )

    if (itemsPagar.length === 0) {
      const itemsConPrecio = itemsEstadoCuenta.filter(item => item.precio && item.precio > 0)
      if (itemsConPrecio.length === 0) return

      setProcesandoPago(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 600))
        const resumen = itemsConPrecio
          .map(item => `• ${item.nombre} (${new Date(item.fecha).toLocaleDateString()}): $${item.precio?.toLocaleString("es-CO")}`)
          .join("\n")
        const total = itemsConPrecio.reduce((acc, item) => acc + (item.precio || 0), 0)
        alert(
          `RESUMEN DE PAGO TOTAL\n\n${resumen}\n\n TOTAL: $${total.toLocaleString("es-CO")}\n\n` +
          `Formas de pago disponibles:\n` +
          `• Efectivo\n` +
          `• Transferencia bancaria\n` +
          `• PSE\n` +
          `• Tarjetas crédito y débito\n\n` +
          `Una vez realizado el pago, envía el comprobante por este medio para validar.`
        )
      } catch (err) {
        console.error("Error preparando pago:", err)
      } finally {
        setProcesandoPago(false)
      }
      return
    }

    setProcesandoPago(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      const resumen = itemsPagar
        .map(item => `• ${item.nombre} (${new Date(item.fecha).toLocaleDateString()}): $${item.precio?.toLocaleString("es-CO")}`)
        .join("\n")
      const totalSeleccionado = itemsPagar.reduce((acc, item) => acc + (item.precio || 0), 0)
      alert(
        `RESUMEN DE PAGO PARCIAL\n\n${resumen}\n\n TOTAL: $${totalSeleccionado.toLocaleString("es-CO")}\n\n` +
        `Formas de pago disponibles:\n` +
        `• Efectivo\n` +
        `• Transferencia bancaria\n` +
        `• PSE\n` +
        `• Tarjetas crédito y débito\n\n` +
        `Una vez realizado el pago, envía el comprobante por este medio para validar.`
      )
    } catch (err) {
      console.error("Error preparando pago:", err)
    } finally {
      setProcesandoPago(false)
    }
  }

  const toggleSeleccion = (itemId: number) => {
    const nuevoSet = new Set(seleccionados)
    if (nuevoSet.has(itemId)) {
      nuevoSet.delete(itemId)
    } else {
      nuevoSet.add(itemId)
    }
    setSeleccionados(nuevoSet)
  }

  const seleccionarTodos = () => {
    const todosLosIds = itemsEstadoCuenta
      .filter(item => item.precio && item.precio > 0)
      .map((item, index) => item.solicitudId * 1000 + index)
    setSeleccionados(new Set(todosLosIds))
  }

  const deseleccionarTodos = () => {
    setSeleccionados(new Set())
  }

  const totalSeleccionado = itemsEstadoCuenta
    .filter((item, index) => seleccionados.has(item.solicitudId * 1000 + index))
    .reduce((acc, item) => acc + (item.precio || 0), 0)

  const formatearBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const handleStartEdit = () => {
    setEditMode(true)
    setEditData(clientData ?? {})
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditData(clientData ?? {})
  }

  const handleSave = async () => {
    if (!clientData?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          nombre: editData.nombre,
          correo: editData.correo,
          telefono: editData.telefono,
          clinica: editData.clinica,
        })
        .eq("id", clientData.id)

      if (error) throw error

      setClientData({ ...clientData, ...editData })
      setEditMode(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar los cambios"
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitSolicitud = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!clientData?.id) return

    const formData = new FormData(event.currentTarget)
    const servicio = String(formData.get("servicio") ?? "").trim()
    const observaciones = String(formData.get("observaciones") ?? "").trim()

    if (!servicio) {
      setSolicitudMensaje("Debes indicar el servicio o tipo de trabajo.")
      return
    }

    setSubmittingSolicitud(true)
    setSolicitudMensaje(null)

    try {
      const payload = new FormData()
      payload.append("servicio", servicio)
      payload.append("observaciones", observaciones)
      payload.append("clienteId", String(clientData.id))

      archivosSeleccionados.forEach((archivo) => {
        payload.append("archivos", archivo, archivo.name)
      })

      const response = await fetch("/api/solicitudes", {
        method: "POST",
        body: payload,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error al registrar la solicitud")
      }

      event.currentTarget.reset()
      setArchivosSeleccionados([])
      setMostrarFormulario(false)
      setSolicitudMensaje("Solicitud registrada correctamente.")

      await cargarSolicitudes(clientData.id)
    } catch (err) {
      console.error("Error creando solicitud", err)
      setSolicitudMensaje(err instanceof Error ? err.message : "No se pudo registrar la solicitud. Intenta nuevamente.")
    } finally {
      setSubmittingSolicitud(false)
    }
  }

  const handleDeleteSolicitud = async (solicitud: Solicitud) => {
    if (!confirm("¿Eliminar esta solicitud? Esta acción no se puede deshacer.")) return

    try {
      for (const url of solicitud.urls_documentos) {
        if (!url) continue
        const partes = url.split("/documentos/")
        const rutaStorage = partes[1]
        if (rutaStorage) {
          await supabase.storage.from("documentos").remove([rutaStorage])
        }
      }

      const { error } = await supabase
        .from("solicitudes")
        .delete()
        .eq("id", solicitud.id)

      if (error) throw error

      setSolicitudes(prev => prev.filter(s => s.id !== solicitud.id))
      setSolicitudMensaje("Solicitud eliminada correctamente.")
    } catch (err) {
      console.error("Error eliminando solicitud", err)
      setSolicitudMensaje("No se pudo eliminar la solicitud.")
    }
  }

  const formatRelativeTime = (value: string | null) => {
    if (!value) return null
    const date = new Date(value)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "recién"
    if (diffMins < 60) return `hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    return `hace ${diffDays} d`
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const archivos = Array.from(files)
    setArchivosSeleccionados(prev => [...prev, ...archivos])
    event.target.value = ""
  }

  const eliminarArchivoSeleccionado = (index: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index))
    if (archivosParaEliminar.includes(index)) {
      setArchivosParaEliminar(prev => prev.filter(i => i !== index))
    } else {
      setArchivosParaEliminar(prev => [...prev, index])
    }
  }

  const isDocumento = (url: string) => url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i)
  const isImagen = (url: string) => url.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)$/i)

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

  const abrirChatSolicitud = async (solicitud: Solicitud) => {
    if (!clientData?.id) return

    try {
      if (!clientData?.id) return

      console.log("CLIENT DATA:", clientData)
      console.log("SOLICITUD:", solicitud)

      const authUser = await getValidUser()
      console.log("AUTH UID:", authUser?.id)

      let { data: conversacion, error: conversacionError } = await supabase
        .from("conversaciones")
        .select("*")
        .eq("solicitud_id", solicitud.id)
        .maybeSingle()

      if (conversacionError) {
        throw conversacionError
      }

      if (!conversacion) {
        const { data: nuevaConversacion, error: insertError } =
          await supabase
            .from("conversaciones")
            .insert({
              solicitud_id: solicitud.id,
              cliente_id: clientData.id,
              admin_id: null,
              estado: "activa",
            })
            .select()
            .single()

        console.log("INSERT ERROR:", insertError)
        console.log("NUEVA CONVERSACION:", nuevaConversacion)

        if (insertError) {
          throw insertError
        }

        conversacion = nuevaConversacion
      }

      setConversacionActual(conversacion)
      setChatSolicitudOpen(true)

      if (conversacion?.id) {
        await cargarMensajesSolicitud(conversacion.id)
        await marcarMensajesSolicitudLeidos(conversacion.id)
        await marcarNotificacionesLeidas(conversacion.id, conversacion.solicitud_id)

        setTimeout(() => {
          mensajesSolicitudEndRef.current?.scrollIntoView({
            behavior: "smooth",
          })
        }, 100)
      }
    } catch (err: any) {
      console.error("ERROR CREANDO CONVERSACION:", err)

      toast({
        title: "Error creando conversación",
        description: err?.message,
        variant: "destructive",
      })

      return
    }
  }

  const cargarMensajesSolicitud = async (conversacionId: number) => {
    try {
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setMensajesSolicitud(data as MensajeSolicitud[])
      }
    } catch (err) {
      console.error("Error cargando mensajes de solicitud:", err)
      setMensajesSolicitud([])
    }
  }

  const marcarMensajesSolicitudLeidos = async (conversacionId: number) => {
    try {
      await supabase
        .from("mensajes")
        .update({ leido: true })
        .eq("conversacion_id", conversacionId)
        .eq("remitente", "admin")
        .eq("leido", false)
    } catch (err) {
      console.error("Error marcando mensajes como leídos:", err)
    }
  }

  const marcarNotificacionesLeidas = async (conversacionId: number, solicitudId?: number) => {
    if (!clientData?.id) return
    try {
      await supabase
        .from("notificaciones")
        .update({ vista: true })
        .eq("conversacion_id", conversacionId)
        .eq("cliente_id", clientData.id)
        .eq("tipo", "nuevo_mensaje")
        .eq("vista", false)
      if (solicitudId) {
        setNotificacionesNoLeidas(prev => {
          const next = { ...prev }
          delete next[solicitudId]
          return next
        })
      }
    } catch (err) {
      console.error("Error marcando notificaciones como leídas:", err)
    }
  }

  const handleEnviarMensajeSolicitud = async () => {
    const texto = mensajeSolicitudInput.trim()

    if (!texto || !conversacionActual) return

    const conversacionId = conversacionActual.id

    setEnviandoMensajeSolicitud(true)

    try {
      // DEBUG
      const authUser = await getValidUser()

      console.log("================================")
      console.log("AUTH USER:", authUser?.id)
      console.log("CONVERSACION ACTUAL:", conversacionActual)
      console.log("CONVERSACION ID:", conversacionId)
      console.log("AUTH USER:", authUser?.id)
      console.log("CONVERSACION ACTUAL:", JSON.stringify(conversacionActual, null, 2))
      console.log("CONVERSACION ID:", conversacionId)

      console.log("AUTH USER:", authUser?.id)

      console.log("INSERTANDO:", {
        conversacion_id: conversacionId,
        contenido: texto,
        remitente: "cliente",
        leido: false,
      })

      console.log("USER:", authUser)
      console.log("UID:", authUser?.id)

      const response = await supabase
        .from("mensajes")
        .insert({
          conversacion_id: conversacionId,
          contenido: texto,
          remitente: "cliente",
          leido: false,
        })
        .select()
        .single()

      console.log("RESPUESTA SUPABASE:", response)

      const { data, error } = response

      if (error) {
        console.error("ERROR SUPABASE:", error)
        throw error
      }

      if (data) {
        setMensajesSolicitud((prev) => [
          ...prev,
          data as MensajeSolicitud,
        ])

        setMensajeSolicitudInput("")

        setTimeout(() => {
          mensajesSolicitudEndRef.current?.scrollIntoView({
            behavior: "smooth",
          })
        }, 50)
      }
    } catch (err: any) {
      console.error("================================")
      console.error("ERROR COMPLETO:", err)
      console.error("ERROR STRING:", JSON.stringify(err, null, 2))
      console.error("ERROR MESSAGE:", err?.message)
      console.error("ERROR DETAILS:", err?.details)
      console.error("ERROR HINT:", err?.hint)
      console.error("================================")
    } finally {
      setEnviandoMensajeSolicitud(false)
    }
  }

  const formatFechaMensajeSolicitud = (fecha: string) => {
    const d = new Date(fecha)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)

    const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })

    if (d.toDateString() === hoy.toDateString()) return `Hoy ${hora}`
    if (d.toDateString() === ayer.toDateString()) return `Ayer ${hora}`
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) + " " + hora
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

      const uploadKey = `${servicioId}-${campo}`
      setUploadSuccess((prev) => ({ ...prev, [uploadKey]: true }))
      setTimeout(() => {
        setUploadSuccess((prev) => {
          const next = { ...prev }
          delete next[uploadKey]
          return next
        })
      }, 3000)

      const nombreDocumento =
        campo === "declaracion_conformidad"
          ? "Declaración de Conformidad"
          : campo === "guia_fabricacion"
            ? "Guía de Fabricación"
            : "Manual de Uso"

      setSolicitudMensaje(`${nombreDocumento} subido correctamente para el servicio #${servicioId}`)
      setTimeout(() => setSolicitudMensaje(null), 4000)
    } catch (err) {
      console.error("Error subiendo documento:", err)
      alert(err instanceof Error ? err.message : "No se pudo subir el documento.")
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch {
      setError("Error al cerrar sesión")
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatLoading) return

    const text = inputValue.trim()

    const userMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
    }

    setMessages((prev) => [...prev, userMessage])

    setInputValue("")
    setChatLoading(true)

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en el servidor")
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.response,
          isBot: true,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Ocurrió un error al enviar el mensaje.",
          isBot: true,
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const solicitudesFiltradas = solicitudes.filter(solicitud =>
    solicitud.servicio.toLowerCase().includes(busquedaSolicitud.toLowerCase()) ||
    solicitud.observaciones.toLowerCase().includes(busquedaSolicitud.toLowerCase())
  )

  const sinLeer = notificacionesLista.filter(n => !n.vista).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !clientData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Error
          </h2>

          <p className="text-red-400">
            {error || "No se encontraron datos"}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02]"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar
        notificaciones={notificacionesLista}
        notificacionesCount={sinLeer}
        notificacionesOpen={notificacionesOpen}
        setNotificacionesOpen={setNotificacionesOpen}
        onAbrirNotificacion={handleAbrirNotificacion}
        onMarcarTodasLeidas={handleMarcarTodasLeidas}
      />

      {/* CONTENT */}
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 pt-20">
        {/* INFO CARD */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <User className="text-primary" size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Información del Cliente
                </h2>

                <p className="text-sm text-muted-foreground">
                  Datos registrados en el sistema
                </p>
              </div>
            </div>

            {!editMode && (
              <div className="flex gap-2">
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-500/20"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            )}
            {editMode && (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Guardar
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EditableInfoItem
              label="Nombre"
              value={editMode ? editData.nombre ?? "" : clientData.nombre}
              field="nombre"
              editData={editData}
              setEditData={setEditData}
              editMode={editMode}
              type="text"
            />

            <InfoItem
              label="Tipo de Documento"
              value={clientData.tipo}
              editable={false}
            />

            <InfoItem
              label="Número de Documento"
              value={clientData.documento}
              editable={false}
            />

            <EditableInfoItem
              label="Correo Electrónico"
              value={editMode ? editData.correo ?? "" : clientData.correo}
              field="correo"
              editData={editData}
              setEditData={setEditData}
              editMode={editMode}
              type="email"
            />

            <EditableInfoItem
              label="Teléfono"
              value={editMode ? editData.telefono ?? "" : clientData.telefono}
              field="telefono"
              editData={editData}
              setEditData={setEditData}
              editMode={editMode}
              type="tel"
            />

            <EditableInfoItem
              label="Clínica"
              value={editMode ? editData.clinica ?? "" : clientData.clinica}
              field="clinica"
              editData={editData}
              setEditData={setEditData}
              editMode={editMode}
              type="text"
            />

            <InfoItem
              label="Fecha de Registro"
              value={new Date(clientData.created_at).toLocaleDateString()}
              editable={false}
            />
          </div>
        </section>

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Cerrar sesión
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                ¿Estás seguro de que deseas cerrar sesión? Podrás volver a ingresar cuando lo necesites.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="rounded-xl border border-border bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESTADO DE CUENTA */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <Wallet className="text-primary" size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Estado de Cuenta
                </h2>

                <p className="text-sm text-muted-foreground">
                  Consulta el saldo pendiente de tus servicios
                </p>
              </div>
            </div>

            <button
              onClick={() => setMostrarEstadoCuenta(prev => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] sm:w-auto"
            >
              {mostrarEstadoCuenta ? (
                <>
                  <X size={18} />
                  Ocultar estado
                </>
              ) : (
                <>
                  <Wallet size={18} />
                  Ver estado de cuenta
                </>
              )}
            </button>
          </div>

          {mostrarEstadoCuenta && (
            <div className="rounded-2xl border border-border/60 bg-background/40 p-6">
              {itemsEstadoCuenta.length === 0 ? (
                <div className="py-8 text-center">
                  <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No hay servicios con precio registrado
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Los servicios aparecerán aquí cuando tengan un valor asignado
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="pb-3 pr-2 font-medium text-muted-foreground w-10">
                            <Checkbox
                              checked={seleccionados.size === itemsEstadoCuenta.filter(i => i.precio && i.precio > 0).length}
                              onCheckedChange={(checked) => checked ? seleccionarTodos() : deseleccionarTodos()}
                            />
                          </th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">#</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Servicio</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Solicitud</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Fecha</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Estado</th>
                          <th className="pb-3 text-right font-medium text-muted-foreground">Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {itemsEstadoCuenta.map((item, index) => {
                          const itemId = item.solicitudId * 1000 + index
                          const isSeleccionado = seleccionados.has(itemId)
                          const tienePrecio = item.precio && item.precio > 0
                          return (
                            <tr key={`${item.solicitudId}-${index}`} className="transition-colors hover:bg-background/30">
                              <td className="py-3 pr-2">
                                <Checkbox
                                  checked={isSeleccionado}
                                  onCheckedChange={() => toggleSeleccion(itemId)}
                                  disabled={!tienePrecio}
                                />
                              </td>
                              <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                              <td className="py-3 pr-4 font-medium text-foreground">{item.nombre}</td>
                              <td className="py-3 pr-4">
                                <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  SOL-{String(item.solicitudId).padStart(3, "0")}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-muted-foreground">
                                {new Date(item.fecha).toLocaleDateString()}
                              </td>
                              <td className="py-3 pr-4">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                                  {item.estado.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-3 text-right font-semibold text-foreground">
                                {item.precio ? `$${item.precio.toLocaleString("es-CO")}` : "-"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex flex-col items-end gap-4 border-t border-border/60 pt-6">
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-muted-foreground">
                        Total a pagar
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        ${seleccionados.size > 0 ? totalSeleccionado.toLocaleString("es-CO") : totalPagar.toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      {seleccionados.size > 0 && (
                        <button
                          onClick={handlePagarSeleccionados}
                          disabled={procesandoPago}
                          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl disabled:opacity-50"
                        >
                          {procesandoPago ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Procesando pago...
                            </>
                          ) : (
                            <>
                              <Wallet size={18} />
                              Pagar seleccionados
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={handlePagarSeleccionados}
                        disabled={procesandoPago || (seleccionados.size === 0 && totalPagar === 0)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl disabled:opacity-50"
                      >
                        {procesandoPago ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Procesando pago...
                          </>
                        ) : (
                          <>
                            <Wallet size={18} />
                            {seleccionados.size > 0 ? "Pagar seleccionados" : "Pagar total"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* SOLICITUDES DE SERVICIO */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <Package className="text-primary" size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Solicitudes de Servicio
                </h2>

                <p className="text-sm text-muted-foreground">
                  Gestiona tus pedidos y adjunta documentos
                </p>
              </div>
          </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busquedaSolicitud}
                onChange={e => setBusquedaSolicitud(e.target.value)}
                placeholder="Buscar por servicio u observaciones..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {solicitudMensaje && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
              <CheckCircle2 size={16} />
              {solicitudMensaje}
            </div>
          )}

          {mostrarFormulario && (
            <form onSubmit={handleSubmitSolicitud} className="mb-6 space-y-5 rounded-2xl border border-primary/40 bg-primary/5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="servicio" className="mb-2 block text-sm font-medium text-foreground">
                    Servicio o tipo de trabajo *
                  </label>
                  <input
                    id="servicio"
                    name="servicio"
                    type="text"
                    required
                    placeholder="Ej: Corona zirconio, modelo yeso, carilla disilicato"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Archivos adjuntos (PDF, imágenes)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    name="archivos"
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <Upload size={16} />
                    Seleccionar archivos
                  </button>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Formatos permitidos: PDF, JPG, PNG, WEBP, GIF. Máximo 10 MB por archivo.
                  </p>
                </div>
              </div>

              {archivosSeleccionados.length > 0 && (
                <div className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Archivos seleccionados
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {archivosSeleccionados.map((archivo, index) => {
                      const tipo = archivo.type || archivo.name

                      if (tipo.includes("pdf")) {
                        return (
                          <div key={index} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-foreground">
                            <div className="flex items-center gap-2">
                              <FileText className="text-red-500" size={16} />
                              <div>
                                <p className="truncate max-w-[120px] text-xs font-medium">{archivo.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatearBytes(archivo.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarArchivoSeleccionado(index)}
                              className="rounded-full p-1 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      }

                      return (
                        <div key={index} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-foreground">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="text-primary" size={16} />
                            <div>
                              <p className="truncate max-w-[120px] text-xs font-medium">{archivo.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatearBytes(archivo.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarArchivoSeleccionado(index)}
                            className="rounded-full p-1 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="observaciones" className="mb-2 block text-sm font-medium text-foreground">
                  Observaciones o detalles adicionales
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows={4}
                  placeholder="Describe el trabajo requerido, dientes involucrados, referencias o consideraciones especiales..."
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSolicitud}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-primary-dark hover:shadow-xl disabled:opacity-50"
              >
                {submittingSolicitud ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {submittingSolicitud ? "Registrando solicitud..." : "Registrar solicitud"}
              </button>
            </form>
          )}

          <div className="rounded-2xl border border-border bg-background/40">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Historial de solicitudes
                </h3>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {solicitudes.length} registro{solicitudes.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {loadingSolicitudes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="space-y-1 px-5 pb-5 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {busquedaSolicitud ? "No se encontraron solicitudes" : "Sin solicitudes registradas"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {busquedaSolicitud ? "Prueba con otra búsqueda" : "Cuando registres una solicitud aparecerá aquí"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {solicitudesFiltradas.map((solicitud, index) => (
                  <li key={solicitud.id} className="space-y-3 p-5 transition-all hover:bg-background/30">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {solicitud.servicio}
                        </p>

                        {solicitud.observaciones && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {solicitud.observaciones}
                          </p>
                        )}

                        {(solicitud.odontologo || solicitud.cc_odontologo || solicitud.paciente || solicitud.cc_paciente || solicitud.historia_clinica || solicitud.fecha_elaboracion || solicitud.fecha_entrega || solicitud.caja || solicitud.codigo_trazabilidad || solicitud.guia) && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {(solicitud as any).odontologo && (
                              <div><span className="text-gray-500">Dr(a):</span> <span className="text-gray-800">{(solicitud as any).odontologo}</span></div>
                            )}
                            {(solicitud as any).cc_odontologo && (
                              <div><span className="text-gray-500">CC Odontólogo:</span> <span className="text-gray-800">{(solicitud as any).cc_odontologo}</span></div>
                            )}
                            {(solicitud as any).paciente && (
                              <div><span className="text-gray-500">Paciente:</span> <span className="text-gray-800">{(solicitud as any).paciente}</span></div>
                            )}
                            {(solicitud as any).cc_paciente && (
                              <div><span className="text-gray-500">CC Paciente:</span> <span className="text-gray-800">{(solicitud as any).cc_paciente}</span></div>
                            )}
                            {(solicitud as any).fecha_elaboracion && (
                              <div><span className="text-gray-500">Elaboración:</span> <span className="text-gray-800">{(solicitud as any).fecha_elaboracion}</span></div>
                            )}
                            {(solicitud as any).fecha_entrega && (
                              <div><span className="text-gray-500">Entrega:</span> <span className="text-gray-800">{(solicitud as any).fecha_entrega}</span></div>
                            )}
                            {(solicitud as any).historia_clinica && (
                              <div><span className="text-gray-500">Historia Clínica:</span> <span className="text-gray-800">#{(solicitud as any).historia_clinica}</span></div>
                            )}
                            {(solicitud as any).caja && (
                              <div><span className="text-gray-500">Caja:</span> <span className="text-gray-800">#{(solicitud as any).caja}</span></div>
                            )}
                            {(solicitud as any).codigo_trazabilidad && (
                              <div><span className="text-gray-500">Trazabilidad:</span> <span className="text-gray-800">#{(solicitud as any).codigo_trazabilidad}</span></div>
                            )}
                            {(solicitud as any).guia && (
                              <div><span className="text-gray-500">Guía:</span> <span className="text-gray-800">{(solicitud as any).guia}</span></div>
                            )}
                            {(solicitud as any).tipos_trabajo?.length > 0 && (
                              <div className="contents">
                                {(solicitud as any).tipos_trabajo.map((tipo: string, i: number) => (
                                  <span key={i} className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 w-fit">{tipo}</span>
                                ))}
                              </div>
                            )}
                            {(solicitud as any).materiales?.length > 0 && (
                              <div className="contents">
                                {(solicitud as any).materiales.map((mat: string, i: number) => (
                                  <span key={i} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 w-fit">{mat}</span>
                                ))}
                              </div>
                            )}
                            {(solicitud as any).piezas_enviadas?.length > 0 && (
                              <div className="contents">
                                {(solicitud as any).piezas_enviadas.map((pieza: string, i: number) => (
                                  <span key={i} className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 w-fit">{pieza}</span>
                                ))}
                              </div>
                            )}
                            {(solicitud as any).dientes_trabajados?.length > 0 && (
                              <div className="contents">
                                {(solicitud as any).dientes_trabajados.map((diente: string, i: number) => (
                                  <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700 w-fit">#{diente}</span>
                                ))}
                              </div>
                            )}
                            {solicitud.precio !== null && solicitud.precio !== undefined && (
                              <div>
                                <span className="text-gray-500">Precio:</span>{" "}
                                <span className="text-gray-800 font-semibold">${solicitud.precio.toLocaleString("es-CO")}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                            {solicitud.estado.replace("_", " ")}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {new Date(solicitud.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-xl bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">
                              Valor
                            </p>
                            <p className="font-bold text-primary">
                              ${solicitud.precio?.toLocaleString("es-CO")}
                            </p>
                          </div>

                          <div className="rounded-xl bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">
                              Dientes
                            </p>
                            <p className="font-medium">
                              {solicitud.dientesTrabajados?.join(", ") || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">
                              Material
                            </p>
                            <p className="font-medium">
                              {solicitud.materiales?.join(", ") || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">
                              Piezas
                            </p>
                            <p className="font-medium">
                              {solicitud.piezasEnviadas}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                          {(["declaracion_conformidad", "guia_fabricacion", "manual_uso"] as const).map((campo) => {
                            const url = solicitud[campo]
                            const label =
                              campo === "declaracion_conformidad"
                                ? "Declaración de Conformidad"
                                : campo === "guia_fabricacion"
                                  ? "Guía de Fabricación"
                                  : "Manual de Uso"
                            return (
                              <span
                                key={campo}
                                className={
                                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 " +
                                  (url
                                    ? "border-green-500/40 bg-green-500/10 text-green-700"
                                    : "border-border bg-background/70 text-muted-foreground")
                                }
                              >
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: url ? "#16a34a" : "#a1a1aa" }} />
                                {url ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline-offset-2 hover:underline"
                                  >
                                    {label}
                                  </a>
                                ) : (
                                  label + " pendiente"
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                        {(solicitud as any).odontologo_firma && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Firma del doctor</p>
                            {String((solicitud as any).odontologo_firma).startsWith("data:image") ? (
                              <img
                                src={(solicitud as any).odontologo_firma}
                                alt="Firma del doctor"
                                className="h-20 w-auto rounded-lg border border-border bg-white"
                              />
                            ) : (
                              <p className="text-sm text-foreground">{(solicitud as any).odontologo_firma}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirChatSolicitud(solicitud)}
                          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white relative"
                        >
                          <MessageCircle size={16} />
                          Chat Arte Cerámico
                          {notificacionesNoLeidas[solicitud.id] > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white px-1">
                              {notificacionesNoLeidas[solicitud.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleVerSolicitud(solicitud)}
                          className="flex items-center gap-1 rounded-xl border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDeleteSolicitud(solicitud)}
                          className="flex items-center gap-1 rounded-xl border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {solicitud.urls_documentos && solicitud.urls_documentos.length > 0 && (
                      <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                        {solicitud.urls_documentos.map((url, docIndex) => {
                          const esImagen = isImagen(url)
                          const esDocumento = isDocumento(url)

                          if (esImagen) {
                            return (
                              <div key={docIndex} className="overflow-hidden rounded-xl border border-border/60 bg-background/60">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={url}
                                    alt={`Adjunto ${index + 1} - imagen`}
                                    className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                </a>

                                <div className="flex items-center justify-between px-3 py-2">
                                  <span className="truncate text-xs text-muted-foreground">
                                    Imagen adjunta
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                                  >
                                    Ver
                                  </a>
                                </div>
                              </div>
                            )
                          }

                          if (esDocumento) {
                            return (
                              <a
                                key={docIndex}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-3 transition-all hover:border-primary/60"
                              >
                                <FileText className="text-red-500" size={22} />

                                <span className="truncate text-xs font-medium text-foreground">
                                  Documento adjunto
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
                              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-3 transition-all hover:border-primary/60"
                            >
                              <Paperclip className="text-primary" size={18} />

                              <span className="truncate text-xs font-medium text-foreground">
                                Archivo adjunto
                              </span>
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Modal de Detalle de Solicitud */}
        {selectedSolicitud && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCerrarDetalle}>
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Detalle de Solicitud
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      SOL-{String(selectedSolicitud.id).padStart(3, "0")}
                    </p>
                  </div>
                  <button
                    onClick={handleCerrarDetalle}
                    className="rounded-lg p-2 hover:bg-muted transition-colors"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                  <p className="text-sm text-foreground">{selectedSolicitud.servicio}</p>
                </div>

                {selectedSolicitud.observaciones && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedSolicitud.observaciones}</p>
                  </div>
                )}

                {(selectedSolicitud as any).odontologo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Odontólogo(a)</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).odontologo}</p>
                  </div>
                )}
                {(selectedSolicitud as any).cc_odontologo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CC. Odontólogo</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).cc_odontologo}</p>
                  </div>
                )}
                {(selectedSolicitud as any).paciente && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).paciente}</p>
                  </div>
                )}
                {(selectedSolicitud as any).cc_paciente && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CC. Paciente</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).cc_paciente}</p>
                  </div>
                )}
                {(selectedSolicitud as any).direccion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).direccion}</p>
                  </div>
                )}
                {(selectedSolicitud as any).odontologo_firma && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Firma</p>
                    {String((selectedSolicitud as any).odontologo_firma).startsWith("data:image") ? (
                      <img
                        src={(selectedSolicitud as any).odontologo_firma}
                        alt="Firma"
                        className="h-20 w-auto rounded border border-border bg-white"
                      />
                    ) : (
                      <p className="text-sm text-foreground">{(selectedSolicitud as any).odontologo_firma}</p>
                    )}
                  </div>
                )}
                {(selectedSolicitud as any).historia_clinica && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Historia Clínica</p>
                    <p className="text-sm text-foreground">#{(selectedSolicitud as any).historia_clinica}</p>
                  </div>
                )}
                {(selectedSolicitud as any).fecha_elaboracion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Elaboración</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).fecha_elaboracion}</p>
                  </div>
                )}
                {(selectedSolicitud as any).fecha_entrega && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).fecha_entrega}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Trabajos / Servicios Vinculados</p>
                  {loadingDetalle ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </div>
                  ) : serviciosDetalle.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay trabajos adicionales registrados.</p>
                  ) : (
                    <div className="space-y-3">
                      {serviciosDetalle.map((servicio, idx) => (
                        <div key={servicio.id} className="border border-border rounded-lg p-3">
                          <p className="text-sm font-medium text-foreground mb-2">{idx + 1}. {servicio.nombre}</p>
                          {servicio.descripcion && <p className="text-xs text-muted-foreground mb-2">{servicio.descripcion}</p>}

                          <div className="space-y-2">
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
                                    <FileText size={14} className="text-muted-foreground shrink-0" />
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
                                      <span className="text-xs text-muted-foreground">{etiqueta}</span>
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
                                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
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

                          <div className="text-right mt-2">
                            <p className="text-sm font-semibold text-foreground">
                              {servicio.precio ? `$${servicio.precio.toLocaleString("es-CO")}` : "-"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Cant: {servicio.cantidad}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
                <button
                  onClick={handleCerrarDetalle}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {chatSolicitudOpen && conversacionActual && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setChatSolicitudOpen(false)}>
            <div className="flex h-[min(620px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Chat Arte Cerámico
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      SOL-{String(conversacionActual.solicitud_id || conversacionActual.id).padStart(3, "0")}
                    </p>
                  </div>
                  <button
                    onClick={() => setChatSolicitudOpen(false)}
                    className="rounded-lg p-2 hover:bg-muted transition-colors"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {mensajesSolicitud.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <MessageCircle size={32} className="mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm font-medium text-foreground">Sin mensajes aún.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Escribe tu mensaje sobre esta solicitud.</p>
                  </div>
                ) : (
                  mensajesSolicitud.map((msg, index, arr) => {
                    const esAdmin = msg.remitente === "admin"
                    const mostrarFecha = index === 0 || new Date(msg.created_at).toDateString() !== new Date(arr[index - 1].created_at).toDateString()

                    return (
                      <div key={msg.id}>
                        {mostrarFecha && (
                          <div className="my-3 flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                        )}
                        <div className={`flex ${esAdmin ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm shadow-sm ${esAdmin ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                            <p className="whitespace-pre-line break-words">
                              {msg.contenido}
                            </p>
                            <p className={`mt-1 text-[10px] ${esAdmin ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {formatFechaMensajeSolicitud(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={mensajesSolicitudEndRef} />
              </div>

              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <textarea
                    value={mensajeSolicitudInput}
                    onChange={(e) => setMensajeSolicitudInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleEnviarMensajeSolicitud()
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.style.height = "auto"
                      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                    }}
                  />
                  <button
                    onClick={handleEnviarMensajeSolicitud}
                    disabled={enviandoMensajeSolicitud || !mensajeSolicitudInput.trim()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {enviandoMensajeSolicitud ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shift+Enter para nueva línea
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CHAT */}
        <section className="rounded-3xl border border-border/50 bg-card/60 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <MessageSquare className="text-primary" size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Asistente Virtual
                </h2>

                <p className="text-sm text-muted-foreground">
                  Consulta información, precios y servicios.
                </p>
              </div>
            </div>

            <button
              onClick={() => setChatOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02]"
            >
              {chatOpen ? (
                <>
                  <X size={16} />
                  Cerrar
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Abrir Chat
                </>
              )}
            </button>
          </div>

          {chatOpen && (
            <div className="flex h-[500px] flex-col">
              {/* MENSAJES */}
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot
                      ? "justify-start"
                      : "justify-end"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm shadow-lg ${message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                        }`}
                    >
                      <p className="whitespace-pre-line break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                    Escribiendo...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {chatLoading ? (
                      <Loader2
                        className="animate-spin"
                        size={18}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <WhatsAppButton />
      </main>
    </div>
  )
}

function InfoItem({
  label,
  value,
  editable = false,
}: {
  label: string
  value: string
  editable?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-lg font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

function EditableInfoItem({
  label,
  value,
  field,
  editData,
  setEditData,
  editMode,
  type = "text",
}: {
  label: string
  value: string
  field: string
  editData: Partial<Cliente>
  setEditData: (data: Partial<Cliente>) => void
  editMode: boolean
  type?: string
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      {editMode ? (
        <input
          type={type}
          value={value}
          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
          className="mt-1 w-full break-words text-lg font-semibold text-foreground bg-transparent outline-none border-b border-border focus:border-primary"
        />
      ) : (
        <p className="mt-1 break-words text-lg font-semibold text-foreground">
          {value}
        </p>
      )}
    </div>
  )
}
