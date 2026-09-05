"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import html2canvas from "html2canvas"
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
  ChevronDown,
  ChevronUp,
  Shield,
  Download,
} from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Checkbox } from "@/components/ui/checkbox"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SurveyForm } from "@/components/survey-form"
import { ComplaintsSurvey } from "@/components/complaints-survey"

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
  odontologo_registro_medico: string | null
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
  dientes_detallados: { numero: number; servicio: string; estado: string }[]
  guia_fabricacion: string | null
  terminos_garantia: string | null
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
  tiposTrabajo: string[]
  piezasEnviadas: number
  dibujo_odontologo: string | null
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
   convenio_firmado: boolean | null
   convenio_documento_url: string | null
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
  const [activeTab, setActiveTab] = useState<Record<number, "detalle" | "chat" | "documentos">>({})
  const [mensajesPorSolicitud, setMensajesPorSolicitud] = useState<Record<number, any[]>>({})
  const [mensajeInput, setMensajeInput] = useState<Record<number, string>>({})
  const [enviandoMensaje, setEnviandoMensaje] = useState<Record<number, boolean>>({})
  const [loadingMensajes, setLoadingMensajes] = useState<Record<number, boolean>>({})

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
  const [solicitudDocs, setSolicitudDocs] = useState<{ terminos_garantia: File | null }>({
    terminos_garantia: null,
  })
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({})
  const [uploadingSolicitudDoc, setUploadingSolicitudDoc] = useState<{ terminos_garantia: boolean }>({
    terminos_garantia: false,
  })
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSolicitudError, setUploadSolicitudError] = useState<{ terminos_garantia: string }>({
    terminos_garantia: "",
  })
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})
  const [uploadSolicitudSuccess, setUploadSolicitudSuccess] = useState<{ terminos_garantia: boolean }>({
    terminos_garantia: false,
  })
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
  const [expandedSolicitudId, setExpandedSolicitudId] = useState<number | null>(null)
  const [surveyResponses, setSurveyResponses] = useState<Record<number, {
    email: string
    paciente: string
    evaluaciones: string[]
    opinion: string
    nombreProfesional: string
    fechaEntrega: string
  }>>({})
  const [submittingSurvey, setSubmittingSurvey] = useState<Record<number, boolean>>({})
  const [surveySuccess, setSurveySuccess] = useState<Record<number, boolean>>({})
  const [complaintsResponses, setComplaintsResponses] = useState<Record<number, {
    email: string
    tipo: string
    descripcion: string
    notificacion: string[]
    nombreCompleto: string
    correoElectronico: string
    comentariosAdicionales: string
  }>>({})
  const [submittingComplaints, setSubmittingComplaints] = useState<Record<number, boolean>>({})
  const [complaintsSuccess, setComplaintsSuccess] = useState<Record<number, boolean>>({})
  const [guardandoConvenio, setGuardandoConvenio] = useState(false)
  const [descargandoConvenio, setDescargandoConvenio] = useState(false)
  const [convenioExpanded, setConvenioExpanded] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const convenioRef = useRef<HTMLDivElement | null>(null)
  const [dibujando, setDibujando] = useState(false)

  const { toast } = useToast()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatBottomRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

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
          servicios_detalle: any[]
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
            piezas_enviadas,
            id,
            nombre,
            descripcion,
            cantidad
          `)
          .in("solicitud_id", solicitudIds)

        servicios?.forEach((serv: any) => {
          const actual = serviciosMap.get(serv.solicitud_id) || {
            precio: 0,
            dientes: [] as string[],
            tipoTrabajo: [] as string[],
            materiales: [] as string[],
            piezas: 0,
            servicios_detalle: [] as any[],
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
            servicios_detalle: [
              ...actual.servicios_detalle,
              {
                id: serv.id,
                nombre: serv.nombre,
                descripcion: serv.descripcion,
                precio: Number(serv.precio || 0),
                cantidad: serv.cantidad || 1,
                tipo_trabajo: serv.tipo_trabajo || null,
                material: serv.material || null,
                dientes: serv.dientes || null,
                piezas_enviadas: serv.piezas_enviadas || null,
              },
            ],
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
          servicios_detalle: info?.servicios_detalle || [],
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
      const solicitudIds = solicitudesData.map(s => s.id)
      const solicitudesMap = new Map(solicitudesData.map(s => [s.id, s]))

      let data: any[] | null = []

      if (solicitudIds.length > 0) {
        const { data: serviciosData, error } = await supabase
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
          .in("solicitud_id", solicitudIds)
          .order("created_at", { ascending: true })

        if (error) throw error
        data = serviciosData
      }

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
    } catch (err: any) {
      console.error("Error cargando estado de cuenta:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        status: err?.status,
        full: err,
      })
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
         setExpandedSolicitudId(solicitud.id)
         setActiveTab(prev => ({ ...prev, [solicitud.id]: "chat" }))
         setTimeout(() => {
           cargarMensajes(solicitud.id)
         }, 100)
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

    const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      setDibujando(true)
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
      const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      ctx.lineWidth = 1.2 * Math.max(scaleX, scaleY)
      ctx.lineCap = "round"
      ctx.strokeStyle = "#333"
      ctx.beginPath()
      ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    }

    const dibujar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!dibujando) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const clientX = "touches" in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
      const clientY = "touches" in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
      ctx.stroke()
    }

    const detenerDibujo = () => {
      if (!dibujando) return
      setDibujando(false)
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.closePath()
    }

    const limpiarFirma = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const handleGuardarConvenio = async () => {
     if (!clientData?.id) return

     setGuardandoConvenio(true)
     try {
       let convenio_documento_url: string | null = null

       const canvas = canvasRef.current
       if (canvas) {
         try {
           const dataURL = canvas.toDataURL("image/png")
           const byteCharacters = atob(dataURL.split(",")[1])
           const byteArray = new Uint8Array(byteCharacters.length)
           for (let i = 0; i < byteCharacters.length; i++) {
             byteArray[i] = byteCharacters.charCodeAt(i)
           }
           const blob = new Blob([byteArray], { type: "image/png" })

           const fileName = `convenios/${clientData.id}-${Date.now()}-firma.png`
           const { error: uploadError } = await supabase.storage
             .from("documentos")
             .upload(fileName, blob, { upsert: true })

           if (uploadError) {
             console.warn("No se pudo subir la firma del convenio:", uploadError)
           }
         } catch (uploadErr) {
           console.warn("Error en upload de firma:", uploadErr)
         }
       }

        const convenioDiv = convenioRef.current
        if (convenioDiv) {
          try {
            const canvasFull = await html2canvas(convenioDiv, {
              background: "#ffffff",
              logging: false,
              allowTaint: true,
              useCORS: false,
              onclone: (clonedDoc: Document) => {
                const allElements = clonedDoc.querySelectorAll("*")
                const computedStylesMap: Map<Element, Array<{ name: string; value: string }>> = new Map()

                allElements.forEach((el: Element) => {
                  const computed = window.getComputedStyle(el)
                  const styles: Array<{ name: string; value: string }> = []
                  for (let i = 0; i < computed.length; i++) {
                    const prop = computed[i]
                    const val = computed.getPropertyValue(prop)
                    styles.push({ name: prop, value: val })
                  }
                  computedStylesMap.set(el, styles)
                })

                clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => el.remove())

                computedStylesMap.forEach((styles, el) => {
                  const style = (el as HTMLElement).style
                  styles.forEach(({ name, value }) => {
                    if (!value.includes("oklab") && !value.includes("lab(") && !value.includes("color-mix")) {
                      style.setProperty(name, value, "important")
                    }
                  })
                })
              },
            } as any)

            console.log("html2canvas result:", canvasFull.width, canvasFull.height)

            const fullDataUrl = canvasFull.toDataURL("image/jpeg", 0.9)
            const byteCharactersFull = atob(fullDataUrl.split(",")[1])
            const byteArrayFull = new Uint8Array(byteCharactersFull.length)
            for (let i = 0; i < byteCharactersFull.length; i++) {
              byteArrayFull[i] = byteCharactersFull.charCodeAt(i)
            }
            const fullBlob = new Blob([byteArrayFull], { type: "image/jpeg" })

            const fullFileName = `convenios/${clientData.id}-${Date.now()}-documento.jpeg`
            const { error: fullUploadError } = await supabase.storage
              .from("documentos")
              .upload(fullFileName, fullBlob, { upsert: true })

            if (fullUploadError) {
              console.warn("No se pudo subir el documento del convenio:", fullUploadError)
            } else {
              const { data: { publicUrl } } = supabase.storage.from("documentos").getPublicUrl(fullFileName)
              convenio_documento_url = publicUrl
              console.log("Documento del convenio subido:", publicUrl)
            }
          } catch (fullErr: any) {
            console.error("Error capturando documento del convenio:", fullErr?.message || fullErr)
          }
        }

       const { error } = await supabase
         .from("clientes")
         .update({ convenio_firmado: true, convenio_documento_url })
         .eq("id", clientData.id)

       if (error) {
         const errorMsg = (error as any)?.message || JSON.stringify(error)
         const needsConvenioDocUrl = errorMsg.includes("convenio_documento_url")
         const needsConvenioFirmado = errorMsg.includes("convenio_firmado")

         if (needsConvenioFirmado) {
           const { error: fallbackError } = await supabase
             .from("clientes")
             .update({})
             .eq("id", clientData.id)

           if (fallbackError) {
             throw fallbackError
           }
           toast({ title: "Atención", description: "Las columnas de convenio no existen en la base de datos. Ejecuta las migraciones correspondientes.", variant: "destructive" })
         } else if (needsConvenioDocUrl) {
           const { error: fallbackError } = await supabase
             .from("clientes")
             .update({ convenio_firmado: true })
             .eq("id", clientData.id)

           if (fallbackError) throw fallbackError
         } else {
           throw error
         }
       }

       setClientData((prev) => prev ? { ...prev, convenio_firmado: true, convenio_documento_url } : prev)
       toast({ title: "Convenio firmado", description: "El carta convenio se ha marcado como completada." })
     } catch (err: any) {
       console.error("Error guardando convenio:", err?.message || err, err?.code || "", err)
       toast({ title: "Error", description: err?.message || "No se pudo guardar el estado del convenio.", variant: "destructive" })
     } finally {
       setGuardandoConvenio(false)
     }
    }

    const handleDescargarConvenio = async () => {
      const convenioDiv = convenioRef.current
      if (!convenioDiv) return

      setDescargandoConvenio(true)
      try {
        const canvas = await html2canvas(convenioDiv, {
          background: "#ffffff",
          logging: false,
          allowTaint: true,
          useCORS: false,
          onclone: (clonedDoc: Document) => {
            const allElements = clonedDoc.querySelectorAll("*")
            allElements.forEach((el: Element) => {
              const style = (el as HTMLElement).style
              if (style) {
                const cssText = style.cssText
                if (cssText) {
                  style.cssText = cssText.replace(/oklab\([^)]*\)|lab\([^)]*\)|color-mix\([^)]*\)/gi, "#000000")
                }
              }
            })
            const styleSheets = clonedDoc.styleSheets
            for (let i = 0; i < styleSheets.length; i++) {
              try {
                const rules = (styleSheets[i] as CSSStyleSheet).cssRules
                if (rules) {
                  for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j] as CSSStyleRule
                    if (rule.style) {
                      rule.style.cssText = rule.style.cssText.replace(/oklab\([^)]*\)|lab\([^)]*\)|color-mix\([^)]*\)/gi, "#000000")
                    }
                  }
                }
              } catch {
                void 0
              }
            }
          },
        } as any)

        const dataURL = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `carta-convenio-${clientData?.id || "cliente"}.png`
        link.href = dataURL
        link.click()
      } catch (err: any) {
        console.error("Error descargando convenio:", err?.message || err)
        toast({
          title: "Error",
          description: err?.message || "No se pudo descargar el documento del convenio.",
          variant: "destructive",
        })
      } finally {
        setDescargandoConvenio(false)
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
 
   const handleSwitchTab = (solicitudId: number, tab: "detalle" | "chat" | "documentos") => {
     setActiveTab((prev) => ({ ...prev, [solicitudId]: tab }))
     if (tab === "chat") {
       cargarMensajes(solicitudId)
     }
   }
 
   const cargarMensajes = async (solicitudId: number) => {
     setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: true }))
 
     try {
       const { data: conversacion, error: convError } = await supabase
         .from("conversaciones")
         .select("id")
         .eq("solicitud_id", solicitudId)
         .single()
 
       let conversacionId = conversacion?.id
 
       if (!conversacionId && clientData) {
         const { data: nueva, error } = await supabase
           .from("conversaciones")
           .insert({
             solicitud_id: solicitudId,
             cliente_id: clientData.id,
             admin_id: null,
             estado: "activa",
           })
           .select()
           .single()
 
         if (error) {
           console.error(error)
           return
         }
 
         conversacionId = nueva.id
       }
 
       if (!conversacionId) return
 
       const { data, error } = await supabase
         .from("mensajes")
         .select("*")
         .eq("conversacion_id", conversacionId)
         .order("created_at", { ascending: true })
 
       if (error) throw error
 
       setMensajesPorSolicitud((prev) => ({
         ...prev,
         [solicitudId]: data || [],
       }))
 
       await supabase
         .from("mensajes")
         .update({ leido: true })
         .eq("conversacion_id", conversacionId)
         .eq("remitente", "admin")
         .eq("leido", false)
 
       setNotificacionesNoLeidas((prev) => {
         const next = { ...prev }
         delete next[solicitudId]
         return next
       })
     } catch (err) {
       console.error("chat error", err)
     } finally {
       setLoadingMensajes((prev) => ({
         ...prev,
         [solicitudId]: false
       }))
     }
   }
 
   const handleEnviarMensaje = async (solicitudId: number) => {
     const mensaje = mensajeInput[solicitudId]?.trim()
 
     if (!mensaje) return
 
     setEnviandoMensaje((prev) => ({
       ...prev,
       [solicitudId]: true
     }))
 
     try {
       const { data: conv } = await supabase
         .from("conversaciones")
         .select("id")
         .eq("solicitud_id", solicitudId)
         .single()
 
       if (!conv) return
 
       const insertPayload = {
         conversacion_id: conv.id,
         contenido: mensaje,
         remitente: "cliente",
         leido: false,
       }
 
       const { data, error } = await supabase
         .from("mensajes")
         .insert(insertPayload)
         .select()
 
       if (error) {
         console.error("Error inserting mensaje:", error)
         throw error
       }
 
       setMensajesPorSolicitud((prev) => ({
         ...prev,
         [solicitudId]: [
           ...(prev[solicitudId] || []),
           {
             id: Date.now(),
             contenido: mensaje,
             remitente: "cliente",
             created_at: new Date().toISOString(),
           },
         ],
       }))
 
       setMensajeInput((prev) => ({
         ...prev,
         [solicitudId]: "",
       }))
 
       setTimeout(() => {
         chatBottomRefs.current[solicitudId]?.scrollIntoView({
           behavior: "smooth",
         })
       }, 50)
     } catch (e) {
       console.error(e)
     } finally {
       setEnviandoMensaje((prev) => ({
         ...prev,
         [solicitudId]: false,
       }))
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
            ? "Ficha Técnica"
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

  const handleUploadDocSolicitud = async (solicitudId: number, campo: "terminos_garantia") => {
    const archivo = solicitudDocs[campo]
    if (!archivo) return

    setUploadingSolicitudDoc((prev) => ({ ...prev, [campo]: true }))
    setUploadSolicitudError((prev) => ({ ...prev, [campo]: "" }))
    setUploadSolicitudSuccess((prev) => ({ ...prev, [campo]: false }))

    try {
      const formData = new FormData()
      formData.append("tipo", campo)
      formData.append("archivo", archivo)

      const response = await fetch(`/api/solicitudes/${solicitudId}/documentos`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: "Error al subir documento" }))
        throw new Error(result.error || "Error al subir documento")
      }

      const result = await response.json()
      setSolicitudes((prev) => prev.map((s) => (s.id === solicitudId ? result.data : s)))

      setUploadSolicitudSuccess((prev) => ({ ...prev, [campo]: true }))
      setTimeout(() => {
        setUploadSolicitudSuccess((prev) => ({ ...prev, [campo]: false }))
      }, 3000)

      const nombreDocumento = "Términos de Garantía"

      setSolicitudMensaje(`${nombreDocumento} subido correctamente`)
      setTimeout(() => setSolicitudMensaje(null), 4000)
    } catch (err) {
      console.error("Error subiendo documento de solicitud:", err)
      const message = err instanceof Error ? err.message : "No se pudo subir el documento."
      setUploadSolicitudError((prev) => ({ ...prev, [campo]: message }))
      alert(message)
    } finally {
      setUploadingSolicitudDoc((prev) => ({ ...prev, [campo]: false }))
      setSolicitudDocs((prev) => ({ ...prev, [campo]: null }))
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

        {/* CARTA CONVENIO */}
        <section className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <FileText className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Carta Convenio</h2>
                <p className="text-sm text-muted-foreground">Documento de autorización y compromiso entre el odontólogo y Arte Cerámico</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {clientData?.convenio_firmado ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 size={14} />
                  Completada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  <AlertCircle size={14} />
                  Pendiente
                </span>
              )}
              <button
                onClick={() => setConvenioExpanded(!convenioExpanded)}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow transition-all hover:bg-muted"
              >
                {convenioExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {convenioExpanded ? "Ocultar" : "Ver"}
              </button>
              {!clientData?.convenio_firmado && (
                <button
                  onClick={handleGuardarConvenio}
                  disabled={guardandoConvenio}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {guardandoConvenio ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Firmar y Guardar
                </button>
              )}
              <button
                onClick={handleDescargarConvenio}
                disabled={descargandoConvenio}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow transition-all hover:bg-muted disabled:opacity-50"
              >
                {descargandoConvenio ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Descargar
              </button>
            </div>
          </div>

          {convenioExpanded && (
            <div className="overflow-x-auto">
              <div ref={convenioRef} className="relative mx-auto w-full max-w-4xl rounded-2xl border border-border/40 bg-white p-10 text-sm text-gray-800 shadow-inner">
              <div className="absolute top-6 right-6 text-[10px] text-gray-500">
                <div>Fecha de elaboración: 01-02-2026</div>
                <div>CODIGO: GF-AC-001</div>
                <div>VERSION: 001</div>
              </div>

              <div className="mb-6 flex justify-start">
                <img
                  src="/Arte_Ceramico_Logo.svg"
                  alt="Arte Cerámico Logo"
                  style={{ height: "2.5rem", width: "auto" }}
                />
              </div>

              <p className="mb-2 text-center text-xs text-gray-500">
                Santiago de Cali, {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
              </p>

              <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">CARTA CONVENIO</h3>

              <p className="mb-2 text-sm"><span className="font-semibold">Clínica:</span> {clientData?.clinica || "XXXXXXXXX"}</p>
              <p className="mb-6 text-sm"><span className="font-semibold">Doctor:</span> {clientData?.nombre || "XXXXXXXXXX"}</p>

              <div className="mb-6 space-y-3 text-justify text-xs leading-relaxed">
                <p>
                  El laboratorio dental ARTE CERAMICO confirma el compromiso para la provisión en cuanto a fabricación, reparación y dispensación, de los DISPOSITIVOS MÉDICOS SOBRE MEDIDA BUCAL, cumpliendo con la resolución 214 de 2022 en la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal.
                </p>
                <p>
                  Nuestro compromiso es respetar su autonomía como odontólogo, fabricando o reparando los dispositivos acordes a la prescripción por usted realizada en la evaluación previa del paciente con los datos completos.
                </p>
                <p>Dclaramos nuestro compromiso como fabricante.</p>

                <p className="font-semibold">DENTRO DEL CONVENIO EL LABORATORIO SE COMPROMETE A:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>El laboratorio garantiza que los trabajos entregados estarán elaborados con materiales de buena calidad y conforme a las especificaciones solicitadas.</li>
                  <li>Cumplir con Procedimientos documentados: Declaración de conformidad con su garantía si aplica, Ficha técnica de fabricación, manual de uso.</li>
                  <li>El tiempo de entrega estará sujeto a acuerdos según la complejidad del caso.</li>
                  <li>Nos comprometemos a respetar su autonomía y trabajar articuladamente entre técnico y odontólogo.</li>
                  <li>Ambas partes se comprometen a mantener la confidencialidad respecto a los datos de los pacientes, precios, y cualquier información considerada confidencial.</li>
                </ol>

                <p className="font-semibold">COMPROMISO DEL ODONTOLOGO</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Enviar la orden de fabricación de forma completa y clara con los datos solicitados sin enmendaduras y en letra legible en los términos establecidos en el artículo 6 de la resolución 214 de 2022.</li>
                  <li>Estar debidamente habilitado ante la secretaría de salud en los términos establecidos en la resolución 3100 de 2019.</li>
                  <li>Realizar el control pos-adaptación 8 días después en una cita de control al paciente y enviar copia del registro de verificación del estado del dispositivo en el control de la paciente realizada por el odontólogo.</li>
                  <li>Informar al Laboratorio dental cualquier evento adverso serio y compartir el código del evento adverso reportado en los programas de tecno vigilancia.</li>
                </ol>
                <p>
                  Esperamos atender y cumplir sus necesidades en cuanto a calidad, diseño y estética de los dispositivos médicos.
                </p>
              </div>

              <div className="mt-10 border-t border-gray-300 pt-6">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 h-24 w-full max-w-48 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
                      <img
                        src="/firma-oscar.jpeg"
                        alt="Firma Representante Legal"
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">__________________________________</p>
                    <p className="text-xs text-gray-600">Representante legal</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 h-24 w-full max-w-48 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
                      <img
                        src="/firma-jazmin.jpeg"
                        alt="Firma D.T."
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">__________________________________</p>
                    <p className="text-xs text-gray-600">D.T. LABORATORIO DENTAL ARTE CERAMICO</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <canvas
                      ref={canvasRef}
                      className="mb-2 h-24 w-full max-w-48 rounded-md border border-gray-300 bg-gray-50"
                      width={384}
                      height={96}
                      onMouseDown={iniciarDibujo}
                      onMouseMove={dibujar}
                      onMouseUp={detenerDibujo}
                      onMouseLeave={detenerDibujo}
                      onTouchStart={iniciarDibujo}
                      onTouchMove={dibujar}
                      onTouchEnd={detenerDibujo}
                    />
                    <p className="text-xs font-semibold text-gray-700 mb-1">__________________________________</p>
                    <p className="text-xs text-gray-600">Recibido Odontólogo o Auxiliar</p>
                    <button
                      onClick={limpiarFirma}
                      type="button"
                      className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Limpiar firma
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Santiago de Cali, {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-300 pt-4">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-[10px] text-gray-500">
                  <span>Carrera 42 A # 5 C 36</span>
                  <span>B. Tequendama</span>
                  <span>602 6670481 - 602 4082563</span>
                  <span>3177280804</span>
                  <span>lab-arteceramico@hotmail.com</span>
                </div>
              </div>
            </div>
          </div>
          )}
        </section>

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
              <div className="space-y-2">
                {solicitudesFiltradas.map((solicitud) => {
                  const isExpanded = expandedSolicitudId === solicitud.id
                  const servicios = (solicitud as any).servicios_detalle || []
                  const precioTotal = solicitud.precio || servicios.reduce((acc: number, serv: any) => acc + (Number(serv.precio) || 0), 0)

                  return (
                    <div
                      key={solicitud.id}
                      className="rounded-lg border border-border bg-white"
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedSolicitudId(isExpanded ? null : solicitud.id)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {solicitud.codigo_trazabilidad
                              ? `${solicitud.codigo_trazabilidad} + `
                              : ""}
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
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">
                            ${precioTotal.toLocaleString("es-CO")}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={16} className="text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-border p-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Dr(a):</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).odontologo || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Registro Médico:</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).odontologo_registro_medico || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Paciente:</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).paciente || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">CC Paciente:</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).cc_paciente || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Elaboración:</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).fecha_elaboracion || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Entrega:</span>{" "}
                              <span className="text-gray-800">{(solicitud as any).fecha_entrega || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Historia Clínica:</span>{" "}
                              <span className="text-gray-800">#{(solicitud as any).historia_clinica || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Caja:</span>{" "}
                              <span className="text-gray-800">#{(solicitud as any).caja || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Trazabilidad:</span>{" "}
                              <span className="text-gray-800">#{(solicitud as any).codigo_trazabilidad || "-"}</span>
                            </div>
                             <div>
                               <span className="text-gray-500">Guía:</span>{" "}
                               <span className="text-gray-800">{(solicitud as any).guia || "-"}</span>
                             </div>
                             {(solicitud as any).direccion && (
                               <div>
                                 <span className="text-gray-500">Dirección:</span>{" "}
                                 <span className="text-gray-800">{(solicitud as any).direccion}</span>
                               </div>
                             )}
                           </div>

                           {/* Opciones adicionales */}
                           {(solicitud as any).chimenea === "Si" || (solicitud as any).prueba === "Si" || (solicitud as any).terminado === "Si" || (solicitud as any).color ? (
                             <div className="grid grid-cols-2 gap-2 text-xs mt-2 p-2 bg-white rounded border border-gray-200">
                               {(solicitud as any).chimenea === "Si" && (
                                 <div>
                                   <span className="text-gray-500">Chimenea:</span>
                                   <span className="ml-1 font-medium text-gray-800">{(solicitud as any).chimenea}</span>
                                 </div>
                               )}
                               {(solicitud as any).prueba === "Si" && (
                                 <div>
                                   <span className="text-gray-500">Prueba:</span>
                                   <span className="ml-1 font-medium text-gray-800">{(solicitud as any).prueba}</span>
                                 </div>
                               )}
                               {(solicitud as any).terminado === "Si" && (
                                 <div>
                                   <span className="text-gray-500">Terminado:</span>
                                   <span className="ml-1 font-medium text-gray-800">{(solicitud as any).terminado}</span>
                                 </div>
                               )}
                               {(solicitud as any).color && (
                                 <div>
                                   <span className="text-gray-500">Color:</span>
                                   <span className="ml-1 font-medium text-gray-800">{(solicitud as any).color}</span>
                                 </div>
                               )}
                             </div>
                           ) : null}

                           {(solicitud as any).dientes_trabajados?.length > 0 && (
                             <div className="flex flex-wrap gap-1 mt-2">
                               {(solicitud as any).dientes_detallados?.length > 0
                                 ? (solicitud as any).dientes_detallados.map((d: any, i: number) => (
                                     <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">#{d.numero}{d.servicio ? ` - ${d.servicio}` : ""} - {d.estado}</span>
                                   ))
                                 : (solicitud as any).dientes_trabajados.map((diente: string, i: number) => (
                                     <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">#{diente}</span>
                                   ))
                               }
                             </div>
                           )}

                           {/* Dibujo del Odontólogo */}
                           {(solicitud as any).dibujo_odontologo && (
                             <div className="mt-2">
                               <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Dibujo del Odontólogo</p>
                               <img
                                 src={(solicitud as any).dibujo_odontologo}
                                 alt="Dibujo odontólogo"
                                 className="max-w-full h-auto rounded-lg border border-border"
                               />
                             </div>
                           )}

                           {/* Firma del Odontólogo */}
                           {(solicitud as any).firma && (
                             <div className="mt-2">
                               <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Firma del Odontólogo</p>
                               {String((solicitud as any).firma).startsWith("data:image") ? (
                                 <img
                                   src={(solicitud as any).firma}
                                   alt="Firma"
                                   className="h-16 w-auto rounded border border-border bg-white"
                                 />
                               ) : (
                                 <span className="text-xs text-muted-foreground">{(solicitud as any).firma}</span>
                               )}
                             </div>
                           )}

                           {/* Observaciones */}
                           {(solicitud as any).observaciones && (
                             <div className="mt-2">
                               <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                               <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">
                                 {(solicitud as any).observaciones}
                               </p>
                             </div>
                           )}

                           {/* Estado */}
                           <div className="mt-2">
                             <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                             <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium bg-primary/10 text-primary capitalize">
                               {(solicitud as any).estado?.replace("_", " ") || "Pendiente"}
                             </span>
                           </div>

                            {/* Estado */}
                            <div className="mt-2">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                              <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium bg-primary/10 text-primary capitalize">
                                {(solicitud as any).estado?.replace("_", " ") || "Pendiente"}
                              </span>
                            </div>

                            {(solicitud as any).materiales?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(solicitud as any).materiales.map((mat: string, i: number) => (
                                <span key={i} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">{mat}</span>
                              ))}
                            </div>
                          )}

                          {(solicitud as any).piezas_enviadas?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(solicitud as any).piezas_enviadas.map((pieza: string, i: number) => (
                                <span key={i} className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">{pieza}</span>
                              ))}
                            </div>
                          )}

                            {servicios.length > 0 && (
                              <div className="space-y-1">
                                {servicios.map((serv: any) => (
                                  <div key={serv.id} className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-700">{serv.nombre}</span>
                                    <span className="font-medium text-primary">${serv.precio ? Number(serv.precio).toLocaleString("es-CO") : "0"}</span>
                                  </div>
                                ))}
                              </div>
                             )}

                             {/* Precio Total */}
                             <div className="mt-2 flex items-center justify-between">
                               <div>
                                 <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Precio Total</p>
                                 <p className="text-sm font-bold text-primary">${precioTotal.toLocaleString("es-CO")}</p>
                               </div>
                             </div>

                            {/* Observaciones */}
                           {(solicitud as any).observaciones && (
                             <div className="mt-2">
                               <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                               <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">
                                 {(solicitud as any).observaciones}
                               </p>
                             </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
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

                            {/* Tabs detalle / chat / documentos */}
                            <div className="flex border-b border-border mt-2">
                              <button
                                onClick={() => handleSwitchTab(solicitud.id, "detalle")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${(activeTab[solicitud.id] ?? "detalle") === "detalle"
                                  ? "border-primary text-primary"
                                  : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <FileText size={14} />
                                Detalle
                              </button>
                              <button
                                onClick={() => {
                                  handleSwitchTab(solicitud.id, "chat")
                                  cargarMensajes(solicitud.id)
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${(activeTab[solicitud.id] ?? "detalle") === "chat"
                                  ? "border-primary text-primary"
                                  : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <MessageCircle size={14} />
                                Chat
                                {notificacionesNoLeidas[solicitud.id] > 0 && (
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                    {notificacionesNoLeidas[solicitud.id]}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => handleSwitchTab(solicitud.id, "documentos")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${(activeTab[solicitud.id] ?? "detalle") === "documentos"
                                  ? "border-primary text-primary"
                                  : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <Paperclip size={14} />
                                Documentos
                              </button>
                            </div>

                            {/* Tab: Chat */}
                            {(activeTab[solicitud.id] ?? "detalle") === "chat" && (
                              <div className="bg-gray-50 flex flex-col" style={{ minHeight: "320px" }}>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "400px" }}>
                                  {loadingMensajes[solicitud.id] ? (
                                    <div className="flex justify-center py-8">
                                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                  ) : !mensajesPorSolicitud[solicitud.id] || mensajesPorSolicitud[solicitud.id].length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                      <MessageCircle size={32} className="text-muted-foreground mb-2 opacity-40" />
                                      <p className="text-xs text-muted-foreground">Sin mensajes aún.</p>
                                      <p className="text-[10px] text-muted-foreground mt-1">Envía un mensaje al cliente sobre esta solicitud.</p>
                                    </div>
                                  ) : (
                                    mensajesPorSolicitud[solicitud.id].map((msg: any, idx: number, arr: any[]) => {
                                      const esAdmin = msg.remitente === "admin"
                                      const fechaActual = new Date(msg.created_at).toDateString()
                                      const fechaAnterior = idx > 0 ? new Date(arr[idx - 1].created_at).toDateString() : null
                                      const mostrarFecha = fechaActual !== fechaAnterior

                                      return (
                                        <div key={msg.id}>
                                          {mostrarFecha && (
                                            <div className="flex items-center gap-2 my-2">
                                              <div className="flex-1 h-px bg-border" />
                                              <span className="text-[10px] text-muted-foreground px-2">
                                                {new Date(msg.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                                              </span>
                                              <div className="flex-1 h-px bg-border" />
                                            </div>
                                          )}
                                          <div className={`flex flex-col ${esAdmin ? "items-end" : "items-start"}`}>
                                            <div className={`flex items-center gap-1 mb-1 text-[10px] text-muted-foreground ${esAdmin ? "flex-row-reverse" : ""}`}>
                                              {esAdmin ? (
                                                <Shield size={11} className="text-primary" />
                                              ) : (
                                                <User size={11} />
                                              )}
                                              <span>{esAdmin ? "Admin" : clientData?.nombre || "Cliente"}</span>
                                            </div>
                                            <div
                                              className={`max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed ${esAdmin
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-white border border-border text-foreground rounded-tl-sm"
                                                }`}
                                            >
                                              <p className="whitespace-pre-line break-words">
                                                {msg.contenido}
                                              </p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1">
                                              {formatFechaMensajeSolicitud(msg.created_at)}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    })
                                  )}
                                  <div ref={(el) => { chatBottomRefs.current[solicitud.id] = el }} />
                                </div>

                                {/* Input de mensaje */}
                                <div className="border-t border-border bg-white p-3">
                                  <div className="flex gap-2 items-end">
                                    <textarea
                                      value={mensajeInput[solicitud.id] ?? ""}
                                      onChange={(e) =>
                                        setMensajeInput((prev) => ({ ...prev, [solicitud.id]: e.target.value }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault()
                                          handleEnviarMensaje(solicitud.id)
                                        }
                                      }}
                                      placeholder="Escribe un mensaje al cliente... (Enter para enviar)"
                                      rows={1}
                                      className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                                      style={{ maxHeight: "80px" }}
                                      onInput={(e) => {
                                        const el = e.currentTarget
                                        el.style.height = "auto"
                                        el.style.height = Math.min(el.scrollHeight, 80) + "px"
                                      }}
                                    />
                                    <button
                                      onClick={() => handleEnviarMensaje(solicitud.id)}
                                      disabled={enviandoMensaje[solicitud.id] || !mensajeInput[solicitud.id]?.trim()}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                                    >
                                      {enviandoMensaje[solicitud.id] ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : (
                                        <Send size={14} />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-1.5">
                                    Shift+Enter para nueva línea
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Tab: Documentos */}
                            {(activeTab[solicitud.id] ?? "detalle") === "documentos" && (
                              <div className="bg-gray-50 p-4">
                                <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Documentos de la Solicitud</p>
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-gray-500 shrink-0" />
                                  {solicitud.guia_fabricacion ? (
                                    <a href={solicitud.guia_fabricacion} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                      Ficha Técnica
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-500">Ficha Técnica - No subido</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-gray-500 shrink-0" />
                                  {solicitud.terminos_garantia ? (
                                    <a href={solicitud.terminos_garantia} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                      Términos de Garantía
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-500">Términos de Garantía - No subido</span>
                                  )}
                                </div>
                                  {solicitud.urls_documentos && solicitud.urls_documentos.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                      <p className="text-[10px] text-gray-500 mb-1">Archivos adjuntos:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {solicitud.urls_documentos.map((url, idx) => (
                                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
                                            Adjunto {idx + 1}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                   {(solicitud as any).odontologo_firma && (
                                     <div className="mt-2 pt-2 border-t border-border">
                                       <p className="text-[10px] text-gray-500 mb-1">Firma del Odontólogo</p>
                                       {String((solicitud as any).odontologo_firma).startsWith("data:image") ? (
                                         <img
                                           src={(solicitud as any).odontologo_firma}
                                           alt="Firma"
                                           className="h-16 w-auto rounded border border-border bg-white"
                                         />
                                       ) : (
                                         <span className="text-xs text-muted-foreground">{(solicitud as any).odontologo_firma}</span>
                                       )}
                                     </div>
                                   )}
                                    <div className="mt-4 pt-3 border-t border-border">
                                      <SurveyForm
                                        solicitudId={solicitud.id}
                                        defaultEmail={clientData?.correo ?? ""}
                                        defaultPaciente={solicitud.paciente ?? ""}
                                        surveyResponses={surveyResponses}
                                        setSurveyResponses={setSurveyResponses}
                                        submittingSurvey={submittingSurvey}
                                        setSubmittingSurvey={setSubmittingSurvey}
                                        surveySuccess={surveySuccess}
                                        setSurveySuccess={setSurveySuccess}
                                      />
                                      <div className="mt-4">
                                        <ComplaintsSurvey
                                          solicitudId={solicitud.id}
                                          defaultEmail={clientData?.correo ?? ""}
                                          defaultPaciente={solicitud.paciente ?? ""}
                                          surveyResponses={complaintsResponses}
                                          setSurveyResponses={setComplaintsResponses}
                                          submittingSurvey={submittingComplaints}
                                          setSubmittingSurvey={setSubmittingComplaints}
                                          surveySuccess={complaintsSuccess}
                                          setSurveySuccess={setComplaintsSuccess}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
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
                  <p className="text-sm text-foreground">
                    {(selectedSolicitud as any).servicios_detalle?.length > 0
                      ? (selectedSolicitud as any).servicios_detalle.map((s: any) => s.nombre).join(", ")
                      : selectedSolicitud.servicio}
                  </p>
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
                {(selectedSolicitud as any).odontologo_registro_medico && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registro Médico</p>
                    <p className="text-sm text-foreground">{(selectedSolicitud as any).odontologo_registro_medico}</p>
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
                                        ? "Ficha Técnica"
                                        : "Manual de Uso"
                                  const url =
                                    campo === "declaracion_conformidad"
                                      ? servicio.declaracion_conformidad
                                      : campo === "guia_fabricacion"
                                        ? servicio.guia_fabricacion
                                        : servicio.manual_uso

                                  return (
                                    <div key={campo} className="flex items-center gap-2">
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
