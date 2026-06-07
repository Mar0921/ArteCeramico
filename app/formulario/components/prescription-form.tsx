"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DentalChart } from "./dental-chart"
import { DrawableTooth, DrawableToothRef } from "./drawable-tooth"
import { MapPin, Mail, Phone, FileDown, Send, Calendar as CalendarIcon, Upload, File, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface PrescriptionFormProps {
   initialData?: {
     odontologo?: string
     ccOdontologo?: string
   }
 }

  export function PrescriptionForm({ initialData }: PrescriptionFormProps) {
    const formRef = useRef<HTMLDivElement>(null)
    const toothDrawRef = useRef<DrawableToothRef>(null)
    const [selectedTeeth, setSelectedTeeth] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCalendarElaboracion, setShowCalendarElaboracion] = useState(false)
    const [showCalendarEntrega, setShowCalendarEntrega] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [servicioTipo, setServicioTipo] = useState("")
    const [solicitudEnviada, setSolicitudEnviada] = useState(false)
    const router = useRouter()

  // Obtener fecha actual
  const today = new Date()
  const todayStr = {
    dia: String(today.getDate()).padStart(2, "0"),
    mes: String(today.getMonth() + 1).padStart(2, "0"),
    anio: String(today.getFullYear())
  }

const [formData, setFormData] = useState({
     fechaElaboracion: todayStr,
     fechaEntrega: { dia: "", mes: "", anio: "" },
     historiaClinica: "501",
     odontologo: initialData?.odontologo ?? "",
     ccOdontologo: initialData?.ccOdontologo ?? "",
     paciente: "",
     tarjetaProfesional: "",
     ccPaciente: "",
     direccion: "",
     firma: "",
     tiposTrabajo: [] as string[],
     chimenea: null as boolean | null,
     materiales: [] as string[],
     prueba: false,
     terminado: false,
     color: "",
     guia: "",
     indicaciones: "",
     piezasEnviadas: [] as string[],
     caja: "",
     codigoTrazabilidad: "",
   })

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const storedEmail = sessionStorage.getItem("clienteEmail")
        if (!storedEmail) return

        const { data, error } = await supabase
          .from("clientes")
          .select("nombre, documento")
          .eq("correo", storedEmail)
          .single()

        if (error) return

        if (data) {
          setFormData((prev) => ({
            ...prev,
            odontologo: data.nombre ?? prev.odontologo,
            ccOdontologo: data.documento ?? prev.ccOdontologo,
          }))
        }
      } catch {
        // Silently fail - form will remain empty
      }
    }

    fetchClientData()
  }, [])

const handleToothToggle = (toothNumber: number) => {
     setSelectedTeeth((prev) =>
       prev.includes(toothNumber)
         ? prev.filter((t) => t !== toothNumber)
         : [...prev, toothNumber]
     )
   }
 
   const updateDientesTrabajados = useCallback(() => {
     setFormData((prev) => ({
       ...prev,
       dientesTrabajados: selectedTeeth.map((t) => t.toString()),
     }))
   }, [selectedTeeth])

  const handleCheckboxChange = (
    field: "tiposTrabajo" | "materiales" | "piezasEnviadas",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const storedEmail = sessionStorage.getItem("clienteEmail")
      if (!storedEmail) {
        alert("No se encontro la sesion del usuario. Inicia sesion nuevamente.")
        return
      }

      if (!servicioTipo) {
        alert("Selecciona el tipo de servicio o trabajo a realizar.")
        setIsSubmitting(false)
        return
      }

      const formatFecha = (fecha: { dia: string; mes: string; anio: string }) => {
          if (!fecha.dia || !fecha.mes || !fecha.anio) return ""
          return `${fecha.dia}/${fecha.mes}/${fecha.anio}`
        }

        const formDataPayload = new FormData()
        formDataPayload.append("correoOdontologo", storedEmail)
        formDataPayload.append("servicio", servicioTipo)
        formDataPayload.append("observaciones", formData.indicaciones || "")
         formDataPayload.append("indicaciones", formData.indicaciones || "")
        formDataPayload.append("odontologo", formData.odontologo || "")
        formDataPayload.append("ccOdontologo", formData.ccOdontologo || "")
        formDataPayload.append("paciente", formData.paciente || "")
        formDataPayload.append("tarjetaProfesional", formData.tarjetaProfesional || "")
        formDataPayload.append("ccPaciente", formData.ccPaciente || "")
        formDataPayload.append("direccion", formData.direccion || "")
        formDataPayload.append("firma", formData.firma || "")
        formDataPayload.append("color", formData.color || "")
      formDataPayload.append("guia_color", formData.guia || "")
         formDataPayload.append("caja", formData.caja || "")
        formDataPayload.append("codigoTrazabilidad", formData.codigoTrazabilidad || "")
        formDataPayload.append("fechaElaboracion", formatFecha(formData.fechaElaboracion))
        formDataPayload.append("fechaEntrega", formatFecha(formData.fechaEntrega))
        formDataPayload.append("historiaClinica", formData.historiaClinica || "")
        formDataPayload.append("tiposTrabajo", JSON.stringify(formData.tiposTrabajo))
        formDataPayload.append("materiales", JSON.stringify(formData.materiales))
        formDataPayload.append("piezasEnviadas", JSON.stringify(formData.piezasEnviadas))
        formDataPayload.append("chimenea", formData.chimenea ? "true" : "false")
        formDataPayload.append("prueba", formData.prueba ? "true" : "false")
        formDataPayload.append("terminado", formData.terminado ? "true" : "false")
        formDataPayload.append("dientesTrabajados", JSON.stringify(selectedTeeth.map((t) => t.toString())))
  
        const drawingDataUrl = toothDrawRef.current?.getDrawingDataUrl()
        if (drawingDataUrl) {
          formDataPayload.append("dibujoOdontologo", drawingDataUrl)
        }

      uploadedFiles.forEach((file) => {
        formDataPayload.append("archivos", file, file.name)
      })

      const response = await fetch("/api/solicitudes", {
        method: "POST",
        body: formDataPayload,
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.message || "Error al enviar la solicitud"
        const errorDetails = result.details ? ` Detalles: ${result.details}` : ""
        throw new Error(`${errorMsg}${errorDetails}`)
      }

      setServicioTipo("")
      setUploadedFiles([])
      setSolicitudEnviada(true)
    } catch (error: any) {
      console.error("Error en handleSubmit:", error)
      alert(error.message || "Error al enviar la solicitud. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
      const maxSize = 10 * 1024 * 1024
      return validTypes.includes(file.type) && file.size <= maxSize
    })
    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDownloadPDF = async () => {
    if (!formRef.current) return

    const actionButtons = formRef.current.querySelector(".action-buttons") as HTMLElement
    if (actionButtons) actionButtons.style.display = "none"

    try {
      // Aseguramos que las imágenes/fuentes estén cargadas
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

      // Calcular ratio para ajustar a una página
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio

      // Centrar imagen
      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 0

      // Si la imagen es muy alta, usar múltiples páginas
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

      pdf.save(`prescripcion-${formData.historiaClinica || "form"}.pdf`)
    } catch {
      // Fallback: intentar imprimir
      window.print()
    } finally {
      if (actionButtons) actionButtons.style.display = "flex"
    }
  }

  return (
    <div ref={formRef} className="max-w-3xl mx-auto bg-white shadow-lg overflow-hidden border border-gray-300">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-start">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[#7cb342] text-[10px]">impr</span>
            <h1 className="text-2xl font-bold tracking-wider text-gray-800">
              ARTE CERÁMICO
            </h1>
          </div>
          <p className="text-sm italic text-gray-600">
            Laboratorio Dental <span className="font-semibold not-italic">S.A.S</span>
          </p>
        </div>
      </div>

      {/* Fechas y Prescripción */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          {/* Fecha de Elaboración */}
          <div className="flex flex-col">
            <Label className="text-[10px] text-gray-600 text-center mb-1">
              FECHA DE<br />ELABORACIÓN
            </Label>
            <div className="flex items-center gap-2">
              <Popover open={showCalendarElaboracion} onOpenChange={setShowCalendarElaboracion}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 rounded bg-[#a5d6a7] px-2 py-1 text-xs hover:bg-[#8bc34a]">
                    <CalendarIcon size={14} />
                    {formData.fechaElaboracion.dia || "D"}/{formData.fechaElaboracion.mes || "M"}/{formData.fechaElaboracion.anio || "A"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fechaElaboracion.dia ? new Date(`${formData.fechaElaboracion.anio}-${formData.fechaElaboracion.mes}-${formData.fechaElaboracion.dia}`) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData((prev) => ({
                          ...prev,
                          fechaElaboracion: {
                            dia: format(date, "dd"),
                            mes: format(date, "MM"),
                            anio: format(date, "yyyy"),
                          },
                        }))
                        setShowCalendarElaboracion(false)
                      }
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Fecha de Entrega */}
          <div className="flex flex-col">
            <Label className="text-[10px] text-gray-600 text-center mb-1">
              FECHA DE<br />ENTREGA
            </Label>
            <div className="flex items-center gap-2">
              <Popover open={showCalendarEntrega} onOpenChange={setShowCalendarEntrega}>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center gap-1 rounded bg-[#a5d6a7] px-2 py-1 text-xs hover:bg-[#8bc34a]"
                    disabled={!formData.fechaElaboracion.dia}
                  >
                    <CalendarIcon size={14} />
                    {formData.fechaEntrega.dia || "D"}/{formData.fechaEntrega.mes || "M"}/{formData.fechaEntrega.anio || "A"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fechaEntrega.dia ? new Date(`${formData.fechaEntrega.anio}-${formData.fechaEntrega.mes}-${formData.fechaEntrega.dia}`) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData((prev) => ({
                          ...prev,
                          fechaEntrega: {
                            dia: format(date, "dd"),
                            mes: format(date, "MM"),
                            anio: format(date, "yyyy"),
                          },
                        }))
                        setShowCalendarEntrega(false)
                      }
                    }}
                    disabled={(date) => {
                      // Bloquear fechas antes de la fecha de elaboración + 8 días
                      if (!formData.fechaElaboracion.dia) return true
                      const elaboracionDate = new Date(`${formData.fechaElaboracion.anio}-${formData.fechaElaboracion.mes}-${formData.fechaElaboracion.dia}`)
                      const minDate = new Date(elaboracionDate)
                      minDate.setDate(minDate.getDate() + 1) // Día siguiente
                      const maxDate = new Date(elaboracionDate)
                      maxDate.setDate(maxDate.getDate() + 8) // 8 días después
                      return date < minDate || date > maxDate
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Prescripción / Historia Clínica */}
          <div className="text-right">
            <span className="text-2xl font-serif text-[#c62828] italic">Prescripción</span>
            <div className="text-[10px] text-gray-600 mt-0.5">HISTORIA CLÍNICA</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-xs">Nº</span>
              <Input
                className="w-16 h-6 text-center border-2 border-[#c62828] text-xs"
                value={formData.historiaClinica}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, historiaClinica: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Datos del Odontólogo y Paciente */}
      <div className="p-3 border-b space-y-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">ODONTÓLOGO(A):</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.odontologo}
              onChange={(e) => setFormData((prev) => ({ ...prev, odontologo: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">CC.:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.ccOdontologo}
              onChange={(e) => setFormData((prev) => ({ ...prev, ccOdontologo: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">PACIENTE:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.paciente}
              onChange={(e) => setFormData((prev) => ({ ...prev, paciente: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">No. TARJETA PROFESIONAL:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.tarjetaProfesional}
              onChange={(e) => setFormData((prev) => ({ ...prev, tarjetaProfesional: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-1 w-32">
            <Label className="text-xs whitespace-nowrap">CC.:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.ccPaciente}
              onChange={(e) => setFormData((prev) => ({ ...prev, ccPaciente: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-xs whitespace-nowrap">DIRECCIÓN:</Label>
          <Input
            className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
            value={formData.direccion}
            onChange={(e) => setFormData((prev) => ({ ...prev, direccion: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-xs whitespace-nowrap">FIRMA DE ODONTÓLOGO (A):</Label>
          <Input
            className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
            value={formData.firma}
            onChange={(e) => setFormData((prev) => ({ ...prev, firma: e.target.value }))}
          />
        </div>
      </div>

      {/* Servicio principal para la solicitud */}
      <div className="p-3 border-b space-y-2 text-xs">
        <Label className="text-xs font-semibold text-gray-700">TIPO DE SERVICIO PRINCIPAL</Label>
        <select
          value={servicioTipo}
          onChange={(event) => setServicioTipo(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs"
        >
          <option value="">Selecciona el servicio...</option>
          <option value="Corona de Zirconio">Corona de Zirconio</option>
          <option value="Corona de Disilicato de Litio">Corona de Disilicato de Litio</option>
          <option value="Corona Metal Porcelana">Corona Metal Porcelana</option>
          <option value="Carilla de Disilicato">Carilla de Disilicato</option>
          <option value="Carilla de Resina">Carilla de Resina</option>
          <option value="Incrustación">Incrustación</option>
          <option value="Híbrida PMMA">Híbrida PMMA</option>
          <option value="Prótesis Fija">Prótesis Fija</option>
          <option value="Corona sobre Implante">Corona sobre Implante</option>
          <option value="Modelo de Yeso">Modelo de Yeso</option>
          <option value="Otro">Otro</option>
        </select>

        {servicioTipo === "Otro" && (
          <Input
            placeholder="Especifica el servicio"
            value={formData.tiposTrabajo.find((item) => item.startsWith("OTRO:"))?.replace("OTRO:", "") || ""}
            onChange={(e) => {
              const custom = `OTRO: ${e.target.value || "Sin especificar"}`
              setFormData((prev) => ({
                ...prev,
                tiposTrabajo: prev.tiposTrabajo.filter((item) => !item.startsWith("OTRO:")),
              }))
              if (e.target.value.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  tiposTrabajo: [...prev.tiposTrabajo, custom],
                }))
              }
            }}
            className="mt-2"
          />
        )}
      </div>

      {/* Tipo de Trabajo y Material */}
      <div className="border-b">
        <div className="grid grid-cols-3">
          {/* Tipo de Trabajo */}
          <div className="col-span-2 border-r">
            <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
              TIPO DE TRABAJO
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="corona"
                    checked={formData.tiposTrabajo.includes("CORONA")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "CORONA")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="corona" className="text-[11px] cursor-pointer">CORONA</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="maryland"
                    checked={formData.tiposTrabajo.includes("MARYLAND")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "MARYLAND")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="maryland" className="text-[11px] cursor-pointer">MARYLAND</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="hibrida"
                    checked={formData.tiposTrabajo.includes("HÍBRIDA")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "HÍBRIDA")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="hibrida" className="text-[11px] cursor-pointer">HÍBRIDA</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="subestructura"
                    checked={formData.tiposTrabajo.includes("SUB ESTRUCTURA")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "SUB ESTRUCTURA")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="subestructura" className="text-[11px] cursor-pointer">SUB ESTRUCTURA</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="incrustacion"
                    checked={formData.tiposTrabajo.includes("INCRUSTACIÓN")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "INCRUSTACIÓN")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="incrustacion" className="text-[11px] cursor-pointer">INCRUSTACIÓN</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="encerado"
                    checked={formData.tiposTrabajo.includes("ENCERADO DX")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "ENCERADO DX")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="encerado" className="text-[11px] cursor-pointer">ENCERADO DX</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="carilla"
                    checked={formData.tiposTrabajo.includes("CARILLA")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "CARILLA")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="carilla" className="text-[11px] cursor-pointer">CARILLA</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="paracarillas"
                    checked={formData.tiposTrabajo.includes("PARA CARILLAS")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "PARA CARILLAS")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="paracarillas" className="text-[11px] cursor-pointer">PARA CARILLAS</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="protesis"
                    checked={formData.tiposTrabajo.includes("PRÓTESIS FIJA")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "PRÓTESIS FIJA")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="protesis" className="text-[11px] cursor-pointer">PRÓTESIS FIJA</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="paracoronas"
                    checked={formData.tiposTrabajo.includes("PARA CORONAS")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "PARA CORONAS")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="paracoronas" className="text-[11px] cursor-pointer">PARA CORONAS</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox
                    id="coronaimplante"
                    checked={formData.tiposTrabajo.includes("CORONA SOBRE IMPLANTE")}
                    onCheckedChange={() => handleCheckboxChange("tiposTrabajo", "CORONA SOBRE IMPLANTE")}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="coronaimplante" className="text-[11px] cursor-pointer">CORONA SOBRE IMPLANTE</Label>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px]">
                <span>CHIMENEA</span>
                <span>SÍ</span>
                <Input
                  type="text"
                  className="w-8 h-5 border border-gray-400 text-center text-[10px]"
                  value={formData.chimenea === true ? "X" : ""}
                  onClick={() => setFormData((prev) => ({ ...prev, chimenea: prev.chimenea === true ? null : true }))}
                  readOnly
                />
                <span>NO</span>
                <Input
                  type="text"
                  className="w-8 h-5 border border-gray-400 text-center text-[10px]"
                  value={formData.chimenea === false ? "X" : ""}
                  onClick={() => setFormData((prev) => ({ ...prev, chimenea: prev.chimenea === false ? null : false }))}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Material */}
          <div>
            <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
              MATERIAL
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-1">
                <Checkbox
                  id="disilicato-iny"
                  checked={formData.materiales.includes("DISILICATO INYECTADO")}
                  onCheckedChange={() => handleCheckboxChange("materiales", "DISILICATO INYECTADO")}
                  className="h-3 w-3"
                />
                <Label htmlFor="disilicato-iny" className="text-[11px] cursor-pointer">DISILICATO INYECTADO</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="disilicato-fre"
                  checked={formData.materiales.includes("DISILICATO FRESADO")}
                  onCheckedChange={() => handleCheckboxChange("materiales", "DISILICATO FRESADO")}
                  className="h-3 w-3"
                />
                <Label htmlFor="disilicato-fre" className="text-[11px] cursor-pointer">DISILICATO FRESADO</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="zirconio"
                  checked={formData.materiales.includes("ZIRCONIO")}
                  onCheckedChange={() => handleCheckboxChange("materiales", "ZIRCONIO")}
                  className="h-3 w-3"
                />
                <Label htmlFor="zirconio" className="text-[11px] cursor-pointer">ZIRCONIO</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="metal-ceramica"
                  checked={formData.materiales.includes("METAL-CERÁMICA")}
                  onCheckedChange={() => handleCheckboxChange("materiales", "METAL-CERÁMICA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="metal-ceramica" className="text-[11px] cursor-pointer">METAL-CERÁMICA</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="pmma"
                  checked={formData.materiales.includes("PMMA")}
                  onCheckedChange={() => handleCheckboxChange("materiales", "PMMA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="pmma" className="text-[11px] cursor-pointer">PMMA</Label>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t">
                <div className="flex items-center gap-1 text-[11px]">
                  <span>PRUEBA</span>
                  <Checkbox
                    checked={formData.prueba}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, prueba: checked === true }))}
                    className="h-3 w-3"
                  />
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <span>TERMINADO</span>
                  <Checkbox
                    checked={formData.terminado}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, terminado: checked === true }))}
                    className="h-3 w-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dientes a Trabajar */}
      <div className="border-b">
        <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
          DIENTES A TRABAJAR
        </div>
        <div className="p-2 grid grid-cols-3 gap-2">
          {/* Dental Chart */}
          <div className="col-span-2">
            <DentalChart
              selectedTeeth={selectedTeeth}
              onToothToggle={handleToothToggle}
            />
          </div>

          {/* Color, Guía y Diente dibujable */}
          <div className="space-y-2">
{/* Diente dibujable con COLOR y GUIA */}
             <DrawableTooth 
               ref={toothDrawRef}
               width={160} 
               height={180}
               color={formData.color}
               guia={formData.guia}
               onColorChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
               onGuiaChange={(value) => setFormData((prev) => ({ ...prev, guia: value }))}
             />
          </div>
        </div>
        {/* Dientes seleccionados */}
        <div className="px-2 pb-2 text-xs">
          <span className="font-semibold">Seleccionaste: </span>
          <span className="text-gray-700">
            {selectedTeeth.length > 0
              ? selectedTeeth.sort((a, b) => a - b).join(", ")
              : "Ninguno"}
          </span>
        </div>
      </div>

      {/* Indicaciones del Odontólogo */}
      <div className="border-b">
        <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
          INDICACIONES DEL ODONTÓLOGO
        </div>
        <div className="p-2">
          <Textarea
            className="w-full min-h-[60px] border border-gray-300 text-xs"
            placeholder="Escriba las indicaciones..."
            value={formData.indicaciones}
            onChange={(e) => setFormData((prev) => ({ ...prev, indicaciones: e.target.value }))}
          />
        </div>
      </div>

      {/* Archivos Adjuntos */}
      <div className="border-b">
        <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
          ARCHIVOS ADJUNTOS
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Adjunte imágenes o PDFs (máx. 10MB c/u)</span>
          </div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,application/pdf"
            multiple
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-all hover:bg-accent cursor-pointer"
          >
            <Upload size={14} />
            Seleccionar archivos
          </label>
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <File size={14} className="text-gray-600" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Piezas Enviadas */}
      <div className="p-3 border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <h3 className="font-semibold text-xs mb-2">PIEZAS ENVIADAS</h3>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[11px]">
              <div className="flex items-center gap-1">
                <Checkbox
                  id="analogo"
                  checked={formData.piezasEnviadas.includes("ANÁLOGO")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "ANÁLOGO")}
                  className="h-3 w-3"
                />
                <Label htmlFor="analogo" className="text-[11px] cursor-pointer">ANÁLOGO</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="registro"
                  checked={formData.piezasEnviadas.includes("REGISTRO DE MORDIDA")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "REGISTRO DE MORDIDA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="registro" className="text-[11px] cursor-pointer">REGISTRO DE<br/>MORDIDA</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="antagonista"
                  checked={formData.piezasEnviadas.includes("ANTAGONISTA")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "ANTAGONISTA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="antagonista" className="text-[11px] cursor-pointer">ANTAGONISTA</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="coping"
                  checked={formData.piezasEnviadas.includes("COPING DE IMP")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "COPING DE IMP")}
                  className="h-3 w-3"
                />
                <Label htmlFor="coping" className="text-[11px] cursor-pointer">COPING DE IMP</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="cubeta"
                  checked={formData.piezasEnviadas.includes("CUBETA")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "CUBETA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="cubeta" className="text-[11px] cursor-pointer">CUBETA</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="modelo"
                  checked={formData.piezasEnviadas.includes("MODELO DE REF.")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "MODELO DE REF.")}
                  className="h-3 w-3"
                />
                <Label htmlFor="modelo" className="text-[11px] cursor-pointer">MODELO DE REF.</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="transfer"
                  checked={formData.piezasEnviadas.includes("TRANSFER")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "TRANSFER")}
                  className="h-3 w-3"
                />
                <Label htmlFor="transfer" className="text-[11px] cursor-pointer">TRANSFER</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="articulador"
                  checked={formData.piezasEnviadas.includes("ARTICULADOR")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "ARTICULADOR")}
                  className="h-3 w-3"
                />
                <Label htmlFor="articulador" className="text-[11px] cursor-pointer">ARTICULADOR</Label>
              </div>
              <div></div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="ucla"
                  checked={formData.piezasEnviadas.includes("UCLA")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "UCLA")}
                  className="h-3 w-3"
                />
                <Label htmlFor="ucla" className="text-[11px] cursor-pointer">UCLA</Label>
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="guiacolor"
                  checked={formData.piezasEnviadas.includes("GUÍA DE COLOR")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "GUÍA DE COLOR")}
                  className="h-3 w-3"
                />
                <Label htmlFor="guiacolor" className="text-[11px] cursor-pointer">GUÍA DE COLOR</Label>
              </div>
              <div></div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id="aditamento"
                  checked={formData.piezasEnviadas.includes("ADITAMENTO")}
                  onCheckedChange={() => handleCheckboxChange("piezasEnviadas", "ADITAMENTO")}
                  className="h-3 w-3"
                />
                <Label htmlFor="aditamento" className="text-[11px] cursor-pointer">ADITAMENTO</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-[11px] whitespace-nowrap"># CAJA</Label>
              <Input
                className="w-12 h-6 text-center border border-gray-400 text-xs"
                value={formData.caja}
                onChange={(e) => setFormData((prev) => ({ ...prev, caja: e.target.value }))}
              />
            </div>
            <div className="border border-gray-400 p-2 rounded">
              <div className="text-[10px] font-semibold mb-1">CÓD. TRAZABILIDAD</div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">#</span>
                <Input
                  className="flex-1 h-5 text-center text-xs"
                  value={formData.codigoTrazabilidad}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigoTrazabilidad: e.target.value }))}
                />
              </div>
              <div className="text-[9px] text-gray-500 text-center mt-1">
                INFO EXCLUSIVA DE LABORATORIO
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#7cb342] text-white p-3">
        <div className="flex flex-col items-center gap-1 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Carrera 42a #5c 36 Barrio Tequendama</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span>Lab-arteceramico@hotmail.com</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>+57 317 728 0804</span>
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
          className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-50 ${
            isSubmitting ? "cursor-not-allowed" : ""
          }`}
        >
          <Send size={16} />
          {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </div>

      {solicitudEnviada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Solicitud enviada</h3>
            <p className="text-sm text-gray-600 mb-4">Te contactaremos pronto.</p>
            <button
              onClick={() => {
                setSolicitudEnviada(false)
                router.push("/page_clientes")
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
