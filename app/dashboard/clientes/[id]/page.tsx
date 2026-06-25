"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  X,
  Wallet,
  CreditCard,
  MessageCircle,
  Calendar,
  Shield,
  User,
  Search,
  Plus,
  Filter,
  Paperclip,
  Send,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  updated_at: string | null
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
  dientes_trabajados: string[] | null
  dibujo_odontologo: string | null
  declaracion_conformidad: string | null
  guia_fabricacion: string | null
  manual_uso: string | null
  comprobante_pago: string | null
  estado_pago: string | null
  fecha_pago: string | null
  observaciones_pago: string | null
  conversacion_id?: number
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
  const searchParams = useSearchParams()
  const solicitudIdParam = searchParams.get("solicitud")
  const { toast } = useToast()
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
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})
  const [editandoEstado, setEditandoEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState("")
  const [editandoServicioId, setEditandoServicioId] = useState<number | null>(null)
  const [editandoServicioData, setEditandoServicioData] = useState<{ nombre: string; precio: string }>({ nombre: "", precio: "" })
  const [guardando, setGuardando] = useState(false)
  const [editandoSolicitudId, setEditandoSolicitudId] = useState<number | null>(null)
  const [editTiposTrabajo, setEditTiposTrabajo] = useState<string[]>([])
  const [editMateriales, setEditMateriales] = useState<string[]>([])
  const [editDientes, setEditDientes] = useState<string[]>([])
  const [expandedSolicitud, setExpandedSolicitud] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<{ [solicitudId: number]: "detalle" | "chat" }>({})
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<{ [solicitudId: number]: number }>({})
  const [mensajesPorSolicitud, setMensajesPorSolicitud] = useState<{ [solicitudId: number]: any[] }>({})
  const [mensajeInput, setMensajeInput] = useState<{ [solicitudId: number]: string }>({})
  const [enviandoMensaje, setEnviandoMensaje] = useState<{ [solicitudId: number]: boolean }>({})
  const [loadingMensajes, setLoadingMensajes] = useState<{ [solicitudId: number]: boolean }>({})
  const chatBottomRefs = useRef<{ [solicitudId: number]: HTMLDivElement | null }>({})

  const [guardandoServicio, setGuardandoServicio] = useState<number | null>(null)

  const [mostrarEstadoCuenta, setMostrarEstadoCuenta] = useState<{ [clienteId: number]: boolean }>({})
  const [itemsEstadoCuenta, setItemsEstadoCuenta] = useState<{ [clienteId: number]: any[] }>({})
  const [totalPagarPorCliente, setTotalPagarPorCliente] = useState<{ [clienteId: number]: number }>({})
  const [cargandoEstadoCuenta, setCargandoEstadoCuenta] = useState<{ [clienteId: number]: boolean }>({})
  const [pagoDocs, setPagoDocs] = useState<{ [itemId: number]: File | null }>({})
  const [uploadingPagoDoc, setUploadingPagoDoc] = useState<{ [itemId: number]: boolean }>({})
  const [pagoStatusUpdating, setPagoStatusUpdating] = useState<{ [itemId: number]: boolean }>({})

  const [solicitudDocs, setSolicitudDocs] = useState<{ declaracion_conformidad: File | null; guia_fabricacion: File | null; manual_uso: File | null }>({
    declaracion_conformidad: null,
    guia_fabricacion: null,
    manual_uso: null,
  })
  const [uploadingSolicitudDoc, setUploadingSolicitudDoc] = useState<{ declaracion_conformidad: boolean; guia_fabricacion: boolean; manual_uso: boolean }>({
    declaracion_conformidad: false,
    guia_fabricacion: false,
    manual_uso: false,
  })
  const [uploadSolicitudError, setUploadSolicitudError] = useState<{ declaracion_conformidad: string; guia_fabricacion: string; manual_uso: string }>({
    declaracion_conformidad: "",
    guia_fabricacion: "",
    manual_uso: "",
  })
  const [uploadSolicitudSuccess, setUploadSolicitudSuccess] = useState<{ declaracion_conformidad: boolean; guia_fabricacion: boolean; manual_uso: boolean }>({
    declaracion_conformidad: false,
    guia_fabricacion: false,
    manual_uso: false,
  })

  useEffect(() => {
    if (editandoSolicitudId) {
      const solicitud = solicitudes.find(s => s.id === editandoSolicitudId)
      if (solicitud) {
        setSelectedSolicitud(solicitud)
        setEditTiposTrabajo(solicitud.tipos_trabajo || [])
        setEditMateriales(solicitud.materiales || [])
        setEditDientes(solicitud.dientes_trabajados || [])
      }
    }
  }, [editandoSolicitudId, solicitudes])

  useEffect(() => {
    if (solicitudIdParam && solicitudes.length > 0) {
      const idNum = parseInt(solicitudIdParam)
      if (!isNaN(idNum) && solicitudes.some(s => s.id === idNum)) {
        setExpandedSolicitud(idNum)
      }
    }
  }, [solicitudIdParam, solicitudes])

  const handleGuardarSolicitud = async () => {
    if (!selectedSolicitud) return
    const tipos = editTiposTrabajo.filter(t => t.trim())
    const materiales = editMateriales.filter(m => m.trim())
    const dientes = editDientes.filter(d => d.trim())
    setGuardando(true)
    try {
      const payload: any = {
        tipos_trabajo: tipos,
        materiales: materiales,
        dientes_trabajados: dientes,
        observaciones: selectedSolicitud.observaciones,
        fecha_entrega: selectedSolicitud.fecha_entrega,
        estado: selectedSolicitud.estado,
      }
      ;["chimenea", "prueba", "terminado", "color", "guia", "caja", "codigo_trazabilidad", "piezas_enviadas", "historia_clinica", "fecha_elaboracion"].forEach((campo) => {
        const val = (selectedSolicitud as any)[campo]
        if (val !== undefined && val !== null) {
          payload[campo] = val
        }
      })

      const { error } = await supabase
        .from("solicitudes")
        .update(payload)
        .eq("id", selectedSolicitud.id)

      if (error) throw error

      const { data: refreshed } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("id", selectedSolicitud.id)
        .single()

      if (refreshed) {
        setSolicitudes((prev) =>
          prev.map((s) => (s.id === selectedSolicitud.id ? refreshed : s))
        )
      }

      toast({ title: "Solicitud actualizada", description: "Los cambios se guardaron correctamente." })
      setEditandoSolicitudId(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo actualizar.", variant: "destructive" })
    } finally {
      setGuardando(false)
    }
  }

  const handleUploadDocSolicitud = async (solicitudId: number, campo: "declaracion_conformidad" | "guia_fabricacion" | "manual_uso") => {
    const archivo = solicitudDocs[campo]
    if (!archivo) return

    const solicitud = solicitudes.find(s => s.id === solicitudId)
    if (!solicitud) return

    setUploadingSolicitudDoc((prev) => ({ ...prev, [campo]: true }))
    setUploadSolicitudError((prev) => ({ ...prev, [campo]: "" }))
    setUploadSolicitudSuccess((prev) => ({ ...prev, [campo]: false }))

    try {
      const extension = archivo.name.split(".").pop()?.toLowerCase() || "bin"
      const nombreUnico = `solicitudes/${solicitudId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(nombreUnico, archivo, {
          upsert: true,
          contentType: archivo.type || "application/octet-stream",
        })

      if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

      const { data: publicData } = supabase.storage.from("documentos").getPublicUrl(nombreUnico)
      const publicUrl = publicData.publicUrl

      const { error: updateError } = await supabase
        .from("solicitudes")
        .update({ [campo]: publicUrl })
        .eq("id", solicitudId)

      if (updateError) throw new Error(`Error al guardar: ${updateError.message}`)

      const { data: refreshed } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("id", solicitudId)
        .single()

      if (refreshed) {
        setSolicitudes((prev) =>
          prev.map((s) => (s.id === solicitudId ? refreshed : s))
        )
        setSelectedSolicitud(refreshed)
      }

      setSolicitudDocs((prev) => ({ ...prev, [campo]: null }))
      setUploadSolicitudSuccess((prev) => ({ ...prev, [campo]: true }))
      toast({ title: "Documento subido", description: "El documento se subió correctamente." })
    } catch (err: any) {
      const msg = err.message || "No se pudo subir el documento."
      setUploadSolicitudError((prev) => ({ ...prev, [campo]: msg }))
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setUploadingSolicitudDoc((prev) => ({ ...prev, [campo]: false }))
    }
  }

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
        const { data, error } = await supabase
          .from("solicitudes")
          .select("*")
          .eq("cliente_id", numericId)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setSolicitudes(data as Solicitud[])
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
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .eq("solicitud_id", solicitud.id)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setServiciosDetalle(data as Servicio[])
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
    setEditandoEstado(false)
    setEditandoServicioId(null)
  }

  const handleGuardarEstado = async () => {
    if (!selectedSolicitud || !nuevoEstado) return
    setGuardando(true)
    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({ estado: nuevoEstado })
        .eq("id", selectedSolicitud.id)

      if (error) throw error

      setSolicitudes((prev) =>
        prev.map((s) => (s.id === selectedSolicitud.id ? { ...s, estado: nuevoEstado } : s))
      )
      setSelectedSolicitud((prev) => prev ? { ...prev, estado: nuevoEstado } : prev)

      toast({
        title: "Estado actualizado",
        description: `La solicitud ahora está en "${nuevoEstado.replace("_", " ")}".`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el estado.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
      setEditandoEstado(false)
    }
  }

  const handleGuardarServicio = async (servicioId: number) => {
    setGuardando(true)
    try {
      const precioNum = editandoServicioData.precio ? Number(editandoServicioData.precio) : null
      const { error } = await supabase
        .from("servicios")
        .update({
          nombre: editandoServicioData.nombre,
          precio: precioNum,
        })
        .eq("id", servicioId)

      if (error) throw error

      setServiciosDetalle((prev) =>
        prev.map((s) => (s.id === servicioId ? { ...s, nombre: editandoServicioData.nombre, precio: precioNum } : s))
      )

      toast({
        title: "Servicio actualizado",
        description: "Los cambios se guardaron correctamente.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el servicio.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
      setEditandoServicioId(null)
    }
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
    setUploadError((prev) => ({ ...prev, [uploadKey]: "" }))
    setUploadSuccess((prev) => ({ ...prev, [uploadKey]: false }))

    try {
      const extension = archivo.name.split(".").pop()?.toLowerCase() || "bin"
      const nombreUnico = `servicios/${servicioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(nombreUnico, archivo, {
          upsert: true,
          contentType: archivo.type || "application/octet-stream",
        })

      if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

      const { data: publicData } = supabase.storage.from("documentos").getPublicUrl(nombreUnico)
      const publicUrl = publicData.publicUrl

      const { error: updateError } = await supabase
        .from("servicios")
        .update({ [campo]: publicUrl })
        .eq("id", servicioId)

      if (updateError) throw new Error(`Error al guardar: ${updateError.message}`)

      const { data: refreshed } = await supabase
        .from("servicios")
        .select("*")
        .eq("id", servicioId)
        .single()

      if (refreshed) {
        setServiciosDetalle((prev) =>
          prev.map((s) => (s.id === servicioId ? refreshed : s))
        )
      }

      setServicioDocs((prev) => {
        const servicioDocs = { ...prev }
        if (servicioDocs[servicioId]) {
          servicioDocs[servicioId] = { ...servicioDocs[servicioId], [campo]: null }
        }
        return servicioDocs
      })

      setUploadSuccess((prev) => ({ ...prev, [uploadKey]: true }))
      toast({ title: "Documento subido", description: "El documento se subió correctamente." })
    } catch (err: any) {
      const msg = err.message || "No se pudo subir el documento."
      setUploadError((prev) => ({ ...prev, [uploadKey]: msg }))
      toast({ title: "Error", description: msg, variant: "destructive" })
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

  const toggleSolicitud = (solicitudId: number) => {
    setExpandedSolicitud((prev) => prev === solicitudId ? null : solicitudId)
  }

  const handleSwitchTab = (solicitudId: number, tab: "detalle" | "chat") => {
    setActiveTab((prev) => ({ ...prev, [solicitudId]: tab }))
  }

  const cargarMensajes = async (solicitudId: number) => {
    setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const solicitud = solicitudes.find(s => s.id === solicitudId)
      const conversacionId = solicitud.conversacion_id || solicitudId
      
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMensajesPorSolicitud((prev) => ({ ...prev, [solicitudId]: data || [] }))
      
      const noLeidos = (data || []).filter((m: any) => !m.leido && m.remitente === "cliente").length
      setMensajesNoLeidos((prev) => ({ ...prev, [solicitudId]: noLeidos }))
    } catch (err) {
      console.error("Error cargando mensajes:", err)
    } finally {
      setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const handleEnviarMensaje = async (solicitudId: number) => {
    const mensaje = mensajeInput[solicitudId]?.trim()
    if (!mensaje) return
    
    setEnviandoMensaje((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const solicitud = solicitudes.find(s => s.id === solicitudId)
      const conversacionId = solicitud.conversacion_id || solicitudId
      
      const { error } = await supabase
        .from("mensajes")
        .insert({
          conversacion_id: conversacionId,
          remitente: "admin",
          contenido: mensaje,
        })

      if (error) throw error

      setMensajesPorSolicitud((prev) => ({
        ...prev,
        [solicitudId]: [...(prev[solicitudId] || []), { ...mensaje, id: Date.now(), remitente: "admin", created_at: new Date().toISOString() }],
      }))
      setMensajeInput((prev) => ({ ...prev, [solicitudId]: "" }))
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

  const esImagen = (url: string) => url.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)$/i)
  const esDocumento = (url: string) => url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i)

  const handleToggleEstadoCuenta = async (clienteId: number) => {
    setMostrarEstadoCuenta((prev) => ({ ...prev, [clienteId]: !prev[clienteId] }))
    if (!itemsEstadoCuenta[clienteId] && !cargandoEstadoCuenta[clienteId]) {
      await cargarEstadoCuenta(clienteId)
    }
  }

  const cargarEstadoCuenta = async (clienteId: number) => {
    setCargandoEstadoCuenta((prev) => ({ ...prev, [clienteId]: true }))
    try {
      const { data: servicios } = await supabase
        .from("servicios")
        .select(`
          id,
          solicitud_id,
          nombre,
          precio,
          created_at,
          solicitudes!inner(cliente_id)
        `)
        .eq("solicitudes.cliente_id", clienteId)
        .order("created_at", { ascending: true })

      const items = (servicios || []).map((s: any) => {
        const solicitud = solicitudes.find(sol => sol.id === s.solicitud_id)
        return {
          solicitudId: s.solicitud_id,
          servicio: s.nombre,
          precio: s.precio,
          estado: solicitud?.estado || "pendiente",
          fecha: s.created_at,
          estado_pago: solicitud?.estado_pago || "pendiente_pago",
          comprobante_pago: (s as any).comprobante_pago || null,
        }
      })

      setItemsEstadoCuenta((prev) => ({ ...prev, [clienteId]: items }))
      setTotalPagarPorCliente((prev) => ({
        ...prev,
        [clienteId]: items.reduce((sum, item) => sum + (item.precio || 0), 0),
      }))
    } catch (err) {
      console.error("Error cargando estado de cuenta:", err)
    } finally {
      setCargandoEstadoCuenta((prev) => ({ ...prev, [clienteId]: false }))
    }
  }

  const handleSubirComprobantePago = async (solicitudId: number, itemId: number) => {
    const file = pagoDocs[itemId]
    if (!file) return

    setUploadingPagoDoc((prev) => ({ ...prev, [itemId]: true }))
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `pagos/${solicitudId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from("solicitudes")
        .update({ comprobante_pago: publicUrl, estado_pago: "pendiente_validacion" })
        .eq("id", solicitudId)

      if (updateError) throw updateError

      setSolicitudes((prev) =>
        prev.map((s) => s.id === solicitudId ? { ...s, comprobante_pago: publicUrl, estado_pago: "pendiente_validacion" } : s)
      )

      setItemsEstadoCuenta((prev) => ({
        ...prev,
        [client!.id]: (prev[client!.id] || []).map((item) =>
          item.solicitudId === solicitudId ? { ...item, comprobante_pago: publicUrl, estado_pago: "pendiente_validacion" } : item
        ),
      }))

      toast({ title: "Comprobante subido", description: "El comprobante se subió correctamente." })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo subir el comprobante.", variant: "destructive" })
    } finally {
      setUploadingPagoDoc((prev) => ({ ...prev, [itemId]: false }))
      setPagoDocs((prev) => {
        const next = { ...prev }
        delete next[itemId]
        return next
      })
    }
  }

  const handleActualizarEstadoPago = async (solicitudId: number, nuevoEstadoPago: string) => {
    setPagoStatusUpdating((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      const { error } = await supabase
        .from("solicitudes")
        .update({ estado_pago: nuevoEstadoPago })
        .eq("id", solicitudId)

      if (error) throw error

      setSolicitudes((prev) =>
        prev.map((s) => s.id === solicitudId ? { ...s, estado_pago: nuevoEstadoPago } : s)
      )

      setItemsEstadoCuenta((prev) => ({
        ...prev,
        [client!.id]: (prev[client!.id] || []).map((item) =>
          item.solicitudId === solicitudId ? { ...item, estado_pago: nuevoEstadoPago } : item
        ),
      }))

      toast({ title: "Estado actualizado", description: "El estado de pago se actualizó correctamente." })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo actualizar el estado.", variant: "destructive" })
    } finally {
      setPagoStatusUpdating((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const getPagoStyle = (estado: string) => {
    const styles: Record<string, string> = {
      pendiente_pago: "bg-amber-100 text-amber-700",
      pendiente_validacion: "bg-blue-100 text-blue-700",
      aprobado: "bg-green-100 text-green-700",
      rechazado: "bg-red-100 text-red-700",
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
          <button
            onClick={() => handleToggleEstadoCuenta(client!.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Wallet size={18} />
            {mostrarEstadoCuenta[client!.id] ? "Ocultar Estado de Cuenta" : "Estado de Cuenta"}
          </button>
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

      {/* Solicitudes del Cliente */}
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
        <div className="p-5">
          {loadingSolicitudes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : solicitudes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Este cliente aún no tiene solicitudes registradas.
            </p>
          ) : (
            <div className="space-y-3">
              {solicitudes.map((solicitud) => {
                const isSolicitudExpanded = expandedSolicitud === solicitud.id
                const tabActiva = activeTab[solicitud.id] ?? "detalle"
                const noLeidos = mensajesNoLeidos[solicitud.id] ?? 0

                return (
                  <div
                    key={solicitud.id}
                    className="rounded-xl border border-border bg-white overflow-hidden"
                  >
                    {/* Header de solicitud */}
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
                              {solicitud.estado?.replace("_", " ") || "Pendiente"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(solicitud.created_at).toLocaleDateString("es-CO")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {noLeidos > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                              <MessageCircle size={10} />
                              {noLeidos} sin leer
                            </span>
                          )}
                          {solicitud.precio && (
                            <span className="text-sm font-bold text-primary">
                              ${solicitud.precio?.toLocaleString("es-CO")}
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

                    {/* Detalles expandidos */}
                    <AnimatePresence>
                      {isSolicitudExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-border"
                        >
                          {/* Tabs detalle / chat */}
                          <div className="flex border-b border-border bg-white">
                            <button
                              onClick={() => handleSwitchTab(solicitud.id, "detalle")}
                              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tabActiva === "detalle"
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
                              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tabActiva === "chat"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                              <MessageCircle size={14} />
                              Chat con cliente
                              {noLeidos > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                  {noLeidos}
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Tab: Detalle */}
                          {tabActiva === "detalle" && (
                            <div className="bg-gray-50 p-4">
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
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-gray-400" />
                                  <span className="text-gray-500">Elaboración:</span>
                                  <span className="font-medium text-gray-800">
                                    {solicitud.fecha_elaboracion || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-gray-400" />
                                  <span className="text-gray-500">Entrega:</span>
                                  <span className="font-medium text-gray-800">
                                    {solicitud.fecha_entrega || "-"}
                                  </span>
                                </div>
                              </div>

                              {/* Datos Odontólogo y Paciente */}
                              <div className="space-y-2 text-xs mb-4">
                                {solicitud.odontologo && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 flex-1">
                                      <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">ODONTÓLOGO(A):</span>
                                      <span className="text-sm text-gray-800">{solicitud.odontologo || "-"}</span>
                                    </div>
                                  </div>
                                )}
                                {solicitud.cc_odontologo && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 flex-1">
                                      <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">CC. ODONTÓLOGO:</span>
                                      <span className="text-sm text-gray-800">{solicitud.cc_odontologo || "-"}</span>
                                    </div>
                                  </div>
                                )}
                                {solicitud.paciente && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 flex-1">
                                      <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">PACIENTE:</span>
                                      <span className="text-sm text-gray-800">{solicitud.paciente || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 w-32">
                                      <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">CC.:</span>
                                      <span className="text-sm text-gray-800">{solicitud.cc_paciente || "-"}</span>
                                    </div>
                                  </div>
                                )}
                                {solicitud.direccion && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">DIRECCIÓN:</span>
                                    <span className="text-sm text-gray-800">{solicitud.direccion || "-"}</span>
                                  </div>
                                )}
                                {solicitud.firma && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">FIRMA:</span>
                                    <span className="text-sm text-gray-800">{solicitud.firma || "-"}</span>
                                  </div>
                                )}
                              </div>

                              {/* Opciones adicionales */}
                              {solicitud.chimenea === "Si" || solicitud.prueba === "Si" || solicitud.terminado === "Si" || solicitud.color || solicitud.guia || (solicitud.dientes_trabajados && solicitud.dientes_trabajados.length > 0) ? (
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
                                  {solicitud.guia && (
                                    <div>
                                      <span className="text-gray-500">Guía:</span>
                                      <span className="ml-1 font-medium text-gray-800">{solicitud.guia}</span>
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {/* Tipos de trabajo */}
                              {solicitud.tipos_trabajo && solicitud.tipos_trabajo.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Tipos de Trabajo</p>
                                  <div className="flex flex-wrap gap-1">
                                    {solicitud.tipos_trabajo.map((tipo: string, i: number) => (
                                      <span key={i} className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                        {tipo}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Materiales */}
                              {solicitud.materiales && solicitud.materiales.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Materiales</p>
                                  <div className="flex flex-wrap gap-1">
                                    {solicitud.materiales.map((mat: string, i: number) => (
                                      <span key={i} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                        {mat}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Dientes trabajados */}
                              {solicitud.dientes_trabajados && solicitud.dientes_trabajados.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Dientes Trabajados</p>
                                  <div className="flex flex-wrap gap-1">
                                    {solicitud.dientes_trabajados.map((diente: string, i: number) => (
                                      <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                                        #{diente}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Piezas enviadas */}
                              {solicitud.piezas_enviadas && solicitud.piezas_enviadas.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Piezas Enviadas</p>
                                  <div className="flex flex-wrap gap-1">
                                    {solicitud.piezas_enviadas.map((pieza: string, i: number) => (
                                      <span key={i} className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                                        {pieza}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Código de Trazabilidad */}
                              {solicitud.codigo_trazabilidad && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Cód. Trazabilidad</p>
                                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                    #{solicitud.codigo_trazabilidad}
                                  </span>
                                </div>
                              )}

                              {/* Dibujo del Odontólogo */}
                              {solicitud.dibujo_odontologo && (
                                <div className="mb-4">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Dibujo del Odontólogo</p>
                                  <img
                                    src={solicitud.dibujo_odontologo}
                                    alt="Dibujo odontólogo"
                                    className="max-w-full h-auto rounded-lg border border-border"
                                  />
                                </div>
                              )}

                              {/* Observaciones */}
                              {solicitud.observaciones && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                                  <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">
                                    {solicitud.observaciones}
                                  </p>
                                </div>
                              )}

                              {/* Estado */}
                              <div className="mb-4">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                                {editandoSolicitudId === solicitud.id ? (
                                  <select
                                    value={selectedSolicitud?.estado || solicitud.estado}
                                    onChange={(e) => setSelectedSolicitud(prev => prev ? { ...prev, estado: e.target.value } : null)}
                                    className="text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                                  >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_proceso">En proceso</option>
                                    <option value="finalizado">Finalizado</option>
                                    <option value="aprobado">Aprobado</option>
                                    <option value="cancelado">Cancelado</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${getEstadoStyle(solicitud.estado)}`}>
                                    {formatEstado(solicitud.estado)}
                                  </span>
                                )}
                              </div>

                              {/* Botón editar */}
                              {editandoSolicitudId !== solicitud.id ? (
                                 <button
                                   onClick={() => {
                                     setEditandoSolicitudId(solicitud.id)
                                   }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted"
                                >
                                  <Edit3 size={12} />
                                  Editar solicitud
                                </button>
                              ) : (
                                <div className="space-y-3 rounded-lg border border-border bg-white p-4">
                                  <div>
                                    <label className="text-[10px] font-medium text-foreground mb-1 block">Tipos de Trabajo (uno por línea)</label>
                                    <textarea
                                      value={editTiposTrabajo.join("\n")}
                                      onChange={(e) => setEditTiposTrabajo(e.target.value.split("\n"))}
                                      rows={3}
                                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                      placeholder="Corona, Puente, Implante..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-medium text-foreground mb-1 block">Materiales (uno por línea)</label>
                                    <textarea
                                      value={editMateriales.join("\n")}
                                      onChange={(e) => setEditMateriales(e.target.value.split("\n"))}
                                      rows={3}
                                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                      placeholder="Porcelana, Zirconio, Metal..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-medium text-foreground mb-1 block">Dientes Trabajados (uno por línea)</label>
                                    <textarea
                                      value={editDientes.join("\n")}
                                      onChange={(e) => setEditDientes(e.target.value.split("\n"))}
                                      rows={2}
                                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                      placeholder="11, 21, 36..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-medium text-foreground mb-1 block">Observaciones</label>
                                    <textarea
                                      value={selectedSolicitud?.observaciones || ""}
                                      onChange={(e) => setSelectedSolicitud(prev => prev ? { ...prev, observaciones: e.target.value } : null)}
                                      rows={3}
                                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                      placeholder="Observaciones adicionales..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-medium text-foreground mb-1 block">Fecha de Entrega</label>
                                    <input
                                      type="date"
                                      value={selectedSolicitud?.fecha_entrega || ""}
                                      onChange={(e) => setSelectedSolicitud(prev => prev ? { ...prev, fecha_entrega: e.target.value } : null)}
                                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Chimenea", "Prueba", "Terminado", "Color", "Guía"].map((campo) => (
                                      <div key={campo} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`edit-${campo}`}
                                          checked={(selectedSolicitud as any)?.[campo.toLowerCase()] === "Si"}
                                          onChange={(e) => {
                                            setSelectedSolicitud(prev => {
                                              if (!prev) return prev
                                              const key = campo.toLowerCase() as keyof Solicitud
                                              return {
                                                ...prev,
                                                [key]: e.target.checked ? "Si" : "No"
                                              }
                                            })
                                          }}
                                          className="rounded border-border"
                                        />
                                        <label htmlFor={`edit-${campo}`} className="text-[10px] font-medium text-foreground">{campo}</label>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => { handleGuardarSolicitud(); setEditandoSolicitudId(null); }}
                                      disabled={guardando}
                                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                                    >
                                      {guardando ? (
                                        <><Loader2 size={12} className="animate-spin" /> Guardando</>
                                      ) : (
                                        <><Save size={12} /> Guardar</>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setEditandoSolicitudId(null)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Documentos de la solicitud */}
                              <div className="mt-4">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Documentos de la Solicitud</p>
                                <div className="space-y-2">
                                  {(["declaracion_conformidad", "guia_fabricacion", "manual_uso"] as const).map((campo) => {
                                    const url = solicitud[campo]
                                    const etiqueta = campo === "declaracion_conformidad" ? "Declaración de Conformidad" : campo === "guia_fabricacion" ? "Guía de Fabricación" : "Manual de Uso"
                                    const uploading = uploadingSolicitudDoc[campo]
                                    const error = uploadSolicitudError[campo]
                                    const success = uploadSolicitudSuccess[campo]

                                    return (
                                      <div key={campo} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <FileText size={14} className="text-gray-500 shrink-0" />
                                          {url ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">
                                              {etiqueta}
                                            </a>
                                          ) : (
                                            <span className="text-xs text-gray-500 truncate">{etiqueta} - No subido</span>
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
                                              if (file) setSolicitudDocs((prev) => ({ ...prev, [campo]: file }))
                                            }}
                                          />
                                          <label
                                            htmlFor={`solicitud-${solicitud.id}-${campo}`}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                                          >
                                            <Upload size={12} />
                                            {solicitudDocs[campo]
                                              ? solicitudDocs[campo].name.substring(0, 15) + "..."
                                              : url
                                                ? "Reemplazar"
                                                : "Adjuntar"}
                                          </label>
                                          {(solicitudDocs[campo] || url) && (
                                          <button
                                            onClick={() => handleUploadDocSolicitud(solicitud.id, campo)}
                                            disabled={uploadingSolicitudDoc[campo]}
                                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                                          >
                                            {uploadingSolicitudDoc[campo] ? (
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
                                  {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
                                </div>
                              </div>

                              {/* Servicios Vinculados */}
                              <div className="mt-4">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Trabajos / Servicios</p>
                                {loadingDetalle && serviciosDetalle.length === 0 ? (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando servicios...
                                  </div>
                                ) : serviciosDetalle.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-3">No hay trabajos adicionales registrados.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {serviciosDetalle.map((servicio, idx) => {
                                      const editando = editandoServicioId === servicio.id
                                      return (
                                        <div key={servicio.id} className="flex items-start justify-between bg-white p-3 rounded-lg border border-gray-200">
                                          <div className="flex-1">
                                            {editando ? (
                                              <div className="space-y-2">
                                                <input
                                                  type="text"
                                                  value={editandoServicioData.nombre}
                                                  onChange={(e) => setEditandoServicioData((prev) => ({ ...prev, nombre: e.target.value }))}
                                                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                                                />
                                                <input
                                                  type="number"
                                                  value={editandoServicioData.precio}
                                                  onChange={(e) => setEditandoServicioData((prev) => ({ ...prev, precio: e.target.value }))}
                                                  className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5"
                                                />
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() => handleGuardarServicio(servicio.id)}
                                                    disabled={guardando}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                                                  >
                                                    {guardando ? (
                                                      <><Loader2 size={12} className="animate-spin" /> Guardando</>
                                                    ) : (
                                                      <><Save size={12} /> Guardar</>
                                                    )}
                                                  </button>
                                                  <button
                                                    onClick={() => setEditandoServicioId(null)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted"
                                                  >
                                                    Cancelar
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <div className="flex items-center justify-between gap-2">
                                                  <p className="text-sm font-medium text-gray-800">{idx + 1}. {servicio.nombre}</p>
                                                  <button
                                                    onClick={() => { setEditandoServicioId(servicio.id); setEditandoServicioData({ nombre: servicio.nombre || "", precio: servicio.precio ? String(servicio.precio) : "" }) }}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted shrink-0"
                                                  >
                                                    <Edit3 size={12} />
                                                    Editar
                                                  </button>
                                                </div>
                                                {servicio.descripcion && <p className="text-xs text-gray-600 mt-0.5">{servicio.descripcion}</p>}
                                                <p className="text-xs font-medium text-primary mt-1">
                                                  Precio: ${servicio.precio ? Number(servicio.precio).toLocaleString("es-CO") : "0"}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                  {(["declaracion_conformidad", "guia_fabricacion", "manual_uso"] as const).map((campo) => {
                                                    const etiqueta =
                                                      campo === "declaracion_conformidad"
                                                        ? "Declaración de Conformidad"
                                                        : campo === "guia_fabricacion"
                                                          ? "Guía de Fabricación"
                                                          : "Manual de Uso"
                                                    const url = servicio[campo as keyof typeof servicio] as string | null
                                                    const uploadKey = `${servicio.id}-${campo}`
                                                    const error = uploadError[uploadKey]
                                                    const success = uploadSuccess[uploadKey]

                                                    return (
                                                      <div key={campo} className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                          <FileText size={14} className="text-gray-500 shrink-0" />
                                                          {url ? (
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">
                                                              {etiqueta}
                                                            </a>
                                                          ) : (
                                                            <span className="text-xs text-gray-500 truncate">{etiqueta} - No subido</span>
                                                          )}
                                                          {success && (
                                                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                                                          )}
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
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
                                                            {servicioDocs[servicio.id]?.[campo]
                                                              ? servicioDocs[servicio.id]?.[campo]?.name.substring(0, 15) + "..."
                                                              : url
                                                                ? "Reemplazar"
                                                                : "Adjuntar"}
                                                          </label>
                                                          {(servicioDocs[servicio.id]?.[campo] || url) && (
                                                            <button
                                                              onClick={() => handleUploadDoc(servicio.id, campo)}
                                                              disabled={uploadingDoc[uploadKey]}
                                                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                                                            >
                                                              {uploadingDoc[uploadKey] ? (
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
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tab: Chat */}
                          {tabActiva === "chat" && (
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
                                            <span>{esAdmin ? "Admin" : client?.nombre}</span>
                                          </div>
                                          <div
                                            className={`max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed ${esAdmin
                                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                                              : "bg-white border border-border text-foreground rounded-tl-sm"
                                              }`}
                                          >
                                            {msg.contenido}
                                          </div>
                                          <span className="text-[10px] text-muted-foreground mt-1">
                                            {formatFechaMensaje(msg.created_at)}
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

      {/* Estado de Cuenta */}
      {mostrarEstadoCuenta[client!.id] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card shadow-sm"
        >
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wallet size={20} />
              Estado de Cuenta
            </h2>
          </div>
          <div className="p-6">
            {cargandoEstadoCuenta[client!.id] ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !itemsEstadoCuenta[client!.id] || itemsEstadoCuenta[client!.id].length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay servicios con precio registrado para este cliente.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total a pagar:</span>
                  <span className="text-lg font-bold text-foreground">
                    ${(totalPagarPorCliente[client!.id] || 0).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Servicio</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Solicitud</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Estado Pago</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Comprobante</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {(itemsEstadoCuenta[client!.id] || []).map((item: any, index: number) => (
                        <tr key={item.solicitudId}>
                          <td className="py-2 pr-3 text-xs text-muted-foreground">{index + 1}</td>
                          <td className="py-2 pr-3 text-xs font-medium text-foreground">{item.servicio}</td>
                          <td className="py-2 pr-3">
                            <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              SOL-{String(item.solicitudId).padStart(3, "0")}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-xs text-muted-foreground">
                            {new Date(item.fecha).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-3">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary capitalize">
                              {item.estado.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${getPagoStyle(item.estado_pago)}`}>
                                {item.estado_pago.replace("_", " ")}
                              </span>
                              {pagoStatusUpdating[item.solicitudId] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : item.estado_pago === "pendiente_validacion" && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleActualizarEstadoPago(item.solicitudId, "aprobado")}
                                    className="text-green-600 hover:text-green-800"
                                    title="Aprobar"
                                  >
                                    <CheckCircle size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleActualizarEstadoPago(item.solicitudId, "rechazado")}
                                    className="text-red-600 hover:text-red-800"
                                    title="Rechazar"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-3">
                            {item.comprobante_pago ? (
                              <a
                                href={item.comprobante_pago}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline flex items-center gap-1"
                              >
                                <CreditCard size={12} />
                                Ver comprobante
                              </a>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  className="hidden"
                                  id={`pago-${item.solicitudId}`}
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) setPagoDocs((prev) => ({ ...prev, [item.solicitudId]: file }))
                                  }}
                                />
                                <label
                                  htmlFor={`pago-${item.solicitudId}`}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                                >
                                  <Upload size={12} />
                                  {pagoDocs[item.solicitudId] ? pagoDocs[item.solicitudId]!.name.substring(0, 10) + "..." : "Subir"}
                                </label>
                                {pagoDocs[item.solicitudId] && (
                                  <button
                                    onClick={() => handleSubirComprobantePago(item.solicitudId, item.solicitudId)}
                                    disabled={uploadingPagoDoc[item.solicitudId]}
                                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                                  >
                                    {uploadingPagoDoc[item.solicitudId] ? (
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
                            )}
                          </td>
                          <td className="py-2 text-right text-xs font-semibold text-foreground">
                            {item.precio ? `$${item.precio.toLocaleString("es-CO")}` : "-"}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
