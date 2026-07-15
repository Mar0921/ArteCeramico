"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DentalChart } from "./dental-chart"
import { DrawableTooth, DrawableToothRef } from "./drawable-tooth"
import { SignaturePad } from "./signature-pad"
import { Calendar as CalendarIcon, Upload, File, X, DollarSign } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SolicitudEntry, SolicitudFormData, ToothStatus, UploadedFile } from "./solicitud-types"
import { supabase } from "@/lib/supabase"

const TIPOS_TRABAJO_PRINCIPAL = [
  "LIBRE DE METAL",
  "ENCERADOS",
  "METAL",
  "RESINAS IMPRESAS",
  "ACRÍLICOS",
  "IMPLANTOLOGÍA",
]

const CATALOGO_PRODUCTOS: Record<string, { nombre: string; precio: number }[]> = {
  "LIBRE DE METAL": [
    { nombre: "Corona disilicato maquillada", precio: 330000 },
    { nombre: "Carilla disilicato", precio: 310000 },
    { nombre: "Incrustación disilicato", precio: 300000 },
    { nombre: "Apoyo disilicato", precio: 115000 },
    { nombre: "Corona zirconio maquillada", precio: 340000 },
    { nombre: "Incrustación zirconio", precio: 315000 },
    { nombre: "Apoyo balcón zirconio", precio: 85000 },
  ],
  "ENCERADOS": [
    { nombre: "Encerado DX", precio: 40000 },
    { nombre: "Encerado guía", precio: 35000 },
  ],
  "METAL": [
    { nombre: "Corona metal porcelana", precio: 315000 },
    { nombre: "Híbrida metal-acrílico (Duratone)", precio: 3200000 },
    { nombre: "Híbrida metal-porcelana unidad", precio: 600000 },
  ],
  "RESINAS IMPRESAS": [
    { nombre: "Modelos 3D completos", precio: 100000 },
    { nombre: "Modelos 3D media arcada", precio: 60000 },
    { nombre: "Carillas impresas c/u", precio: 180000 },
    { nombre: "Coronas impresas c/u", precio: 200000 },
    { nombre: "Incrustaciones impresas c/u", precio: 180000 },
  ],
  "ACRÍLICOS": [
    { nombre: "Provisional PMMA", precio: 100000 },
    { nombre: "Provisional sobreimplante", precio: 120000 },
    { nombre: "Híbrida PMMA unidad", precio: 210000 },
    { nombre: "Plato base con rodete", precio: 45000 },
  ],
  "IMPLANTOLOGÍA": [
    { nombre: "Microfresado", precio: 130000 },
    { nombre: "Corona MP atornillada", precio: 320000 },
    { nombre: "Corona atornillada disilicato", precio: 380000 },
    { nombre: "Corona atornillada zirconio", precio: 380000 },
  ],
}

function formatoPrecio(valor: number): string {
  return `$${valor.toLocaleString("es-CO")}`
}

interface SolicitudSectionProps {
  solicitud: SolicitudEntry
  index: number
  idPrefix: string
  onToothDrawRef: (ref: DrawableToothRef | null) => void
  onUpdate: (updates: Partial<SolicitudEntry>) => void
  onFormDataChange: (updates: Partial<SolicitudFormData>) => void
}

export function SolicitudSection({
  solicitud,
  index,
  idPrefix,
  onToothDrawRef,
  onUpdate,
  onFormDataChange,
}: SolicitudSectionProps) {
  const { formData, servicioTipo, selectedTeeth, toothStatuses, uploadedFiles } = solicitud
  const [showCalendarElaboracion, setShowCalendarElaboracion] = useState(false)
  const [showCalendarEntrega, setShowCalendarEntrega] = useState(false)
  const [productoPendiente, setProductoPendiente] = useState("")

  const handleToothSelect = (toothNumber: number) => {
    onUpdate({
      selectedTeeth: selectedTeeth.includes(toothNumber)
        ? selectedTeeth
        : [...selectedTeeth, toothNumber],
    })
  }

  const handleToothStatusChange = (toothNumber: number, status: ToothStatus) => {
    onUpdate({
      toothStatuses: { ...toothStatuses, [toothNumber]: status },
    })
  }

  const handleToothStatusClear = (toothNumber: number) => {
    const next = { ...toothStatuses }
    delete next[toothNumber]
    onUpdate({
      toothStatuses: next,
      selectedTeeth: selectedTeeth.filter((t) => t !== toothNumber),
    })
  }

  const selectedTeethDisplay = useMemo(() => {
    if (selectedTeeth.length === 0) return "Ninguno"
    return selectedTeeth
      .slice()
      .sort((a, b) => a - b)
      .map((tooth) => {
        const status = toothStatuses[tooth]
        const producto = formData.productos.find((p) =>
          String(p.dientes || "")
            .split(/[\s,\-]+/)
            .includes(String(tooth))
        )
        const servicio = producto ? producto.producto : servicioTipo
        const sufijo = status ? `-${servicio}-${status}` : servicio ? `-${servicio}` : ""
        return `${tooth}${sufijo}`
      })
      .join(", ")
  }, [selectedTeeth, toothStatuses, formData.productos, servicioTipo])

  const handleServicioTipoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevo = event.target.value
    onUpdate({ servicioTipo: nuevo })
    setProductoPendiente("")
  }

  const marcarDientesDesdeProductos = (lineas: { dientes?: string }[]) => {
    const extra = new Set<number>()
    lineas.forEach((l) => {
      String(l.dientes || "")
        .split(/[\s,\-]+/)
        .forEach((t) => {
          const n = parseInt(t, 10)
          if (!isNaN(n) && n >= 1 && n <= 48) extra.add(n)
        })
    })
    const merged = Array.from(extra).sort((a, b) => a - b)
    const nextStatuses = { ...toothStatuses }
    Object.keys(nextStatuses).forEach((key) => {
      const num = Number(key)
      if (!merged.includes(num)) delete nextStatuses[num]
    })
    onUpdate({ selectedTeeth: merged, toothStatuses: nextStatuses })
  }

  const agregarProducto = () => {
    if (!productoPendiente) return
    const p = CATALOGO_PRODUCTOS[servicioTipo]?.find((x) => x.nombre === productoPendiente)
    if (!p) return
    if (formData.productos.some((x) => x.producto === p.nombre)) {
      setProductoPendiente("")
      return
    }
    onFormDataChange({
      productos: [
        ...formData.productos,
        {
          producto: p.nombre,
          unidades: 1,
          dientes: "",
          precio: p.precio,
          precioUnitario: p.precio,
        },
      ],
    })
    setProductoPendiente("")
  }

  const eliminarProducto = (index: number) => {
    onFormDataChange({
      productos: formData.productos.filter((_, i) => i !== index),
    })
  }

  const actualizarProducto = (
    index: number,
    campo: "unidades" | "dientes" | "precioUnitario",
    valor: number | string
  ) => {
    const actual = [...formData.productos]
    actual[index] = { ...actual[index], [campo]: valor }
    onFormDataChange({ productos: actual })
    if (campo === "dientes") {
      marcarDientesDesdeProductos(actual)
    }
  }

  const handleCheckboxChange = (
    field: "tiposTrabajo" | "materiales" | "piezasEnviadas",
    value: string
  ) => {
    const current = formData[field]
    onFormDataChange({
      [field]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
      const maxSize = 10 * 1024 * 1024
      return validTypes.includes(file.type) && file.size <= maxSize
    })

    const uploaded: UploadedFile[] = []
    for (const file of validFiles) {
      try {
        const extension = file.name.split(".").pop()?.toLowerCase() || "bin"
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
        const rutaStorage = `solicitudes/${nombreUnico}`

        const { error: uploadError } = await supabase.storage
          .from("documentos")
          .upload(rutaStorage, file, {
            upsert: false,
            contentType: file.type || "application/octet-stream",
          })

        if (uploadError) {
          console.error("Error upload:", uploadError)
          alert(`Error al subir ${file.name}: ${uploadError.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from("documentos")
          .getPublicUrl(rutaStorage)

        uploaded.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        })
      } catch (err) {
        console.error("Error uploading file:", err)
        alert(`Error inesperado subiendo ${file.name}`)
      }
    }

    if (uploaded.length > 0) {
      onUpdate({ uploadedFiles: [...uploadedFiles, ...uploaded] })
    }
    e.target.value = ""
  }

  const removeFile = async (fileIndex: number) => {
    const file = uploadedFiles[fileIndex]
    if (file?.url) {
      try {
        const url = new URL(file.url)
        const bucketPath = url.pathname.split("/").slice(3).join("/")
        await supabase.storage.from("documentos").remove([bucketPath])
      } catch {
        // ignore cleanup errors
      }
    }
    onUpdate({ uploadedFiles: uploadedFiles.filter((_, i) => i !== fileIndex) })
  }

  return (
    <div className="solicitud-section">
      {index > 0 && (
        <div className="bg-[#e8f5e9] px-3 py-2 border-b text-xs font-semibold text-[#2e7d32]">
          Solicitud #{index + 1}
        </div>
      )}

      {/* Fechas y Prescripción */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-col">
            <Label className="text-[10px] text-gray-600 text-center mb-1">
              FECHA DE<br />ELABORACIÓN
            </Label>
            <div className="flex items-center gap-2">
              <Popover open={showCalendarElaboracion} onOpenChange={setShowCalendarElaboracion}>
                <PopoverTrigger asChild>
                  <button type="button" className="flex items-center gap-1 rounded bg-[#a5d6a7] px-2 py-1 text-xs hover:bg-[#8bc34a]">
                    <CalendarIcon size={14} />
                    {formData.fechaElaboracion.dia || "D"}/{formData.fechaElaboracion.mes || "M"}/{formData.fechaElaboracion.anio || "A"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fechaElaboracion.dia ? new Date(parseInt(formData.fechaElaboracion.anio), parseInt(formData.fechaElaboracion.mes) - 1, parseInt(formData.fechaElaboracion.dia)) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        onFormDataChange({
                          fechaElaboracion: {
                            dia: format(date, "dd"),
                            mes: format(date, "MM"),
                            anio: format(date, "yyyy"),
                          },
                        })
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

          <div className="flex flex-col">
            <Label className="text-[10px] text-gray-600 text-center mb-1">
              FECHA DE<br />ENTREGA <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Popover open={showCalendarEntrega} onOpenChange={setShowCalendarEntrega}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-[#8bc34a] ${!formData.fechaEntrega.dia ? "bg-red-100 border border-red-400" : "bg-[#a5d6a7]"}`}
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
                        onFormDataChange({
                          fechaEntrega: {
                            dia: format(date, "dd"),
                            mes: format(date, "MM"),
                            anio: format(date, "yyyy"),
                          },
                        })
                        setShowCalendarEntrega(false)
                      }
                    }}
                    disabled={(date) => {
                      if (!formData.fechaElaboracion.dia) return true
                      const elaboracionDate = new Date(`${formData.fechaElaboracion.anio}-${formData.fechaElaboracion.mes}-${formData.fechaElaboracion.dia}`)
                      const minDate = new Date(elaboracionDate)
                      minDate.setDate(minDate.getDate() + 9)
                      return date < minDate
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-serif text-[#c62828] italic">Prescripción</span>
            <div className="text-[10px] text-gray-600 mt-0.5">HISTORIA CLÍNICA</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-xs">Nº</span>
              <Input
                className="w-16 h-6 text-center border-2 border-[#c62828] text-xs"
                value={formData.historiaClinica}
                onChange={(e) => onFormDataChange({ historiaClinica: e.target.value })}
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
              onChange={(e) => onFormDataChange({ odontologo: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">CC.:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.ccOdontologo}
              onChange={(e) => onFormDataChange({ ccOdontologo: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">PACIENTE:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.paciente}
              onChange={(e) => onFormDataChange({ paciente: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 flex-1">
            <Label className="text-xs whitespace-nowrap">No. TARJETA PROFESIONAL:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.tarjetaProfesional}
              onChange={(e) => onFormDataChange({ tarjetaProfesional: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-1 w-32">
            <Label className="text-xs whitespace-nowrap">CC.:</Label>
            <Input
              className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
              value={formData.ccPaciente}
              onChange={(e) => onFormDataChange({ ccPaciente: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Label className="text-xs whitespace-nowrap">DIRECCIÓN:</Label>
          <Input
            className="flex-1 h-6 border-b border-gray-400 rounded-none border-t-0 border-l-0 border-r-0 text-xs"
            value={formData.direccion}
            onChange={(e) => onFormDataChange({ direccion: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs whitespace-nowrap">FIRMA DE ODONTÓLOGO (A):</Label>
          <SignaturePad
            value={formData.firma}
            onChange={(dataUrl) => onFormDataChange({ firma: dataUrl })}
          />
        </div>
      </div>

      {/* Tipo de trabajo principal */}
      <div className="p-3 border-b space-y-2 text-xs">
        <Label className="text-xs font-semibold text-gray-700">AGREGAR PRODUCTO *</Label>
        <select
          value={servicioTipo}
          onChange={handleServicioTipoChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs"
        >
          <option value="">Selecciona el tipo de trabajo...</option>
          {TIPOS_TRABAJO_PRINCIPAL.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
          <option value="Otro">Otro</option>
        </select>

        {servicioTipo === "Otro" && (
          <Input
            placeholder="Especifica el servicio"
            value={formData.tiposTrabajo.find((item) => item.startsWith("OTRO:"))?.replace("OTRO:", "") || ""}
            onChange={(e) => {
              const filtered = formData.tiposTrabajo.filter((item) => !item.startsWith("OTRO:"))
              if (e.target.value.trim()) {
                onFormDataChange({
                  tiposTrabajo: [...filtered, `OTRO: ${e.target.value}`],
                })
              } else {
                onFormDataChange({ tiposTrabajo: filtered })
              }
            }}
            className="mt-2"
          />
        )}
      </div>

      {/* Productos del trabajo principal */}
      {servicioTipo && CATALOGO_PRODUCTOS[servicioTipo] && (
        <div className="border-b">
          <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
            PRODUCTOS
          </div>
          <div className="p-2 space-y-2">
            <div className="text-[10px] text-gray-500">
              Agrega productos de <span className="font-semibold">{servicioTipo}</span>:
            </div>
            <div className="flex items-center gap-2">
              <select
                value={productoPendiente}
                onChange={(e) => setProductoPendiente(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs"
              >
                <option value="">Selecciona un producto...</option>
                {CATALOGO_PRODUCTOS[servicioTipo].map((p) => (
                  <option
                    key={p.nombre}
                    value={p.nombre}
                    disabled={formData.productos.some((x) => x.producto === p.nombre)}
                  >
                    {p.nombre} — {formatoPrecio(p.precio)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={agregarProducto}
                disabled={!productoPendiente}
                className="rounded-md bg-[#7cb342] px-3 py-2 text-xs font-medium text-white transition-all hover:bg-[#689f38] disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            {formData.productos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border px-2 py-1">PRODUCTO</th>
                      <th className="border px-2 py-1 text-center">UNIDADES</th>
                      <th className="border px-2 py-1 text-center">DIENTES</th>
                      <th className="border px-2 py-1 text-right">PRECIO</th>
                      <th className="border px-2 py-1 text-right">PRECIO UNITARIO</th>
                      <th className="border px-2 py-1 text-right">TOTAL</th>
                      <th className="border px-2 py-1 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.productos.map((linea, i) => {
                      const total = (linea.unidades || 0) * (linea.precioUnitario || 0)
                      return (
                        <tr key={linea.producto}>
                          <td className="border px-2 py-1">{linea.producto}</td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="number"
                              min={0}
                              value={linea.unidades}
                              onChange={(e) =>
                                actualizarProducto(
                                  i,
                                  "unidades",
                                  Math.max(0, parseInt(e.target.value || "0", 10))
                                )
                              }
                              className="w-16 h-6 text-center border border-gray-300 rounded text-[11px]"
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="text"
                              value={linea.dientes}
                              onChange={(e) => actualizarProducto(i, "dientes", e.target.value)}
                              placeholder="ej. 11,12"
                              className="w-24 h-6 text-center border border-gray-300 rounded text-[11px]"
                            />
                          </td>
                          <td className="border px-2 py-1 text-right font-mono">{formatoPrecio(linea.precio)}</td>
                          <td className="border px-2 py-1 text-right font-mono">{formatoPrecio(linea.precioUnitario)}</td>
                          <td className="border px-2 py-1 text-right font-mono font-semibold">{formatoPrecio(total)}</td>
                          <td className="border px-2 py-1 text-center">
                            <button
                              type="button"
                              onClick={() => eliminarProducto(i)}
                              className="text-red-500 hover:text-red-700 text-[11px]"
                              aria-label={`Eliminar ${linea.producto}`}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2">
                  <div className="rounded-lg bg-gray-50 border px-3 py-1 text-xs">
                    <span className="font-bold">TOTAL: </span>
                    <span className="font-mono font-bold text-[#c62828]">
                      {formatoPrecio(
                        formData.productos.reduce(
                          (sum, p) => sum + (p.unidades || 0) * (p.precioUnitario || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-gray-500">
                Selecciona y agrega los productos que requiere el cliente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dientes a Trabajar */}
      <div className="border-b">
        <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
          DIENTES A TRABAJAR
        </div>
        <div className="p-2 grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <DentalChart
              selectedTeeth={selectedTeeth}
              toothStatuses={toothStatuses}
              onToothSelect={handleToothSelect}
              onToothStatusChange={handleToothStatusChange}
              onToothStatusClear={handleToothStatusClear}
            />
          </div>
          <div className="space-y-2">
            <DrawableTooth
              ref={onToothDrawRef}
              width={160}
              height={180}
              color={formData.color}
              guia={formData.guia}
              onColorChange={(value) => onFormDataChange({ color: value })}
              onGuiaChange={(value) => onFormDataChange({ guia: value })}
            />
          </div>
        </div>
        <div className="px-2 pb-2 text-xs">
          <span className="font-semibold">Seleccionaste: </span>
          <span className="text-gray-700">{selectedTeethDisplay}</span>
        </div>
        <div className="px-2 pb-3 text-xs">
          {formData.productos.some((p) => (p.unidades || 0) > 0) ? (
            <div className="mt-1 rounded-lg bg-gray-50 p-2 border flex justify-between">
              <span className="font-bold">TOTAL ESTIMADO:</span>
              <span className="font-mono font-bold text-[#c62828]">
                {formatoPrecio(
                  formData.productos.reduce(
                    (sum, p) => sum + (p.unidades || 0) * (p.precioUnitario || 0),
                    0
                  )
                )}
              </span>
            </div>
          ) : (
            <div className="mt-1 text-[10px] text-gray-500">
              Indica las unidades de los productos para ver el total.
            </div>
          )}
        </div>
      </div>

      {/* Indicaciones */}
      <div className="border-b">
        <div className="bg-[#8bc34a] text-white text-center py-1 text-xs font-semibold">
          INDICACIONES DEL ODONTÓLOGO
        </div>
        <div className="p-2">
          <Textarea
            className="w-full min-h-[60px] border border-gray-300 text-xs"
            placeholder="Escriba las indicaciones..."
            value={formData.indicaciones}
            onChange={(e) => onFormDataChange({ indicaciones: e.target.value })}
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
            id={`${idPrefix}-file-upload`}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,application/pdf"
            multiple
            onChange={handleFileChange}
          />
          <label
            htmlFor={`${idPrefix}-file-upload`}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-all hover:bg-accent cursor-pointer"
          >
            <Upload size={14} />
            Seleccionar archivos
          </label>
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadedFiles.map((file, fileIndex) => (
                <div key={fileIndex} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <File size={14} className="text-gray-600" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(fileIndex)}
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
              {[
                ["analogo", "ANÁLOGO"],
                ["registro", "REGISTRO DE MORDIDA", "REGISTRO DE\nMORDIDA"],
                ["antagonista", "ANTAGONISTA"],
                ["coping", "COPING DE IMP"],
                ["cubeta", "CUBETA"],
                ["modelo", "MODELO DE REF."],
                ["transfer", "TRANSFER"],
                ["articulador", "ARTICULADOR"],
                ["ucla", "UCLA"],
                ["guiacolor", "GUÍA DE COLOR"],
                ["aditamento", "ADITAMENTO"],
              ].map(([id, value, display]) => (
                <div key={id} className="flex items-center gap-1">
                  <Checkbox
                    id={`${idPrefix}-${id}`}
                    checked={formData.piezasEnviadas.includes(value)}
                    onCheckedChange={() => handleCheckboxChange("piezasEnviadas", value)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor={`${idPrefix}-${id}`} className="text-[11px] cursor-pointer">
                    {display ? (
                      <>
                        {display.split("\n").map((line, i) => (
                          <span key={i}>{i > 0 && <br />}{line}</span>
                        ))}
                      </>
                    ) : value}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="border border-gray-400 p-2 rounded">
              <div className="text-[10px] font-semibold mb-1">CÓD. TRAZABILIDAD</div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">#</span>
                <span className="flex-1 h-5 text-center text-xs border rounded border-gray-300 bg-gray-50 px-2 py-1">
                  {formData.codigoTrazabilidad}
                </span>
              </div>
              <div className="text-[9px] text-gray-500 text-center mt-1">
                INFO EXCLUSIVA DE LABORATORIO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
