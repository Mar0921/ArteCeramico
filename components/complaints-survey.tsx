"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ComplaintsSurveyProps {
  solicitudId: number
  defaultEmail: string
  defaultPaciente: string
  surveyResponses: Record<number, {
    email: string
    tipo: string
    descripcion: string
    notificacion: string[]
    nombreCompleto: string
    correoElectronico: string
    comentariosAdicionales: string
  }>
  setSurveyResponses: React.Dispatch<React.SetStateAction<Record<number, {
    email: string
    tipo: string
    descripcion: string
    notificacion: string[]
    nombreCompleto: string
    correoElectronico: string
    comentariosAdicionales: string
  }>>>
  submittingSurvey: Record<number, boolean>
  setSubmittingSurvey: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  surveySuccess: Record<number, boolean>
  setSurveySuccess: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}

const TIPOS = [
  { value: "QUEJA", label: "QUEJA: Manifestación de protesta, descontento o inconformidad que formula una persona en relación a la conducta irregular realizada en la atención o fabricación de DMSMB" },
  { value: "RECLAMO", label: "RECLAMO: Manifestación de insatisfacción hecha por una persona natural o jurídica, a cerca de la prestación indebida de un servicio a la atención inoportuna a una solicitud o fabricación de los DMSMB." },
  { value: "SUGERENCIA", label: "SUGERENCIA: Propuesta que se presenta para mejorar un proceso relacionado con la prestación del servicio o el cumplimiento en la atención de servicio al cliente." },
  { value: "FELICITACIONES", label: "FELICITACIONES: Expresión de agrado y satisfacción frente a la atención brindada por un colaborador del laboratorio o frente al producto, documento o servicio recibido." },
]

const NOTIFICACIONES = [
  "Correo electrónico",
  "Via whatsapp",
  "Presencial",
]

export function ComplaintsSurvey({
  solicitudId,
  defaultEmail,
  defaultPaciente,
  surveyResponses,
  setSurveyResponses,
  submittingSurvey,
  setSubmittingSurvey,
  surveySuccess,
  setSurveySuccess,
}: ComplaintsSurveyProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [openDate, setOpenDate] = useState(false)
  const response = surveyResponses[solicitudId] ?? {
    email: defaultEmail,
    tipo: "",
    descripcion: "",
    notificacion: [],
    nombreCompleto: defaultPaciente,
    correoElectronico: defaultEmail,
    comentariosAdicionales: "",
  }

  const update = (field: string, value: string | string[]) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [solicitudId]: { ...response, [field]: value },
    }))
  }

  const toggleNotificacion = (val: string) => {
    const current = response.notificacion ?? []
    const next = current.includes(val)
      ? current.filter((n) => n !== val)
      : [...current, val]
    update("notificacion", next)
  }

  const handleSubmit = async () => {
    if (!response.tipo || !response.descripcion || !response.nombreCompleto || !response.correoElectronico) return
    setSubmittingSurvey((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSurveySuccess((prev) => ({ ...prev, [solicitudId]: true }))
      setSurveyResponses((prev) => ({
        ...prev,
        [solicitudId]: {
          email: "",
          tipo: "",
          descripcion: "",
          notificacion: [],
          nombreCompleto: "",
          correoElectronico: "",
          comentariosAdicionales: "",
        },
      }))
    } catch {
      console.error("Error enviando buzón")
    } finally {
      setSubmittingSurvey((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  const hasResponse = !!surveyResponses[solicitudId] && (surveyResponses[solicitudId].tipo || surveyResponses[solicitudId].descripcion || surveyResponses[solicitudId].nombreCompleto)
  const isCompleted = !!surveySuccess[solicitudId]

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          📋 BUZÓN DE QUEJAS, RECLAMOS, SUGERENCIAS Y FELICITACIONES
          {!isCompleted && !hasResponse && (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              Pendiente por contestar
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Completado
            </span>
          )}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {collapsed ? "Ver" : "Ocultar"}
        </span>
      </button>
      {!collapsed && (
        <div className="space-y-3 p-4 pt-0">
          <p className="text-xs text-muted-foreground mb-2">
            Con el fin de mejorar la calidad en nuestra atención, este formato le permitirá manifestar sus sugerencias, felicitaciones o cualquier tipo de quejas y/o reclamos que tenga hacia los servicios prestados por el Laboratorio dental.
          </p>
          <p className="text-xs text-muted-foreground mb-3 italic">
            La información suministrada en este formato es estrictamente confidencial y sólo será utilizada con el propósito de implementar acciones de mejora continua y permanente en la fabricación de los DMSMB.
          </p>

          <div>
            <Label className="text-xs font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="mari28cali@gmail.com"
              value={response.email}
              onChange={(e) => update("email", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium block mb-2">
              SEÑALE EL TIPO DE SOLICITUD QUE VA A REALIZAR <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {TIPOS.map((tipo) => (
                <div key={tipo.value} className="flex items-start gap-2">
                  <Checkbox
                    checked={response.tipo === tipo.value}
                    onCheckedChange={() => update("tipo", tipo.value)}
                    className="mt-0.5"
                  />
                  <Label className="text-xs font-normal leading-tight">{tipo.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">
              DESCRIBA SU QUEJA, RECLAMO, SUGERENCIA O FELICITACIONES <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Describa su solicitud..."
              value={response.descripcion}
              onChange={(e) => update("descripcion", e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-xs font-medium block mb-2">
              CÓMO DESEA SER NOTIFICADO <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {NOTIFICACIONES.map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <Checkbox
                    checked={(response.notificacion ?? []).includes(n)}
                    onCheckedChange={() => toggleNotificacion(n)}
                  />
                  <Label className="text-xs font-normal">{n}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">
              NOMBRE Y APELLIDO <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nombre y apellido"
              value={response.nombreCompleto}
              onChange={(e) => update("nombreCompleto", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">
              CORREO ELECTRÓNICO <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={response.correoElectronico}
              onChange={(e) => update("correoElectronico", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">COMENTARIOS ADICIONALES</Label>
            <Textarea
              placeholder="Comentarios adicionales..."
              value={response.comentariosAdicionales}
              onChange={(e) => update("comentariosAdicionales", e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {surveySuccess[solicitudId] && (
            <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
              <CheckCircle2 size={16} />
              Buzón enviado correctamente
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={
              submittingSurvey[solicitudId] ||
              !response.tipo ||
              !response.descripcion ||
              !response.nombreCompleto ||
              !response.correoElectronico
            }
            className="w-full"
            size="sm"
          >
            {submittingSurvey[solicitudId] ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Buzón"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}