"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SurveyFormProps {
  solicitudId: number
  surveyResponses: Record<number, {
    email: string
    paciente: string
    evaluaciones: string[]
    opinion: string
    nombreProfesional: string
    fechaEntrega: string
  }>
  setSurveyResponses: React.Dispatch<React.SetStateAction<Record<number, {
    email: string
    paciente: string
    evaluaciones: string[]
    opinion: string
    nombreProfesional: string
    fechaEntrega: string
  }>>>
  submittingSurvey: Record<number, boolean>
  setSubmittingSurvey: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  surveySuccess: Record<number, boolean>
  setSurveySuccess: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}

const EVALUACIONES = [
  "Buena adaptación inicial",
  "Adecuada estética",
  "Ajuste oclusal adecuado",
  "Color adecuado",
]

const OPINIONES = [
  "El dispositivo cumple con los fines terapéuticos previstos",
  "El paciente se encuentra conforme con el tratamiento",
]

export function SurveyForm({
  solicitudId,
  surveyResponses,
  setSurveyResponses,
  submittingSurvey,
  setSubmittingSurvey,
  surveySuccess,
  setSurveySuccess,
}: SurveyFormProps) {
  const [openDate, setOpenDate] = useState(false)
  const response = surveyResponses[solicitudId] ?? {
    email: "",
    paciente: "",
    evaluaciones: [],
    opinion: "",
    nombreProfesional: "",
    fechaEntrega: "",
  }

  const update = (field: string, value: string | string[]) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [solicitudId]: { ...response, [field]: value },
    }))
  }

  const toggleEvaluacion = (val: string) => {
    const current = response.evaluaciones ?? []
    const next = current.includes(val)
      ? current.filter((e) => e !== val)
      : [...current, val]
    update("evaluaciones", next)
  }

  const handleSubmit = async () => {
    if (!response.email || !response.paciente || !response.nombreProfesional || !response.fechaEntrega) return
    setSubmittingSurvey((prev) => ({ ...prev, [solicitudId]: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSurveySuccess((prev) => ({ ...prev, [solicitudId]: true }))
      setSurveyResponses((prev) => ({
        ...prev,
        [solicitudId]: {
          email: "",
          paciente: "",
          evaluaciones: [],
          opinion: "",
          nombreProfesional: "",
          fechaEntrega: "",
        },
      }))
    } catch {
      console.error("Error enviando encuesta")
    } finally {
      setSubmittingSurvey((prev) => ({ ...prev, [solicitudId]: false }))
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white p-4">
      <div>
        <Label className="text-xs font-medium">
          Email del profesional tratante <span className="text-red-500">*</span>
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
        <Label className="text-xs font-medium">
          Nombre del Paciente <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Nombre del paciente"
          value={response.paciente}
          onChange={(e) => update("paciente", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium block mb-2">
          Evaluación clínica posentrega (marcar lo que corresponda):
        </Label>
        <div className="space-y-2">
          {EVALUACIONES.map((evaluacion) => (
            <div key={evaluacion} className="flex items-center gap-2">
              <Checkbox
                checked={(response.evaluaciones ?? []).includes(evaluacion)}
                onCheckedChange={() => toggleEvaluacion(evaluacion)}
              />
              <Label className="text-xs font-normal">{evaluacion}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium block mb-2">
          Opinión general del profesional tratante:
        </Label>
        <div className="space-y-2">
          {OPINIONES.map((op) => (
            <div key={op} className="flex items-center gap-2">
              <Checkbox
                checked={response.opinion === op}
                onCheckedChange={() => update("opinion", op)}
              />
              <Label className="text-xs font-normal">{op}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium">
          Registrar Nombre del profesional <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Nombre del profesional"
          value={response.nombreProfesional}
          onChange={(e) => update("nombreProfesional", e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">
          Registrar Fecha de entrega al paciente <span className="text-red-500">*</span>
        </Label>
        <Popover open={openDate} onOpenChange={setOpenDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "mt-1 w-full justify-start text-left font-normal",
                !response.fechaEntrega && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {response.fechaEntrega ? (
                new Date(response.fechaEntrega).toLocaleDateString("es-CO")
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={response.fechaEntrega ? new Date(response.fechaEntrega) : undefined}
              onSelect={(date) => {
                if (date) {
                  update("fechaEntrega", date.toISOString())
                  setOpenDate(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {surveySuccess[solicitudId] && (
        <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
          <CheckCircle2 size={16} />
          Encuesta enviada correctamente
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={submittingSurvey[solicitudId] || !response.email || !response.paciente || !response.nombreProfesional || !response.fechaEntrega}
        className="w-full"
        size="sm"
      >
        {submittingSurvey[solicitudId] ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Encuesta"
        )}
      </Button>
    </div>
  )
}