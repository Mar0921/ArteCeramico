"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { SolicitudSection } from "./solicitud-section"
import { DrawableToothRef } from "./drawable-tooth"
import { FileDown, Send, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Navbar } from "@/components/navbar"
import {
  SolicitudEntry,
  createDefaultSolicitud,
  formatFecha,
} from "./solicitud-types"

interface PrescriptionFormProps {
  initialData?: {
    odontologo?: string
    ccOdontologo?: string
  }
  servicio?: string
  tipoServicio?: string
  tipoTrabajo?: string[]
  material?: string[]
}

function buildFormDataPayload(
  solicitud: SolicitudEntry,
  email: string,
  userId: string,
  drawingDataUrl: string | null
): FormData {
  const { formData, servicioTipo, selectedTeeth, toothStatuses, uploadedFiles } = solicitud
  const payload = new FormData()

  payload.append("userId", userId)
  payload.append("correoOdontologo", email)
  payload.append("servicio", servicioTipo)

  payload.append("observaciones", formData.indicaciones || "")
  payload.append("indicaciones", formData.indicaciones || "")
  payload.append("odontologo", formData.odontologo || "")
  payload.append("ccOdontologo", formData.ccOdontologo || "")
  payload.append("paciente", formData.paciente || "")
  payload.append("tarjetaProfesional", formData.tarjetaProfesional || "")
  payload.append("ccPaciente", formData.ccPaciente || "")
  payload.append("direccion", formData.direccion || "")
  payload.append("firma", formData.firma || "")
  payload.append("color", formData.color || "")
  payload.append("guia_color", formData.guia || "")
  payload.append("codigoTrazabilidad", formData.codigoTrazabilidad || "")
  payload.append("fechaElaboracion", formatFecha(formData.fechaElaboracion))
  payload.append("fechaEntrega", formatFecha(formData.fechaEntrega))
  payload.append("historiaClinica", formData.historiaClinica || "")
  payload.append("tiposTrabajo", JSON.stringify(formData.tiposTrabajo))
  payload.append("materiales", JSON.stringify(formData.materiales))
  payload.append("productos", JSON.stringify(formData.productos))
  payload.append("piezasEnviadas", JSON.stringify(formData.piezasEnviadas))
  payload.append("chimenea", formData.chimenea ? "true" : "false")
  payload.append("prueba", formData.prueba ? "true" : "false")
  payload.append("terminado", formData.terminado ? "true" : "false")

  payload.append(
    "dientesTrabajados",
    JSON.stringify(
      selectedTeeth.map((t) => {
        const producto = formData.productos.find((p) =>
          String(p.dientes || "")
            .split(/[\s,\-]+/)
            .includes(String(t))
        )
        return {
          diente: t,
          servicio: producto ? producto.producto : servicioTipo,
          estado: toothStatuses[t] || "normal",
        }
      })
    )
  )

  payload.append("estadosDientes", JSON.stringify(toothStatuses))

  if (drawingDataUrl) {
    payload.append("dibujoOdontologo", drawingDataUrl)
  }

  payload.append("archivos_urls", JSON.stringify(uploadedFiles.map((f) => f.url)))
  payload.append("archivos_nombres", JSON.stringify(uploadedFiles.map((f) => f.name)))

  return payload
}

export function PrescriptionForm({
  initialData,
  servicio = "",
  tipoServicio = "",
  tipoTrabajo = [],
  material = [],
}: PrescriptionFormProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const toothDrawRefs = useRef<Map<string, DrawableToothRef | null>>(new Map())
  const initializedRef = useRef(false)

  const [solicitudes, setSolicitudes] = useState<SolicitudEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("arteCeramico_solicitudes")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((s) => ({
              ...s,
              formData: { ...s.formData, productos: s.formData?.productos ?? [] },
            }))
          }
        }
      } catch {
        // ignore
      }
    }

    return [createDefaultSolicitud({
      odontologo: initialData?.odontologo,
      ccOdontologo: initialData?.ccOdontologo,
    })]
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [solicitudEnviada, setSolicitudEnviada] = useState(false)
  const [enviadasCount, setEnviadasCount] = useState(0)

  const updateSolicitud = useCallback((index: number, updates: Partial<SolicitudEntry>) => {
    setSolicitudes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    )
  }, [])

  const updateFormData = useCallback(
    (index: number, updates: Partial<SolicitudEntry["formData"]>) => {
      setSolicitudes((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, formData: { ...s.formData, ...updates } } : s
        )
      )
    },
    []
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("arteCeramico_solicitudes", JSON.stringify(solicitudes))
      } catch {
        // ignore storage errors
      }
    }
  }, [solicitudes])

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("clientes")
          .select("nombre, documento")
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          console.error("Cliente no encontrado:", error)
          return
        }

        setSolicitudes((prev) =>
          prev.map((s) => ({
            ...s,
            formData: {
              ...s.formData,
              odontologo: data.nombre ?? s.formData.odontologo,
              ccOdontologo: data.documento ?? s.formData.ccOdontologo,
            },
          }))
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchClientData()
  }, [])


  useEffect(() => {
    if (initializedRef.current) return
    if (!servicio && !tipoServicio && tipoTrabajo.length === 0 && material.length === 0) return
    initializedRef.current = true

    const serv = tipoServicio || servicio
    setSolicitudes((prev) =>
      prev.map((s, i) =>
        i === 0
          ? {
            ...s,
            servicioTipo: serv && serv !== "Otro" ? serv : tipoServicio || s.servicioTipo,
            formData: {
              ...s.formData,
              tiposTrabajo: [...new Set([...s.formData.tiposTrabajo, ...tipoTrabajo])],
              materiales: [...new Set([...s.formData.materiales, ...material])],
            },
          }
          : s
      )
    )
  }, [servicio, tipoServicio, JSON.stringify(tipoTrabajo), JSON.stringify(material)])

  const addSolicitud = () => {
    const first = solicitudes[0]
    const nueva = createDefaultSolicitud({
      odontologo: first.formData.odontologo,
      ccOdontologo: first.formData.ccOdontologo,
    })
    setSolicitudes((prev) => [...prev, nueva])
    setActiveIndex(solicitudes.length)
  }

  const removeSolicitud = (index: number) => {
    if (solicitudes.length <= 1) return
    const removed = solicitudes[index]
    toothDrawRefs.current.delete(removed.id)
    setSolicitudes((prev) => prev.filter((_, i) => i !== index))
    setActiveIndex((prev) => {
      if (prev >= index && prev > 0) return prev - 1
      if (prev >= solicitudes.length - 1) return Math.max(0, solicitudes.length - 2)
      return prev
    })
  }

  const validateSolicitudes = (): string | null => {
    for (let i = 0; i < solicitudes.length; i++) {
      const s = solicitudes[i]
      if (!s.servicioTipo) {
        return `La solicitud #${i + 1} requiere seleccionar el tipo de servicio.`
      }
      if (!s.formData.fechaEntrega.dia || !s.formData.fechaEntrega.mes || !s.formData.fechaEntrega.anio) {
        return `La solicitud #${i + 1} requiere la fecha de entrega.`
      }
    }
    return null
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const email = user?.email
      const userId = user?.id

      if (!email || !userId) {
        alert("No se encontró la sesión del usuario")
        return
      }


      const validationError = validateSolicitudes()
      if (validationError) {
        alert(validationError)
        return
      }

      const results: { index: number; ok: boolean; error?: string }[] = []

      for (let i = 0; i < solicitudes.length; i++) {
        const solicitud = solicitudes[i]
        const drawRef = toothDrawRefs.current.get(solicitud.id)
        const drawingDataUrl = drawRef?.getDrawingDataUrl() ?? null
        const payload = buildFormDataPayload(solicitud, email, userId, drawingDataUrl)

        try {
          const response = await fetch("/api/solicitudes", {
            method: "POST",
            body: payload,
          })
          const result = await response.json()

          if (!response.ok) {
            const errorMsg = result.message || "Error al enviar la solicitud"
            const errorDetails = result.details ? ` Detalles: ${result.details}` : ""
            results.push({ index: i, ok: false, error: `${errorMsg}${errorDetails}` })
          } else {
            results.push({ index: i, ok: true })
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Error de conexion"
          results.push({ index: i, ok: false, error: message })
        }
      }

      const failed = results.filter((r) => !r.ok)
      const succeeded = results.filter((r) => r.ok)

      if (failed.length > 0 && succeeded.length === 0) {
        const details = failed
          .map((f) => `Solicitud #${f.index + 1}: ${f.error}`)
          .join("\n")
        throw new Error(`No se pudo enviar ninguna solicitud.\n${details}`)
      }

      if (failed.length > 0) {
        alert(
          `Se enviaron ${succeeded.length} de ${solicitudes.length} solicitudes.\n\nErrores:\n${failed
            .map((f) => `Solicitud #${f.index + 1}: ${f.error}`)
            .join("\n")}`
        )
      }

      setEnviadasCount(succeeded.length)
      setSolicitudEnviada(true)

      if (failed.length === 0) {
        localStorage.removeItem("arteCeramico_solicitudes")
      }
    } catch (error: unknown) {
      console.error("Error en handleSubmit:", error)
      const message = error instanceof Error ? error.message : "Error al enviar las solicitudes. Intenta nuevamente."
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!formRef.current) return

    const actionButtons = formRef.current.querySelector(".action-buttons") as HTMLElement
    const tabsBar = formRef.current.querySelector(".solicitudes-tabs") as HTMLElement
    if (actionButtons) actionButtons.style.display = "none"
    if (tabsBar) tabsBar.style.display = "none"

    let hiddenSections: NodeListOf<Element> | null = null
    hiddenSections = formRef.current.querySelectorAll(".solicitud-section-hidden")
    hiddenSections.forEach((el) => {
      ; (el as HTMLElement).style.display = "block"
    })

    try {
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(formRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: formRef.current.scrollWidth,
        height: formRef.current.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      const pdf = new jsPDF("portrait", "mm", "a4")

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio

      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 0

      if (finalHeight > pdfHeight) {
        let position = 0
        let heightLeft = finalHeight

        pdf.addImage(imgData, "JPEG", imgX, position, finalWidth, finalHeight)
        heightLeft -= pdfHeight

        while (heightLeft >= 0) {
          position = heightLeft - finalHeight
          pdf.addPage()
          pdf.addImage(imgData, "JPEG", imgX, position, finalWidth, finalHeight)
          heightLeft -= pdfHeight
        }
      } else {
        pdf.addImage(imgData, "JPEG", imgX, imgY, finalWidth, finalHeight)
      }

      const activeSolicitud = solicitudes[activeIndex]
      pdf.save(`prescripcion-${activeSolicitud?.formData.historiaClinica || "form"}.pdf`)
    } catch {
      window.print()
    } finally {
      hiddenSections?.forEach((el) => {
        ; (el as HTMLElement).style.display = "none"
      })
      if (actionButtons) actionButtons.style.display = "flex"
      if (tabsBar) tabsBar.style.display = "flex"
    }
  }

  return (
    <div ref={formRef} className="max-w-3xl mx-auto bg-white shadow-lg overflow-hidden border border-gray-300">
      <Navbar />

      {/* Tabs de solicitudes */}
      <div className="solicitudes-tabs flex items-center gap-2 p-3 bg-gray-50 border-b flex-wrap">
        {solicitudes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeIndex === i
              ? "bg-primary text-primary-foreground"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
          >
            Solicitud {i + 1}
            {solicitudes.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  removeSolicitud(i)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    removeSolicitud(i)
                  }
                }}
                className="ml-1 rounded p-0.5 hover:bg-black/10"
                aria-label={`Eliminar solicitud ${i + 1}`}
              >
                <Trash2 size={12} />
              </span>
            )}
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSolicitud}
          className="flex items-center gap-1 text-xs h-8"
        >
          <Plus size={14} />
          Agregar solicitud
        </Button>
        {solicitudes.length > 1 && (
          <span className="text-[10px] text-gray-500 ml-auto">
            {solicitudes.length} solicitudes en esta sesion
          </span>
        )}
      </div>

      {/* Secciones de solicitud */}
      {solicitudes.map((solicitud, index) => (
        <div
          key={solicitud.id}
          className={index !== activeIndex ? "solicitud-section-hidden hidden" : ""}
        >
          <SolicitudSection
            solicitud={solicitud}
            index={index}
            idPrefix={`sol-${solicitud.id}`}
            onToothDrawRef={(ref) => {
              if (ref) toothDrawRefs.current.set(solicitud.id, ref)
              else toothDrawRefs.current.delete(solicitud.id)
            }}
            onUpdate={(updates) => updateSolicitud(index, updates)}
            onFormDataChange={(updates) => updateFormData(index, updates)}
          />
        </div>
      ))}

      {/* Footer */}
      <div className="bg-[#7cb342] text-white p-3">
        <div className="flex flex-col items-center gap-1 text-xs">
          <div className="text-center">
            <span>Los precios que se presentan son de valor unitario.</span>
          </div>
          <div className="text-center">
            <span>El valor calculado corresponde a una estimación preliminar y está sujeto a cambios tras la revisión de la solicitud.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons p-4 bg-gray-50 border-t flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent"
        >
          <FileDown size={16} />
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-50 ${isSubmitting ? "cursor-not-allowed" : ""
            }`}
        >
          <Send size={16} />
          {isSubmitting
            ? "Enviando..."
            : solicitudes.length > 1
              ? `Enviar ${solicitudes.length} solicitudes`
              : "Enviar Solicitud"}
        </button>
      </div>

      {solicitudEnviada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {enviadasCount > 1 ? "Solicitudes enviadas" : "Solicitud enviada"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {enviadasCount > 1
                ? `Se registraron ${enviadasCount} solicitudes correctamente. Te contactaremos pronto.`
                : "Te contactaremos pronto."}
            </p>
            <button
              onClick={() => {
                setSolicitudEnviada(false)
                window.location.href = "/page_clientes"
              }}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
