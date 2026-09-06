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
   Download,
} from "lucide-react"
import { DentalChart as DentalChartForm } from "@/app/formulario/components/dental-chart"
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
  convenio_firmado: boolean | null
  convenio_documento_url: string | null
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
  odontologo_registro_medico: string | null
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
  terminos_garantia: string | null
  comprobante_pago: string | null
  estado_pago: string | null
  fase: string | null
   orden_fabricacion_url: string | null
   orden_materiales: string | null
   orden_fases: string | null
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
  manual_uso: string | null
}

interface EstadoCuentaItem {
  id: string
  solicitudId: number
  servicio: string
  precio: number | null
  estado: string
  fecha: string
  estado_pago: string
  comprobante_pago: string | null
  urlPdf: string
}

interface EncuestaPostAdaptacion {
  id: number
  solicitud_id: number
  email: string
  paciente: string
  evaluaciones: string[]
  opinion: string
  nombre_profesional: string
  fecha_entrega: string
  created_at: string
}

interface BuzonQueja {
  id: number
  solicitud_id: number
  email: string
  tipo: string
  descripcion: string
  notificacion: string[]
  nombre_completo: string
  correo_electronico: string
  comentarios_adicionales: string
  created_at: string
}

export default function ClientePerfilPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const solicitudIdParam = searchParams.get("solicitud")
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = useState<Cliente | null>(null)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)

  const FASES_PROCESO = [
    "LIMPIEZA Y DESINFECCION DE ENTRADA",
    "VACEADO Y PREPARACION MODELOS",
    "PLATO BASE Y RODETE",
    "ESCANEO Y DISEÑO",
    "DISEÑO DE MODELO 3D",
    "LIBERADO Y PULIDO DE META externalizadoL",
    "CONTROL DE CALIDAD DE PROCESO 1",
    "IMPRESION RESINA",
    "FRESADO ZR-DSL-PMMA",
    "FRESADO CERA",
    "ENCERADO MANUAL",
    "SINTERIZADO",
    "IMPRESION 3D",
    "DISEÑO DE BARRA",
    "ENFILADO",
    "CONTROL CALIDAD DE PROCESO 2",
    "PULIDO DE METAL Y RESINAS",
    "MICROFRESADO",
    "FRESADO MONTURA",
    "REVESTIR + DESENCERAR + INYECTAR",
    "LIBERADO Y PULIDO LIBRE DE METAL",
    "MAQUILLAJE Y CERAMICA",
    "CONTROL DE CALIDAD LIBERACION",
    "LIMPIEZA Y DESINFECCION DE DISPOSITIVO TERMINADO",
  ]
  const [serviciosDetalle, setServiciosDetalle] = useState<Servicio[]>([])
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [servicioDocs, setServicioDocs] = useState<Record<number, { declaracion_conformidad: File | null; manual_uso: File | null }>>({})
  const [uploadingDoc, setUploadingDoc] = useState<Record<string, boolean>>({})
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState<Record<string, boolean>>({})
  const [editandoEstado, setEditandoEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState("")
  const [editandoServicioId, setEditandoServicioId] = useState<number | null>(null)
  const [editandoServicioData, setEditandoServicioData] = useState<{ nombre: string; precio: string }>({ nombre: "", precio: "" })
  const [guardando, setGuardando] = useState(false)
  const [editandoSolicitudId, setEditandoSolicitudId] = useState<number | null>(null)
  const [editPrecioSolicitud, setEditPrecioSolicitud] = useState("")
  const [editandoPrecioSolicitudId, setEditandoPrecioSolicitudId] = useState<number | null>(null)
  const [editTiposTrabajo, setEditTiposTrabajo] = useState<string[]>([])
  const [editMateriales, setEditMateriales] = useState<string[]>([])
  const [editDientes, setEditDientes] = useState<string[]>([])
  const [expandedSolicitud, setExpandedSolicitud] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<{ [solicitudId: number]: "detalle" | "chat" | "documentos" | "encuestas" | "orden" }>({})
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<{ [solicitudId: number]: number }>({})
  const [mensajesPorSolicitud, setMensajesPorSolicitud] = useState<{ [solicitudId: number]: any[] }>({})
  const [mensajeInput, setMensajeInput] = useState<{ [solicitudId: number]: string }>({})
  const [enviandoMensaje, setEnviandoMensaje] = useState<{ [solicitudId: number]: boolean }>({})
  const [loadingMensajes, setLoadingMensajes] = useState<{ [solicitudId: number]: boolean }>({})
  const chatBottomRefs = useRef<{ [solicitudId: number]: HTMLDivElement | null }>({})
  const [adminId, setAdminId] = useState<number | null>(null)

  const [guardandoServicio, setGuardandoServicio] = useState<number | null>(null)

  const [mostrarEstadoCuenta, setMostrarEstadoCuenta] = useState<{ [clienteId: number]: boolean }>({})
  const [itemsEstadoCuenta, setItemsEstadoCuenta] = useState<{ [clienteId: number]: EstadoCuentaItem[] }>({})
  const [totalPagarPorCliente, setTotalPagarPorCliente] = useState<{ [clienteId: number]: number }>({})
  const [cargandoEstadoCuenta, setCargandoEstadoCuenta] = useState<{ [clienteId: number]: boolean }>({})
  const [pagoDocs, setPagoDocs] = useState<{ [itemId: number]: File | null }>({})
  const [uploadingPagoDoc, setUploadingPagoDoc] = useState<{ [itemId: number]: boolean }>({})
  const [pagoStatusUpdating, setPagoStatusUpdating] = useState<{ [itemId: number]: boolean }>({})
  const [encuestasPostAdaptacion, setEncuestasPostAdaptacion] = useState<Record<number, EncuestaPostAdaptacion[]>>({})
  const [buzonQuejas, setBuzonQuejas] = useState<Record<number, BuzonQueja[]>>({})

  const [solicitudDocs, setSolicitudDocs] = useState<{ terminos_garantia: File | null }>({
    terminos_garantia: null,
  })
  const [uploadingSolicitudDoc, setUploadingSolicitudDoc] = useState<{ terminos_garantia: boolean }>({
    terminos_garantia: false,
  })
  const [uploadSolicitudError, setUploadSolicitudError] = useState<{ terminos_garantia: string }>({
    terminos_garantia: "",
  })
  const [uploadSolicitudSuccess, setUploadSolicitudSuccess] = useState<{ terminos_garantia: boolean }>({
    terminos_garantia: false,
  })
  const [descargandoConvenio, setDescargandoConvenio] = useState(false)
  const [convenioExpanded, setConvenioExpanded] = useState(true)
  const [materialesOrden, setMaterialesOrden] = useState<Record<number, { material: string; producto: string; lote: string; fabricante: string; proveedor: string }[]>>({})
  const [fasesOrden, setFasesOrden] = useState<Record<number, { tipo: string; estado: string; realizada_por: string; fecha_finalizacion: string; fecha_prueba: string }[]>>({})
  const ordenRef = useRef<HTMLDivElement | null>(null)
  const [guardandoOrden, setGuardandoOrden] = useState(false)
  const [descargandoOrden, setDescargandoOrden] = useState(false)
  const [ordenPreviewExpanded, setOrdenPreviewExpanded] = useState(true)

  useEffect(() => {
    if (editandoSolicitudId) {
      const solicitud = solicitudes.find(s => s.id === editandoSolicitudId)
      if (solicitud) {
        setSelectedSolicitud(solicitud)
        setEditTiposTrabajo(solicitud.tipos_trabajo || [])
        setEditMateriales(solicitud.materiales || [])
        const detallados = (solicitud as any).dientes_detallados || []
        if (detallados.length > 0) {
          const textos = detallados.map((d: any) => {
            const num = Number(d.numero)
            const serv = String(d.servicio || "").trim()
            const estado = String(d.estado || "normal").trim()
            if (serv) return `${num}-${serv}-${estado}`
            return `${num}-${estado}`
          })
          setEditDientes(textos)
        } else {
          setEditDientes(solicitud.dientes_trabajados || [])
        }
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
        ;["chimenea", "prueba", "terminado", "color", "guia", "caja", "codigo_trazabilidad", "piezas_enviadas", "historia_clinica", "fecha_elaboracion", "odontologo_registro_medico", "terminos_garantia", "fase"].forEach((campo) => {
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

  const guardarMaterialesOrden = async (solicitudId: number, materiales: any[]) => {
    const { error } = await supabase
      .from("solicitudes")
      .update({ orden_materiales: JSON.stringify(materiales) })
      .eq("id", solicitudId)
    if (error) console.error("Error guardando materiales orden:", error)
  }

  const guardarFasesOrden = async (solicitudId: number, fases: any[]) => {
    const { error } = await supabase
      .from("solicitudes")
      .update({ orden_fases: JSON.stringify(fases) })
      .eq("id", solicitudId)
    if (error) console.error("Error guardando fases orden:", error)
  }

  const handleUploadDocSolicitud = async (solicitudId: number, campo: "terminos_garantia", archivoDirecto?: File) => {
    const archivo = archivoDirecto || solicitudDocs[campo]
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
         const response = await fetch(`/api/solicitudes?cliente_id=${numericId}&limit=100`)
         const result = await response.json()
         const data = result.data || []

         const solicitudesIds = data.map((s: any) => s.id)
         const { data: serviciosData } = await supabase
           .from("servicios")
           .select("solicitud_id, precio")
           .in("solicitud_id", solicitudesIds)

         const preciosPorSolicitud = new Map<number, number>()
         ;(serviciosData || []).forEach((serv: any) => {
           preciosPorSolicitud.set(serv.solicitud_id, (preciosPorSolicitud.get(serv.solicitud_id) || 0) + (Number(serv.precio) || 0))
         })

          const solicitudesConPrecio = (data as any[]).map((s: any) => ({
            ...s,
            servicios_detalle: s.servicios_detalle || [],
            precio: preciosPorSolicitud.get(s.id) || 0,
          }))

          const materialesIniciales: Record<number, any[]> = {}
          const fasesIniciales: Record<number, any[]> = {}
          for (const s of solicitudesConPrecio) {
            try { materialesIniciales[s.id] = s.orden_materiales ? JSON.parse(s.orden_materiales) : [] } catch { materialesIniciales[s.id] = [] }
            try { fasesIniciales[s.id] = s.orden_fases ? JSON.parse(s.orden_fases) : [] } catch { fasesIniciales[s.id] = [] }
          }
          setMaterialesOrden(materialesIniciales)
          setFasesOrden(fasesIniciales)
          setSolicitudes(solicitudesConPrecio as Solicitud[])
         for (const solicitud of solicitudesConPrecio) {
           cargarEncuestasPostAdaptacion(solicitud.id)
           cargarBuzonQuejas(solicitud.id)
         }
       } catch (err) {
         console.error("Error cargando solicitudes del cliente:", err)
       } finally {
         setLoadingSolicitudes(false)
       }
     }

     loadSolicitudes()
   }, [id])

  useEffect(() => {
    const loadAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (data) setAdminId(data.id)
    }

    loadAdmin()
  }, [])

  const handleVerSolicitud = async (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setLoadingDetalle(true)
    try {
      const response = await fetch(`/api/solicitudes/${solicitud.id}`)
      const result = await response.json()
      const servicios = result.data?.solicitud?.servicios_detalle || result.data?.servicios || []
      setServiciosDetalle(servicios as Servicio[])
      if (result.data?.solicitud) {
        setSelectedSolicitud(result.data.solicitud as Solicitud)
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

  const handleDescargarConvenio = async () => {
    if (!client?.convenio_documento_url) return

    setDescargandoConvenio(true)
    try {
      const response = await fetch(client.convenio_documento_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `carta-convenio-${client.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error("Error descargando convenio:", err?.message || err)
    } finally {
      setDescargandoConvenio(false)
    }
   }

  // --- Utilidades para exportar la Orden de Fabricación a imagen ---

  const COLOR_FN_REGEX = /\b(oklch|oklab|lab|color)(\s*\([^)]*\))/gi

  const normalizeColorValue = (value: string): string | null => {
    if (!value) return null
    if (!COLOR_FN_REGEX.test(value)) {
      COLOR_FN_REGEX.lastIndex = 0
      return value
    }
    COLOR_FN_REGEX.lastIndex = 0
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.fillStyle = value
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      return `rgb(${r}, ${g}, ${b})`
    } catch {
      return null
    }
  }

  const collectColorVarOverrides = (): { el: HTMLElement; prop: string; original: string; replacement: string }[] => {
    const overrides: { el: HTMLElement; prop: string; original: string; replacement: string }[] = []
    const targets: HTMLElement[] = []
    const root = document.documentElement
    if (root) targets.push(root)
    const body = document.body
    if (body) targets.push(body)
    for (const el of targets) {
      const style = getComputedStyle(el)
      const vars: string[] = []
      for (let i = 0; i < style.length; i++) {
        vars.push(style[i])
      }
      for (const prop of vars) {
        if (!prop.startsWith("--")) continue
        const val = style.getPropertyValue(prop).trim()
        if (!val || !COLOR_FN_REGEX.test(val)) {
          COLOR_FN_REGEX.lastIndex = 0
          continue
        }
        COLOR_FN_REGEX.lastIndex = 0
        const rgb = normalizeColorValue(val)
        if (rgb) {
          overrides.push({ el, prop, original: val, replacement: rgb })
        }
      }
    }
    return overrides
  }

  const sanitizeInlineColorsDeep = (root: HTMLElement): { el: HTMLElement; style: CSSStyleDeclaration; prop: string; original: string }[] => {
    const restored: { el: HTMLElement; style: CSSStyleDeclaration; prop: string; original: string }[] = []
    const walk = (el: Element) => {
      const style = (el as HTMLElement).style
      if (style) {
        for (const prop of Array.from(style)) {
          const val = style.getPropertyValue(prop).trim()
          if (!val || !COLOR_FN_REGEX.test(val)) {
            COLOR_FN_REGEX.lastIndex = 0
            continue
          }
          COLOR_FN_REGEX.lastIndex = 0
          const rgb = normalizeColorValue(val)
          if (rgb) {
            restored.push({ el: el as HTMLElement, style, prop, original: val })
            style.setProperty(prop, rgb, style.getPropertyPriority(prop))
          }
        }
      }
      for (const child of Array.from(el.children)) {
        walk(child)
      }
    }
    walk(root)
    return restored
  }

  const renderOrdenCanvas = async (ordenDiv: HTMLElement) => {
    const { default: html2canvas } = await import("html2canvas-pro")
    const varOverrides = collectColorVarOverrides()
    const inlineOverrides = sanitizeInlineColorsDeep(ordenDiv)
    for (const { el, prop, replacement } of varOverrides) {
      el.style.setProperty(prop, replacement)
    }
    try {
      return await html2canvas(ordenDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
      } as any)
    } finally {
      for (const { el, prop, original } of varOverrides) {
        if (original === "") {
          el.style.removeProperty(prop)
        } else {
          el.style.setProperty(prop, original)
        }
      }
      for (const { el, style, prop, original } of inlineOverrides) {
        if (original === "") {
          style.removeProperty(prop)
        } else {
          style.setProperty(prop, original, style.getPropertyPriority(prop))
        }
      }
    }
  }

  const handleGuardarOrden = async (solicitudId: number) => {
     const ordenDiv = ordenRef.current
     if (!ordenDiv) return

    setGuardandoOrden(true)
    try {
      const canvas = await renderOrdenCanvas(ordenDiv)
      const dataUrl = canvas.toDataURL("image/png")

       const response = await fetch(dataUrl)
       const blob = await response.blob()
       const fileName = `ordenes/${solicitudId}/${Date.now()}.png`
       const { error: uploadError } = await supabase.storage
         .from("documentos")
         .upload(fileName, blob, {
           upsert: true,
           contentType: "image/png",
         })

       if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

       const { data: publicData } = supabase.storage.from("documentos").getPublicUrl(fileName)

       const { error: updateError } = await supabase
         .from("solicitudes")
         .update({ orden_fabricacion_url: publicData.publicUrl })
         .eq("id", solicitudId)

       if (updateError) throw updateError

       setSolicitudes((prev) =>
         prev.map((s) => (s.id === solicitudId ? { ...s, orden_fabricacion_url: publicData.publicUrl } : s))
       )

       toast({ title: "Orden guardada", description: "La orden de fabricación se ha guardado correctamente." })
     } catch (err: any) {
       console.error("Error guardando orden:", err?.message || err)
       toast({ title: "Error", description: err?.message || "No se pudo guardar la orden.", variant: "destructive" })
     } finally {
       setGuardandoOrden(false)
     }
   }

   const handleDescargarOrden = async (solicitudId: number) => {
     const solicitud = solicitudes.find((s) => s.id === solicitudId)
     if (solicitud?.orden_fabricacion_url) {
       setDescargandoOrden(true)
       try {
         const response = await fetch(solicitud.orden_fabricacion_url)
         const blob = await response.blob()
         const url = URL.createObjectURL(blob)
         const link = document.createElement("a")
         link.href = url
         link.download = `orden-fabricacion-${solicitudId}.png`
         document.body.appendChild(link)
         link.click()
         document.body.removeChild(link)
         URL.revokeObjectURL(url)
       } catch (err: any) {
         console.error("Error descargando orden:", err?.message || err)
       } finally {
         setDescargandoOrden(false)
       }
       return
     }

      const ordenDiv = ordenRef.current
      if (!ordenDiv) return

      setDescargandoOrden(true)
      try {
        const canvas = await renderOrdenCanvas(ordenDiv)
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `orden-fabricacion-${solicitudId}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
      } catch (err: any) {
        console.error("Error descargando orden:", err?.message || err)
      } finally {
        setDescargandoOrden(false)
      }
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

      const servicio = serviciosDetalle.find((s) => s.id === servicioId)
      const solicitudId = (servicio as any)?.solicitud_id

      setServiciosDetalle((prev) =>
        prev.map((s) => (s.id === servicioId ? { ...s, nombre: editandoServicioData.nombre, precio: precioNum } : s))
      )

      if (solicitudId && (servicio as any)?.es_principal) {
        setSolicitudes((prev) =>
          prev.map((s) => (s.id === solicitudId ? { ...s, precio: precioNum } : s))
        )
        setSelectedSolicitud((prev) =>
          prev && prev.id === solicitudId ? { ...prev, precio: precioNum } : prev
        )
      }

      if (client && mostrarEstadoCuenta[client.id]) {
        await cargarEstadoCuenta(client.id)
      }

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

  const handleGuardarPrecioSolicitud = async (solicitudId: number) => {
    if (!client) return
    const precioNum = editPrecioSolicitud ? Number(editPrecioSolicitud) : null
    setGuardando(true)
    try {
      const principal = serviciosDetalle.find((s: any) => s.es_principal)

      if (principal) {
        const { error } = await supabase
          .from("servicios")
          .update({ precio: precioNum })
          .eq("id", principal.id)

        if (error) throw error

        setServiciosDetalle((prev) =>
          prev.map((s: any) => (s.id === principal.id ? { ...s, precio: precioNum } : s))
        )
      } else if (precioNum !== null) {
        const solicitud = solicitudes.find((s) => s.id === solicitudId)
        const nombre = (solicitud as any)?.servicio || `Solicitud #${solicitudId}`

        const { data, error } = await supabase
          .from("servicios")
          .insert({
            solicitud_id: solicitudId,
            nombre,
            precio: precioNum,
            es_principal: true,
            cantidad: 1,
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setServiciosDetalle((prev) => [...prev, data])
        }
      }

      setSolicitudes((prev) =>
        prev.map((s) => (s.id === solicitudId ? { ...s, precio: precioNum } : s))
      )

      if (mostrarEstadoCuenta[client.id]) {
        await cargarEstadoCuenta(client.id)
      }

      toast({
        title: "Precio actualizado",
        description: "El precio de la solicitud se actualizó correctamente.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el precio.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
      setEditandoPrecioSolicitudId(null)
    }
  }

  const handleDocChange = (servicioId: number, campo: "declaracion_conformidad" | "manual_uso", archivo: File) => {
    setServicioDocs((prev) => ({
      ...prev,
      [servicioId]: {
        ...(prev[servicioId] || { declaracion_conformidad: null, manual_uso: null }),
        [campo]: archivo,
      },
    }))
  }

  const handleUploadDoc = async (servicioId: number, campo: "declaracion_conformidad" | "manual_uso") => {
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

  const handleSwitchTab = (solicitudId: number, tab: "detalle" | "chat" | "documentos" | "encuestas" | "orden") => {
    setActiveTab((prev) => ({ ...prev, [solicitudId]: tab }))
  }

  const cargarMensajes = async (solicitudId: number) => {
    setLoadingMensajes((prev) => ({ ...prev, [solicitudId]: true }))

    try {

      // buscar conversación por solicitud
      const { data: conversacion, error: convError } = await supabase
        .from("conversaciones")
        .select("id")
        .eq("solicitud_id", solicitudId)
        .single()


      let conversacionId = conversacion?.id


      // si no existe la crea
      if (!conversacionId && client) {

        const { data: nueva, error } = await supabase
          .from("conversaciones")
          .insert({
            solicitud_id: solicitudId,
            cliente_id: client.id,
            admin_id: adminId,
            estado: "activa"
          })
          .select()
          .single()


        if (error) {
          console.error(error)
          return
        }


        conversacionId = nueva.id
      }



      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: true })


      if (error) throw error


      setMensajesPorSolicitud(prev => ({
        ...prev,
        [solicitudId]: data || []
      }))


    } catch (err) {
      console.error("chat error", err)
    }
    finally {
      setLoadingMensajes(prev => ({
        ...prev,
        [solicitudId]: false
      }))
    }
  }

  const handleEnviarMensaje = async (solicitudId: number) => {

    const mensaje = mensajeInput[solicitudId]?.trim()

    if (!mensaje) return


    setEnviandoMensaje(prev => ({
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
          remitente: "admin",
          leido: false
        }

        console.log("Insertando mensaje:", insertPayload)

        const { data, error } = await supabase
          .from("mensajes")
          .insert(insertPayload)
          .select()

        console.log("Respuesta Supabase:", { data, error })

        if (error) {
          console.error("Error inserting mensaje:", error)
          throw error
        }



      setMensajesPorSolicitud(prev => ({

        ...prev,

        [solicitudId]: [
          ...(prev[solicitudId] || []),

          {
            id: Date.now(),
            contenido: mensaje,
            remitente: "admin",
            created_at: new Date().toISOString()
          }
        ]

      }))



      setMensajeInput(prev => ({
        ...prev,
        [solicitudId]: ""
      }))



    } catch (e) {
      console.error(e)
    }

    finally {

      setEnviandoMensaje(prev => ({
        ...prev,
        [solicitudId]: false
      }))

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
      const response = await fetch(`/api/solicitudes?cliente_id=${clienteId}&limit=100`)
      const result = await response.json()
      const solicitudes = result.data || []

      const solicitudesIds = solicitudes.map((s: any) => s.id)
      const { data: serviciosData } = await supabase
        .from("servicios")
        .select("id, solicitud_id, precio, nombre, created_at")
        .in("solicitud_id", solicitudesIds)

      const serviciosPorSolicitud = new Map<number, any[]>()
      ;(serviciosData || []).forEach((serv: any) => {
        const arr = serviciosPorSolicitud.get(serv.solicitud_id) || []
        arr.push(serv)
        serviciosPorSolicitud.set(serv.solicitud_id, arr)
      })

      const items = solicitudes.flatMap((solicitud: any) => {
        const servicios = serviciosPorSolicitud.get(solicitud.id) || []
        const urlPdf = solicitud.urls_documentos?.[0] || null
        if (servicios.length > 0) {
          return servicios.map((serv: any) => ({
            id: `${solicitud.id}-${serv.id}`,
            solicitudId: solicitud.id,
            servicio: serv.nombre || solicitud.servicio,
            precio: serv.precio || 0,
            estado: solicitud.estado || "pendiente",
            fecha: serv.created_at || solicitud.created_at,
            estado_pago: solicitud.estado_pago || "pendiente_pago",
            comprobante_pago: solicitud.comprobante_pago || null,
            urlPdf,
          }))
        }
        return [{
          id: `${solicitud.id}`,
          solicitudId: solicitud.id,
          servicio: solicitud.servicio || "Servicio",
          precio: solicitud.precio || 0,
          estado: solicitud.estado || "pendiente",
          fecha: solicitud.created_at,
          estado_pago: solicitud.estado_pago || "pendiente_pago",
          comprobante_pago: solicitud.comprobante_pago || null,
          urlPdf,
        }]
      })

      setItemsEstadoCuenta((prev) => ({ ...prev, [clienteId]: items }))
      setTotalPagarPorCliente((prev) => ({
        ...prev,
        [clienteId]: items.reduce((sum: number, item: EstadoCuentaItem) => sum + (item.precio || 0), 0),
      }))
    } catch (err) {
      console.error("Error cargando estado de cuenta:", err)
    } finally {
      setCargandoEstadoCuenta((prev) => ({ ...prev, [clienteId]: false }))
    }
  }

  const cargarEncuestasPostAdaptacion = async (solicitudId: number) => {
    try {
      const response = await fetch(`/api/encuestas?solicitud_id=${solicitudId}`)
      if (response.ok) {
        const result = await response.json()
        const data = result.data || []
        setEncuestasPostAdaptacion((prev) => ({
          ...prev,
          [solicitudId]: data,
        }))
      }
    } catch (err) {
      console.error("Error cargando encuestas post-adaptación:", err)
    }
  }

  const cargarBuzonQuejas = async (solicitudId: number) => {
    try {
      const response = await fetch(`/api/quejas?solicitud_id=${solicitudId}`)
      if (response.ok) {
        const result = await response.json()
        const data = result.data || []
        setBuzonQuejas((prev) => ({
          ...prev,
          [solicitudId]: data,
        }))
      }
    } catch (err) {
      console.error("Error cargando buzón de quejas:", err)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-12">
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

      {/* Carta Convenio Firmada */}
      {client.convenio_firmado && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <FileText className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Carta Convenio Firmada</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConvenioExpanded(!convenioExpanded)}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {convenioExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {convenioExpanded ? "Ocultar" : "Ver"}
              </button>
              {client.convenio_documento_url && (
                <>
                  <a
                    href={client.convenio_documento_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Eye size={16} />
                    Ver documento
                  </a>
                  <button
                    onClick={handleDescargarConvenio}
                    disabled={descargandoConvenio}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {descargandoConvenio ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Descargar
                  </button>
                </>
              )}
            </div>
          </div>
          {convenioExpanded && (
            <>
              {client.convenio_documento_url ? (
                <img
                  src={client.convenio_documento_url}
                  alt="Documento de Carta Convenio Firmada"
                  className="max-w-full rounded-md border border-gray-300 object-contain shadow-sm"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-green-500" />
                  Convenio marcado como firmado
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

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
                             {solicitud.codigo_trazabilidad
                               ? `${solicitud.codigo_trazabilidad} + `
                               : ""}
                             {(solicitud as any).servicios_detalle?.length > 0
                               ? (solicitud as any).servicios_detalle.map((s: any) => s.nombre).join(", ")
                               : solicitud.servicio}
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
                          {/* Tabs detalle / chat / documentos */}
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
                             <button
                               onClick={() => handleSwitchTab(solicitud.id, "documentos")}
                               className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tabActiva === "documentos"
                                 ? "border-primary text-primary"
                                 : "border-transparent text-muted-foreground hover:text-foreground"
                                 }`}
                             >
                               <Paperclip size={14} />
                               Documentos
                             </button>
                              <button
                                onClick={() => handleSwitchTab(solicitud.id, "encuestas")}
                                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tabActiva === "encuestas"
                                  ? "border-primary text-primary"
                                  : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <FileText size={14} />
                                Encuestas y Buzón
                              </button>
                              <button
                                onClick={() => handleSwitchTab(solicitud.id, "orden")}
                                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tabActiva === "orden"
                                  ? "border-primary text-primary"
                                  : "border-transparent text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <FileText size={14} />
                                Orden de Fabricación
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
                                    <div className="flex items-center gap-1 flex-1">
                                      <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">REGISTRO MÉDICO:</span>
                                      <span className="text-sm text-gray-800">
                                        {solicitud.odontologo_registro_medico || "-"}
                                      </span>
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
                                {solicitud.odontologo_firma && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">FIRMA:</span>
                                    {String(solicitud.odontologo_firma).startsWith("data:image") ? (
                                      <img
                                        src={solicitud.odontologo_firma}
                                        alt="Firma"
                                        className="h-12 w-auto rounded border border-gray-300 bg-white"
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-800">{solicitud.odontologo_firma || "-"}</span>
                                    )}
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
                                    {(solicitud as any).dientes_detallados?.length > 0
                                      ? (solicitud as any).dientes_detallados.map((d: any, i: number) => (
                                          <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                                            #{d.numero}{d.servicio ? ` - ${d.servicio}` : ""} - {d.estado}
                                          </span>
                                        ))
                                      : solicitud.dientes_trabajados.map((diente: string, i: number) => (
                                          <span key={i} className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                                            #{diente}
                                          </span>
                                        ))
                                  }
                                  </div>
                                </div>
                              )}

                              {/* Servicios / Trabajos */}
                              {(solicitud as any).servicios_detalle?.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Trabajos / Servicios</p>
                                  <div className="space-y-1">
                                    {(solicitud as any).servicios_detalle.map((serv: any, i: number) => (
                                      <div key={serv.id || i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-gray-800">{i + 1}. {serv.nombre}</p>
                                          {serv.descripcion && <p className="text-[10px] text-gray-600">{serv.descripcion}</p>}
                                        </div>
                                        <div className="text-right ml-2">
                                          <p className="text-xs font-bold text-primary">${serv.precio ? Number(serv.precio).toLocaleString("es-CO") : "0"}</p>
                                          {serv.cantidad > 1 && <p className="text-[10px] text-gray-500">Cant: {serv.cantidad}</p>}
                                        </div>
                                      </div>
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
                                <div className="flex-1">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                                  {editandoSolicitudId === solicitud.id ? (
                                    <select
                                      value={selectedSolicitud?.estado || solicitud.estado}
                                      onChange={(e) => setSelectedSolicitud(prev => prev ? { ...prev, estado: e.target.value } : null)}
                                      className="text-xs rounded-lg border border-border bg-background px-2 py-1.5 w-full"
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
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Precio Total</p>
                                  <p className="text-sm font-bold text-primary">
                                    ${(() => {
                                      const servicios = (solicitud as any).servicios_detalle || []
                                      const precioServicios = servicios.reduce((acc: number, serv: any) => acc + (Number(serv.precio) || 0), 0)
                                      const precio = precioServicios > 0 ? precioServicios : ((solicitud as any).precio ? Number((solicitud as any).precio) : 0)
                                      return precio.toLocaleString("es-CO")
                                    })()}
                                  </p>
                                </div>
                                {editandoPrecioSolicitudId !== solicitud.id ? (
                                  <button
                                    onClick={() => {
                                      setEditandoPrecioSolicitudId(solicitud.id)
                                      const servicios = (solicitud as any).servicios_detalle || []
                                      const precioServicios = servicios.reduce((acc: number, serv: any) => acc + (Number(serv.precio) || 0), 0)
                                      const precioActual = precioServicios > 0 ? String(precioServicios) : ((solicitud as any).precio ? String((solicitud as any).precio) : "")
                                      setEditPrecioSolicitud(precioActual)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted"
                                  >
                                    <Edit3 size={12} />
                                    Editar precio
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={editPrecioSolicitud}
                                      onChange={(e) => setEditPrecioSolicitud(e.target.value)}
                                      className="w-32 text-xs rounded-lg border border-border bg-white px-2 py-1.5"
                                    />
                                    <button
                                      onClick={() => handleGuardarPrecioSolicitud(solicitud.id)}
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
                                      onClick={() => setEditandoPrecioSolicitudId(null)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Botón editar solicitud */}
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
                                       placeholder="32-Híbrida metal-acrílico (Duratone)-pilar&#10;11-Encerado guía-normal"
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
                                                   {(["declaracion_conformidad", "manual_uso"] as const).map((campo) => {
                                                      const etiqueta =
                                                        campo === "declaracion_conformidad"
                                                          ? "Declaración de Conformidad"
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

                          {/* Tab: Documentos */}
                          {tabActiva === "documentos" && (
                            <div className="bg-gray-50 p-4">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Documentos de la Solicitud</p>
              <div className="space-y-2">
                 <div className="flex items-center justify-between gap-2">
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                     <FileText size={14} className="text-gray-500 shrink-0" />
                     {solicitud.terminos_garantia ? (
                       <a href={solicitud.terminos_garantia} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">
                         Términos de Garantía
                       </a>
                     ) : (
                       <span className="text-xs text-gray-500 truncate">Términos de Garantía - No subido</span>
                     )}
                     {uploadSolicitudSuccess.terminos_garantia && (
                       <CheckCircle size={12} className="text-green-500 shrink-0" />
                     )}
                   </div>
                   <div className="flex items-center gap-2 shrink-0">
                     <input
                       type="file"
                       className="hidden"
                       id={`solicitud-${solicitud.id}-terminos_garantia`}
                       accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                       onChange={(e) => {
                         const file = e.target.files?.[0]
                         if (file) handleUploadDocSolicitud(solicitud.id, "terminos_garantia", file)
                       }}
                     />
                     <label htmlFor={`solicitud-${solicitud.id}-terminos_garantia`} className="cursor-pointer">
                       <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted">
                         {uploadingSolicitudDoc.terminos_garantia ? "Subiendo..." : "Subir"}
                       </span>
                     </label>
                     {solicitud.terminos_garantia && (
                       <button
                         onClick={() => handleUploadDocSolicitud(solicitud.id, "terminos_garantia")}
                         disabled={uploadingSolicitudDoc.terminos_garantia}
                         className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
                       >
                         Actualizar
                       </button>
                     )}
                   </div>
                 </div>

                 <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText size={14} className="text-gray-500 shrink-0" />
                                      <span className="text-xs text-foreground">Ficha Técnica</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() => router.push(`/dashboard/clientes/${client.id}/fichas-tecnicas`)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted"
                                      >
                                        <Upload size={12} />
                                        Subir
                                      </button>
                                    </div>
                                  </div>

                                  {/* Documentos adjuntos del cliente */}
                                 {solicitud.urls_documentos && solicitud.urls_documentos.length > 0 && (
                                   <div className="mt-4 pt-3 border-t border-border">
                                     <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Archivos Adjuntos</p>
                                     <div className="flex flex-wrap gap-2">
                                       {solicitud.urls_documentos.map((url, idx) => (
                                         <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
                                           Adjunto {idx + 1}
                                         </a>
                                       ))}
                                     </div>
                                   </div>
                                 )}

                                 {/* Firma del Odontólogo */}
                                 {(solicitud as any).firma && (
                                   <div className="mt-4 pt-3 border-t border-border">
                                     <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Firma del Odontólogo</p>
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
                               </div>
                             </div>
                            )}
                          
                           {/* Tab: Encuestas */}
                           {tabActiva === "encuestas" && (
                             <div className="bg-gray-50 p-4">
                               <div className="space-y-4">
                                 <div>
                                   <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Encuesta Pos Adaptación</p>
                                   {encuestasPostAdaptacion[solicitud.id]?.length > 0 ? (
                                     encuestasPostAdaptacion[solicitud.id].map((encuesta) => (
                                       <div key={encuesta.id} className="text-xs bg-white p-3 rounded border border-gray-200 mb-2">
                                         <p><strong>Profesional:</strong> {encuesta.nombre_profesional}</p>
                                         <p><strong>Paciente:</strong> {encuesta.paciente}</p>
                                         <p><strong>Fecha entrega:</strong> {encuesta.fecha_entrega}</p>
                                         <p><strong>Opinión:</strong> {encuesta.opinion}</p>
                                         <p><strong>Evaluaciones:</strong> {(encuesta.evaluaciones || []).join(", ")}</p>
                                       </div>
                                     ))
                                   ) : (
                                     <span className="text-xs text-gray-500">No hay encuestas registradas</span>
                                   )}
                                 </div>
                                 <div>
                                   <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Buzón de Quejas</p>
                                   {buzonQuejas[solicitud.id]?.length > 0 ? (
                                     buzonQuejas[solicitud.id].map((queja) => (
                                       <div key={queja.id} className="text-xs bg-white p-3 rounded border border-gray-200 mb-2">
                                         <p><strong>Tipo:</strong> {queja.tipo}</p>
                                         <p><strong>Nombre:</strong> {queja.nombre_completo}</p>
                                         <p><strong>Correo:</strong> {queja.correo_electronico}</p>
                                         <p><strong>Descripción:</strong> {queja.descripcion}</p>
                                         {queja.comentarios_adicionales && <p><strong>Comentarios:</strong> {queja.comentarios_adicionales}</p>}
                                         <p><strong>Notificación:</strong> {(queja.notificacion || []).join(", ")}</p>
                                       </div>
                                     ))
                                   ) : (
                                    <span className="text-xs text-gray-500">No hay registros en el buzón</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Tab: Orden de Fabricación */}
                            {tabActiva === "orden" && (
                              <div className="bg-gray-50 p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-foreground">Orden de Fabricación</h3>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleGuardarOrden(solicitud.id)}
                                      disabled={guardandoOrden}
                                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow transition-all hover:bg-muted disabled:opacity-50"
                                    >
                                      {guardandoOrden ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Save size={16} />
                                      )}
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => handleDescargarOrden(solicitud.id)}
                                      disabled={descargandoOrden}
                                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow transition-all hover:bg-muted disabled:opacity-50"
                                    >
                                      {descargandoOrden ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Download size={16} />
                                      )}
                                      Descargar
                                    </button>
                                  </div>
                                </div>
                                {solicitud.orden_fabricacion_url && (
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-semibold text-gray-600">Orden de Fabricación generada</p>
                                      <button
                                        onClick={() => setOrdenPreviewExpanded(!ordenPreviewExpanded)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                                      >
                                        {ordenPreviewExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        {ordenPreviewExpanded ? "Ocultar" : "Ver"}
                                      </button>
                                    </div>
                                    {ordenPreviewExpanded && (
                                      <img
                                        src={solicitud.orden_fabricacion_url}
                                        alt="Orden de Fabricación"
                                        className="max-w-full rounded-md border border-gray-300 object-contain shadow-sm"
                                      />
                                    )}
                                  </div>
                                )}
                                <div ref={ordenRef} className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white relative min-h-[400px]">
                                  {/* Header del documento */}
                                  <div className="absolute top-4 right-4 text-[10px] text-gray-500">
                                    <div>Fecha de elaboración: {solicitud.fecha_elaboracion || "01-02-2026"}</div>
                                    <div>CODIGO: GF-FO-002</div>
                                    <div>VERSION: 001</div>
                                  </div>

                                  <h3 className="text-center text-xl font-bold text-gray-900 mb-6 mt-6">ORDEN DE FABRICACIÓN</h3>
                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Fabricante</p>
                                    <p className="text-xs text-gray-800">Laboratorio Dental Arte Cerámico</p>
                                    <p className="text-xs text-gray-800">Kra. 42 A # 5 C 36</p>
                                    <p className="text-xs text-gray-800">760042 Tequendama</p>
                                    <p className="text-xs text-gray-800">14676333</p>
                                  </div>

                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Técnico Responsable</p>
                                    <p className="text-xs text-gray-800">Jazmín Valencia</p>
                                  </div>

                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">Código de trazabilidad</p>
                                    <p className="text-xs text-gray-800">{solicitud.codigo_trazabilidad || "Sin código"}</p>
                                  </div>

                                  {/* Detalles del Trabajo */}
                                  <div className="mb-4 border-t border-gray-300 pt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">DETALLES DEL TRABAJO</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Paciente:</span>{" "}
                                        <span className="text-gray-800">{solicitud.paciente || "-"}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Doctor/a:</span>{" "}
                                        <span className="text-gray-800">{solicitud.odontologo || "-"}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Cliente:</span>{" "}
                                        <span className="text-gray-800">{client?.nombre || "-"}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Color:</span>{" "}
                                        <span className="text-gray-800">{solicitud.color || "-"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* PRODUCTOS - Dental chart con dientes marcados */}
                                  <div className="mb-4 border-t border-gray-300 pt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">PRODUCTOS</p>
                                    <p className="text-[10px] text-gray-500 mb-2">Dibujo de dientes trabajados</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                                      <DentalChartForm
                                        readOnly
                                        selectedTeeth={
                                          (solicitud.dientes_detallados || []).length > 0
                                            ? (solicitud.dientes_detallados || []).map((d) => d.numero)
                                            : (solicitud.dientes_trabajados || [])
                                                .map((d: string) => parseInt(d.split("-")[0], 10))
                                                .filter((n) => !isNaN(n))
                                        }
                                        toothStatuses={(solicitud.dientes_detallados || []).reduce(
                                          (acc: Record<number, "normal" | "ausencia" | "implante" | "pilar">, d) => {
                                            acc[d.numero] = d.estado as "normal" | "ausencia" | "implante" | "pilar"
                                            return acc
                                          }, {}
                                        )}
                                        onToothSelect={() => {}}
                                        onToothStatusChange={() => {}}
                                        onToothStatusClear={() => {}}
                                      />
                                    </div>

                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Resumen de Productos</p>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-[10px] border border-gray-300">
                                        <thead className="bg-gray-200">
                                          <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-left">#</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Producto</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Unidades</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Dientes</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Clase de la prótesis</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(solicitud.servicios_detalle || []).length > 0 ? (
                                            (solicitud.servicios_detalle || []).map((serv: any, idx: number) => (
                                              <tr key={idx}>
                                                <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                                                <td className="border border-gray-300 px-2 py-1">{serv.nombre || "-"}</td>
                                                <td className="border border-gray-300 px-2 py-1">{serv.cantidad || 1}</td>
                                                <td className="border border-gray-300 px-2 py-1">{serv.dientes || "-"}</td>
                                                <td className="border border-gray-300 px-2 py-1">{serv.tipo_trabajo || "-"}</td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td className="border border-gray-300 px-2 py-1" colSpan={5}>
                                                Sin productos registrados
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* MATERIALES EMPLEADOS - Tabla rellenable */}
                                  <div className="mb-4 border-t border-gray-300 pt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">MATERIALES EMPLEADOS</p>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-[10px] border border-gray-300">
                                        <thead className="bg-gray-200">
                                          <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Material</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Producto</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Número de lote</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Fabricante</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Proveedor</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center w-12">Acciones</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(materialesOrden[solicitud.id] || []).map((mat, idx) => (
                                            <tr key={idx}>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={mat.material}
                                                   onChange={(e) => {
                                                     const newMat = e.target.value
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((m, i) =>
                                                         i === idx ? { ...m, material: newMat } : m
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={mat.producto}
                                                   onChange={(e) => {
                                                     const newProducto = e.target.value
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((m, i) =>
                                                         i === idx ? { ...m, producto: newProducto } : m
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={mat.lote}
                                                   onChange={(e) => {
                                                     const newLote = e.target.value
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((m, i) =>
                                                         i === idx ? { ...m, lote: newLote } : m
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={mat.fabricante}
                                                   onChange={(e) => {
                                                     const newFab = e.target.value
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((m, i) =>
                                                         i === idx ? { ...m, fabricante: newFab } : m
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={mat.proveedor}
                                                   onChange={(e) => {
                                                     const newProv = e.target.value
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((m, i) =>
                                                         i === idx ? { ...m, proveedor: newProv } : m
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1 text-center">
                                                <button
                                                   onClick={() => {
                                                     setMaterialesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).filter((_, i) => i !== idx)
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarMaterialesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X size={10} />
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      <button
                                         onClick={() => {
                                           setMaterialesOrden((prev) => {
                                             const next = [
                                               ...(prev[solicitud.id] || []),
                                               { material: "", producto: "", lote: "", fabricante: "", proveedor: "" },
                                             ]
                                             const updated = { ...prev, [solicitud.id]: next }
                                             guardarMaterialesOrden(solicitud.id, next)
                                             return updated
                                           })
                                         }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted mt-2"
                                      >
                                        <Plus size={10} />
                                        Agregar material
                                      </button>
                                    </div>
                                  </div>

                                  {/* FASES DE FABRICACIÓN - Tabla rellenable */}
                                  <div className="mb-4 border-t border-gray-300 pt-3">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">FASES DE FABRICACIÓN</p>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-[10px] border border-gray-300">
                                        <thead className="bg-gray-200">
                                          <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Estado</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Realizada por</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Fecha finalización</th>
                                            <th className="border border-gray-300 px-2 py-1 text-left">Fecha prueba</th>
                                            <th className="border border-gray-300 px-2 py-1 text-center w-12">Acciones</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(fasesOrden[solicitud.id] || []).map((fase, idx) => (
                                            <tr key={idx}>
                                              <td className="border border-gray-300 px-1">
                                                <select
                                                  value={fase.tipo}
                                                   onChange={(e) => {
                                                     const newTipo = e.target.value
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((f, i) =>
                                                         i === idx ? { ...f, tipo: newTipo } : f
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                >
                                                  <option value="">Seleccionar fase</option>
                                                  {FASES_PROCESO.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                  ))}
                                                </select>
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <select
                                                  value={fase.estado}
                                                   onChange={(e) => {
                                                     const newEstado = e.target.value
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((f, i) =>
                                                         i === idx ? { ...f, estado: newEstado } : f
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                >
                                                  <option value="pendiente">Pendiente</option>
                                                  <option value="en_proceso">En proceso</option>
                                                  <option value="completado">Completado</option>
                                                </select>
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="text"
                                                  value={fase.realizada_por}
                                                   onChange={(e) => {
                                                     const newVal = e.target.value
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((f, i) =>
                                                         i === idx ? { ...f, realizada_por: newVal } : f
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                  placeholder="Nombre"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="date"
                                                  value={fase.fecha_finalizacion}
                                                   onChange={(e) => {
                                                     const newVal = e.target.value
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((f, i) =>
                                                         i === idx ? { ...f, fecha_finalizacion: newVal } : f
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1">
                                                <input
                                                  type="date"
                                                  value={fase.fecha_prueba}
                                                   onChange={(e) => {
                                                     const newVal = e.target.value
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).map((f, i) =>
                                                         i === idx ? { ...f, fecha_prueba: newVal } : f
                                                       )
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5"
                                                />
                                              </td>
                                              <td className="border border-gray-300 px-1 text-center">
                                                <button
                                                   onClick={() => {
                                                     setFasesOrden((prev) => {
                                                       const next = (prev[solicitud.id] || []).filter((_, i) => i !== idx)
                                                       const updated = { ...prev, [solicitud.id]: next }
                                                       guardarFasesOrden(solicitud.id, next)
                                                       return updated
                                                     })
                                                   }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X size={10} />
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      <button
                                         onClick={() => {
                                           setFasesOrden((prev) => {
                                             const next = [
                                               ...(prev[solicitud.id] || []),
                                               { tipo: "", estado: "pendiente", realizada_por: "", fecha_finalizacion: "", fecha_prueba: "" },
                                             ]
                                             const updated = { ...prev, [solicitud.id]: next }
                                             guardarFasesOrden(solicitud.id, next)
                                             return updated
                                           })
                                         }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted mt-2"
                                      >
                                        <Plus size={10} />
                                        Agregar fase
                                      </button>
                                    </div>
                                  </div>

                                  {/* Footer del documento */}
                                  <div className="border-t border-gray-300 pt-2 mt-4 text-center text-[10px] text-gray-500">
                                    GF-FO-002 version 001 - {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                                  </div>
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
                         <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">PDF</th>
                         <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {(itemsEstadoCuenta[client!.id] || []).map((item: EstadoCuentaItem, index: number) => (
                        <tr key={item.id}>
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
                           <td className="py-2 pr-3">
                             {item.urlPdf ? (
                               <a
                                 href={item.urlPdf}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[10px] text-primary hover:underline flex items-center gap-1"
                               >
                                 <FileText size={12} />
                                 Ver PDF
                               </a>
                             ) : (
                               <span className="text-[10px] text-muted-foreground">-</span>
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
