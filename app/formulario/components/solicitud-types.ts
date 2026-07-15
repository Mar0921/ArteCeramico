export type FechaPartes = { dia: string; mes: string; anio: string }

export type ToothStatus = "normal" | "ausencia" | "implante" | "pilar"

export interface SolicitudFormData {
  fechaElaboracion: FechaPartes
  fechaEntrega: FechaPartes
  historiaClinica: string
  odontologo: string
  ccOdontologo: string
  paciente: string
  tarjetaProfesional: string
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

function generateCodigoTrazabilidad(): string {
  return "TRZ-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6)
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
  ccOdontologo?: string
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
      historiaClinica: "501",
      odontologo: options?.odontologo ?? "",
      ccOdontologo: options?.ccOdontologo ?? "",
      paciente: "",
      tarjetaProfesional: "",
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
    },
  }
}

export function formatFecha(fecha: FechaPartes): string {
  if (!fecha.dia || !fecha.mes || !fecha.anio) return ""
  return `${fecha.dia}/${fecha.mes}/${fecha.anio}`
}
