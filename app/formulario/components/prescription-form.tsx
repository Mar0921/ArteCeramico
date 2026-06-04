"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DentalChart } from "./dental-chart"
import { DrawableTooth } from "./drawable-tooth"
import { MapPin, Mail, Phone, FileDown, Send, Calendar as CalendarIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PrescriptionFormProps {
  initialData?: {
    odontologo?: string
    ccOdontologo?: string
  }
}

export function PrescriptionForm({ initialData }: PrescriptionFormProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalendarElaboracion, setShowCalendarElaboracion] = useState(false)
  const [showCalendarEntrega, setShowCalendarEntrega] = useState(false)

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
    setIsSubmitting(true)
    try {
      const storedEmail = sessionStorage.getItem("clienteEmail")
      if (!storedEmail) return

      const { error } = await supabase
        .from("prescripciones")
        .insert({
          fecha_elaboracion: `${formData.fechaElaboracion.dia}/${formData.fechaElaboracion.mes}/${formData.fechaElaboracion.anio}`,
          fecha_entrega: `${formData.fechaEntrega.dia}/${formData.fechaEntrega.mes}/${formData.fechaEntrega.anio}`,
          historia_clinica: formData.historiaClinica,
          odontologo: formData.odontologo,
          cc_odontologo: formData.ccOdontologo,
          paciente: formData.paciente,
          tarjeta_profesional: formData.tarjetaProfesional,
          cc_paciente: formData.ccPaciente,
          direccion: formData.direccion,
          firma: formData.firma,
          tipos_trabajo: formData.tiposTrabajo,
          chimenea: formData.chimenea,
          materiales: formData.materiales,
          prueba: formData.prueba,
          terminado: formData.terminado,
          color: formData.color,
          guia: formData.guia,
          indicaciones: formData.indicaciones,
          piezas_enviadas: formData.piezasEnviadas,
          caja: formData.caja,
          codigo_trazabilidad: formData.codigoTrazabilidad,
          dientes_seleccionados: selectedTeeth,
          correo_odontologo: storedEmail,
        })

      if (error) throw error
      alert("Prescripción enviada exitosamente")
    } catch {
      alert("Error al enviar la prescripción")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async () => {
    // Simulación de pago - guardar en tabla de solicitudes
    try {
      const storedEmail = sessionStorage.getItem("clienteEmail")
      
      const { error } = await supabase
        .from("solicitudes_pago")
        .insert({
          estado: "pendiente",
          metodo: "bold",
          monto: 0,
          descripcion: "Prescripción dental",
          correo_odontologo: storedEmail,
          fecha_creacion: new Date().toISOString(),
        })

      if (error) throw error
      
      alert("Solicitud de pago creada. Redirigiendo a Bold...")
      // Descomenta cuando tengas la URL real de Bold
      // window.location.href = "https://checkout.bold.co/payment/checkout-form"
      
      return true
    } catch {
      alert("Error al crear la solicitud de pago")
      return false
    }
  }

  const handleDownloadPDF = async () => {
    if (!formRef.current) return

    const actionButtons = formRef.current.querySelector(".action-buttons") as HTMLElement
    if (actionButtons) actionButtons.style.display = "none"

    try {
      // Aseguramos que las imágenes/fuentes estén cargadas
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(formRef.current, {
        scale: 3,
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
          onClick={async () => {
            await handleSubmit()
            handlePayment()
          }}
          disabled={isSubmitting}
          className={`flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-50 ${
            isSubmitting ? "cursor-not-allowed" : ""
          }`}
        >
          <Send size={16} />
          {isSubmitting ? "Enviando..." : "Enviar y Pagar"}
        </button>
      </div>
    </div>
  )
}
