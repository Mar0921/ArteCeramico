export type FechaPartes = { dia: string; mes: string; anio: string }

export type ToothStatus = "normal" | "ausencia" | "implante" | "pilar"

export interface ProductoLine {
  producto: string
  unidades: number
  dientes: string
  precio: number
  precioUnitario: number
}

export interface SolicitudFormData {
  fechaElaboracion: FechaPartes
  fechaEntrega: FechaPartes
  odontologo: string
  registroMedico: string
  paciente: string
  ccPaciente: string
  direccion: string
  firma: string
  tiposTrabajo: string[]
  chimenea: boolean | null
  materiales: string[]
  prueba: boolean
  terminado: boolean
  color: string
  guia: string
  indicaciones: string
  piezasEnviadas: string[]
  codigoTrazabilidad: string
  productos: ProductoLine[]
}

export interface UploadedFile {
  name: string
  url: string
  size: number
}

export interface SolicitudEntry {
  id: string
  formData: SolicitudFormData
  servicioTipo: string
  selectedTeeth: number[]
  toothStatuses: Record<number, ToothStatus>
  uploadedFiles: UploadedFile[]
  total: number
}

export function generateCodigoTrazabilidad(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

function getTodayStr(): FechaPartes {
  const today = new Date()
  return {
    dia: String(today.getDate()).padStart(2, "0"),
    mes: String(today.getMonth() + 1).padStart(2, "0"),
    anio: String(today.getFullYear()),
  }
}

export function createDefaultSolicitud(options?: {
  odontologo?: string
  tipoTrabajo?: string[]
  material?: string[]
  servicioTipo?: string
}): SolicitudEntry {
  return {
    id: crypto.randomUUID(),
    servicioTipo: options?.servicioTipo ?? "",
    selectedTeeth: [],
    toothStatuses: {},
    uploadedFiles: [],
    total: 0,
    formData: {
      fechaElaboracion: getTodayStr(),
      fechaEntrega: { dia: "", mes: "", anio: "" },
      odontologo: options?.odontologo ?? "",
      registroMedico: "",
      paciente: "",
      ccPaciente: "",
      direccion: "",
      firma: "",
      tiposTrabajo: options?.tipoTrabajo ? [...options.tipoTrabajo] : [],
      chimenea: null,
      materiales: options?.material ? [...options.material] : [],
      prueba: false,
      terminado: false,
      color: "",
      guia: "",
      indicaciones: "",
      piezasEnviadas: [],
      codigoTrazabilidad: generateCodigoTrazabilidad(),
      productos: [],
    },
  }
}

export function formatFecha(fecha: FechaPartes): string {
  if (!fecha.dia || !fecha.mes || !fecha.anio) return ""
  return `${fecha.dia}/${fecha.mes}/${fecha.anio}`
}
