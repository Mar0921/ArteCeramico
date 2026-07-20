import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jsPDF from "jspdf"
import { SERVICE_PRICES, parsePrice } from "@/lib/service-prices"

export const runtime = "nodejs"

async function insertarServicios(supabase: any, rows: any[]) {
  const { error } = await supabase.from("servicios").insert(rows)
  if (
    error &&
    /es_principal/i.test(error.message || "") &&
    /(does not exist|could not find|column)/i.test(error.message || "")
  ) {
    const sinPrincipal = rows.map(({ es_principal, ...rest }) => rest)
    return supabase.from("servicios").insert(sinPrincipal)
  }
  return { error }
}

async function buildPdfBuffer(data: {
  clienteNombre: string
  clienteDocumento: string
  clienteClinica: string
  clienteCorreo: string
  clienteTelefono: string
  servicio: string
  observaciones: string
  archivosNombres: string[]
  createdAt: string
  dientesTrabajados?: string[]
  precio?: number | null
  fechaElaboracion?: string
  fechaEntrega?: string
  historiaClinica?: string
  odontologo?: string
  ccOdontologo?: string
  paciente?: string
  tarjetaProfesional?: string
  ccPaciente?: string
  direccion?: string
  firma?: string
  tiposTrabajo?: string[]
  materiales?: string[]
  chimenea?: boolean
  prueba?: boolean
  terminado?: boolean
  color?: string
  guia?: string
  indicaciones?: string
  piezasEnviadas?: string[]
  codigoTrazabilidad?: string
  productos?: { producto: string; unidades: number; dientes: string; precio: number; precioUnitario: number }[]
  dibujoOdontologo?: string
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 15

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const addLine = () => {
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 4
  }

  const addSectionTitle = (title: string) => {
    checkPageBreak(10)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(title, margin, y)
    y += 5
  }

  const addField = (label: string, value: string) => {
    checkPageBreak(10)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    const labelStr = `${label}:`
    const labelWidth = doc.getTextWidth(labelStr)
    const offsetX = labelWidth + 3
    doc.text(labelStr, margin, y)
    doc.setFont("helvetica", "normal")
    const availableWidth = contentWidth - offsetX
    const splitValue = doc.splitTextToSize(value || "N/A", availableWidth)
    doc.text(splitValue, margin + offsetX, y)
    y += Math.max(splitValue.length, 1) * 4.5 + 2
  }

  const addFieldsGrid = (fields: [string, string][], columns = 2) => {
    checkPageBreak(20)
    doc.setFontSize(9)
    const colWidth = contentWidth / columns
    let currentX = margin
    let currentY = y
    let maxY = y

    for (const [label, value] of fields) {
      doc.setFont("helvetica", "bold")
      const labelStr = `${label}:`
      const labelWidth = doc.getTextWidth(labelStr)
      const offsetX = labelWidth + 3
      doc.text(labelStr, currentX, currentY)
      doc.setFont("helvetica", "normal")
      const availableWidth = colWidth - offsetX - margin
      const splitValue = doc.splitTextToSize(value || "N/A", availableWidth)
      doc.text(splitValue, currentX + offsetX, currentY)
      const needed = Math.max(splitValue.length, 1) * 4.5 + 3
      maxY = Math.max(maxY, currentY + needed)

      if (currentY + needed > pageHeight - margin - 10) {
        doc.addPage()
        currentY = margin
        maxY = margin
        currentX = margin
      } else {
        currentY += needed
      }

      if (currentY > y + 35 && currentX === margin) {
        currentX = margin + colWidth
        currentY = maxY + 3
        maxY = Math.max(maxY, currentY)
      }
    }

    y = Math.max(y + 5, maxY + 3)
  }

  const addImageFromBase64 = (base64: string | undefined, maxWidth: number, maxHeight: number) => {
    if (!base64) return false
    try {
      const match = base64.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) return false
      const mimeType = match[1]
      const base64Data = match[2]
      const format = mimeType === "image/png" ? "PNG" : "JPEG"

      checkPageBreak(maxHeight + 5)
      doc.addImage(base64Data, format, margin, y, maxWidth, maxHeight)
      y += maxHeight + 5
      return true
    } catch {
      return false
    }
  }

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("ARTE CERAMICO - LABORATORIO DENTAL", pageWidth / 2, y, { align: "center" })
  y += 5

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Cra 42a # 5c -36, Cali, Valle del Cauca, Colombia", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.text("Telefono: 3177280804 | Correo: lab-arteceramico@hotmail.com", pageWidth / 2, y, { align: "center" })
  y += 8

  addLine()

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("SOLICITUD DE SERVICIO", pageWidth / 2, y, { align: "center" })
  y += 8

  addSectionTitle("DATOS DEL CLIENTE")
  addFieldsGrid([
    ["Fecha de solicitud", new Date(data.createdAt).toLocaleString()],
    ["Nombre", data.clienteNombre],
    ["Documento", data.clienteDocumento],
    ["Clinica", data.clienteClinica],
    ["Correo", data.clienteCorreo],
    ["Telefono", data.clienteTelefono],
  ])

  addSectionTitle("DATOS DE LA SOLICITUD")
  addFieldsGrid([
    ["Historia Clinica", data.historiaClinica || "N/A"],
    ["Fecha Elaboracion", data.fechaElaboracion || "N/A"],
    ["Fecha Entrega", data.fechaEntrega || "N/A"],
    ["Codigo Trazabilidad", data.codigoTrazabilidad || "N/A"],
  ])

  addField("Servicio", data.servicio)
  addField("Indicaciones", data.indicaciones || data.observaciones || "Sin indicaciones.")

  if (data.chimenea !== undefined || data.prueba !== undefined || data.terminado !== undefined) {
    addFieldsGrid([
      ["Chimenea", data.chimenea ? "Si" : "No"],
      ["Prueba", data.prueba ? "Si" : "No"],
      ["Terminado", data.terminado ? "Si" : "No"],
    ])
  }

  addSectionTitle("DATOS DEL ODONTOLOGO")
  addFieldsGrid([
    ["Nombre", data.odontologo || "N/A"],
    ["CC", data.ccOdontologo || "N/A"],
    ["Tarjeta Profesional", data.tarjetaProfesional || "N/A"],
    ["Direccion", data.direccion || "N/A"],
  ])

  if (data.firma) {
    checkPageBreak(30)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Firma:", margin, y)
    y += 3
    addImageFromBase64(data.firma, 60, 25)
  }

  addSectionTitle("DATOS DEL PACIENTE")
  addFieldsGrid([
    ["Nombre", data.paciente || "N/A"],
    ["CC", data.ccPaciente || "N/A"],
  ])

  if (data.tiposTrabajo && data.tiposTrabajo.length > 0) {
    addSectionTitle("TIPOS DE TRABAJO")
    addField("Tipos", data.tiposTrabajo.join(", "))
  }

  if (data.materiales && data.materiales.length > 0) {
    addSectionTitle("MATERIALES")
    addField("Materiales", data.materiales.join(", "))
  }

  if (data.color || data.guia) {
    addSectionTitle("COLOR")
    addFieldsGrid([
      ["Color", data.color || "N/A"],
      ["Guia", data.guia || "N/A"],
    ])
  }

  if (data.productos && data.productos.length > 0) {
    addSectionTitle("PRODUCTOS")
    checkPageBreak(20)
    const tableHeaders = ["Producto", "Unidades", "Dientes", "Precio Unit.", "Total"]
    const colWidths = [70, 20, 25, 30, 30]
    const rowHeight = 6
    let x = margin

    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    for (let i = 0; i < tableHeaders.length; i++) {
      doc.text(tableHeaders[i], x, y)
      x += colWidths[i]
    }
    y += 2
    addLine()
    y += 2

    doc.setFont("helvetica", "normal")
    for (const prod of data.productos) {
      checkPageBreak(rowHeight + 4)
      x = margin
      const row = [prod.producto, String(prod.unidades || 0), prod.dientes || "", `$${(prod.precioUnitario || 0).toLocaleString("es-CO")}`, `$${((prod.unidades || 0) * (prod.precioUnitario || 0)).toLocaleString("es-CO")}`]
      for (let i = 0; i < row.length; i++) {
        doc.text(row[i], x, y)
        x += colWidths[i]
      }
      y += rowHeight
    }

    y += 3
    doc.setFont("helvetica", "bold")
    const totalProductos = data.productos.reduce((sum, p) => sum + (p.unidades || 0) * (p.precioUnitario || 0), 0)
    doc.text(`TOTAL PRODUCTOS: $${totalProductos.toLocaleString("es-CO")}`, margin, y)
    y += 6
  }

  if (data.dientesTrabajados && data.dientesTrabajados.length > 0) {
    addSectionTitle("DIENTES TRABAJADOS")
    addField("Dientes", data.dientesTrabajados.join(", "))
  }

  if (data.piezasEnviadas && data.piezasEnviadas.length > 0) {
    addSectionTitle("PIEZAS ENVIADAS")
    addField("Piezas", data.piezasEnviadas.join(", "))
  }

  if (data.archivosNombres.length > 0) {
    addSectionTitle("ARCHIVOS ADJUNTOS")
    for (const nombre of data.archivosNombres) {
      addField("Archivo", `- ${nombre}`)
    }
  }

  if (data.dibujoOdontologo) {
    addSectionTitle("DIBUJO DEL ODONTOLOGO")
    addImageFromBase64(data.dibujoOdontologo, 100, 80)
  }

  if (data.precio !== null && data.precio !== undefined) {
    addSectionTitle("PRECIO")
    addField("Precio", `$${Number(data.precio).toLocaleString("es-CO")}`)
  }

  y += 6
  addLine()
  y += 5
  doc.setFontSize(8)
  doc.text("Solicitud generada automaticamente por el sistema de Arte Ceramico.", pageWidth / 2, y, { align: "center" })

  return Buffer.from(doc.output("arraybuffer"))
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const servicio = String(formData.get("servicio") || "").trim()
    const observaciones = String(formData.get("observaciones") || "").trim()
    const indicaciones = String(formData.get("indicaciones") || "").trim()
    const userId = String(formData.get("userId") || "").trim()
    const archivos = formData.getAll("archivos").filter((value): value is File => value instanceof File)
    const archivosUrlsJson = String(formData.get("archivos_urls") || "[]").trim()
    const archivosNombresJson = String(formData.get("archivos_nombres") || "[]").trim()

    const fechaElaboracion = String(formData.get("fechaElaboracion") || "").trim()
    const fechaEntrega = String(formData.get("fechaEntrega") || "").trim()
    const historiaClinica = String(formData.get("historiaClinica") || "").trim()

    const convertirFecha = (fechaStr: string): string | null => {
      if (!fechaStr) return null
      const partes = fechaStr.split("/")
      if (partes.length !== 3) return null
      const [dia, mes, anio] = partes
      return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
    }

    const fechaElaboracionFormateada = convertirFecha(fechaElaboracion)
    const fechaEntregaFormateada = convertirFecha(fechaEntrega)
    const paciente = String(formData.get("paciente") || "").trim()
    const ccPaciente = String(formData.get("ccPaciente") || "").trim()
    const tarjetaProfesional = String(formData.get("tarjetaProfesional") || "").trim()
    const direccion = String(formData.get("direccion") || "").trim()
    const firma = String(formData.get("firma") || "").trim()
    const tiposTrabajoJson = String(formData.get("tiposTrabajo") || "[]").trim()
    const materialesJson = String(formData.get("materiales") || "[]").trim()
    const chimenea = String(formData.get("chimenea") || "false") === "true"
    const prueba = String(formData.get("prueba") || "false") === "true"
    const terminado = String(formData.get("terminado") || "false") === "true"
    const color = String(formData.get("color") || "").trim()
    const guia = String(formData.get("guia_color") || "").trim()
    const piezasEnviadasJson = String(formData.get("piezasEnviadas") || "[]").trim()
    const caja = String(formData.get("caja") || "").trim()
    const codigoTrazabilidad = String(formData.get("codigoTrazabilidad") || "").trim()
    const dientesTrabajadosJson = String(formData.get("dientesTrabajados") || "[]").trim()
    const dibujoOdontologo = String(formData.get("dibujoOdontologo") || "").trim()
    const productosJson = String(formData.get("productos") || "[]").trim()

    let tiposTrabajo: string[] = []
    let materiales: string[] = []
    let piezasEnviadas: string[] = []
    let dientesTrabajados: string[] = []
    let dientesDetallados: { diente: number; servicio: string; estado: string }[] = []

    try {
      tiposTrabajo = JSON.parse(tiposTrabajoJson)
    } catch {
      tiposTrabajo = []
    }
    try {
      materiales = JSON.parse(materialesJson)
    } catch {
      materiales = []
    }
    try {
      piezasEnviadas = JSON.parse(piezasEnviadasJson)
    } catch {
      piezasEnviadas = []
    }
    try {
      const parsedDientes = JSON.parse(dientesTrabajadosJson)
      if (Array.isArray(parsedDientes)) {
        if (parsedDientes.length > 0 && typeof parsedDientes[0] === "object") {
          dientesDetallados = parsedDientes.map((item: any) => ({
            diente: Number(item.diente),
            servicio: String(item.servicio || ""),
            estado: String(item.estado || "normal"),
          }))
          dientesTrabajados = dientesDetallados.map((d) => `${d.diente}-${d.servicio}-${d.estado}`)
        } else {
          dientesTrabajados = parsedDientes.map((d: any) => String(d))
        }
      }
    } catch {
      dientesTrabajados = []
    }

    let productos: { unidades?: number; precioUnitario?: number }[] = []
    try {
      const parsedProductos = JSON.parse(productosJson)
      if (Array.isArray(parsedProductos)) productos = parsedProductos
    } catch {
      productos = []
    }

    const totalProductos = productos.reduce(
      (sum, p) => sum + (Number(p.unidades) || 0) * (Number(p.precioUnitario) || 0),
      0
    )

    let urlsDocumentos: string[] = []
    let nombresArchivos: string[] = []

    try {
      const parsedUrls = JSON.parse(archivosUrlsJson)
      const parsedNombres = JSON.parse(archivosNombresJson)
      if (Array.isArray(parsedUrls)) {
        urlsDocumentos = parsedUrls.filter((u): u is string => typeof u === "string")
      }
      if (Array.isArray(parsedNombres)) {
        nombresArchivos = parsedNombres.filter((n): n is string => typeof n === "string")
      }
    } catch {
      // ignore JSON parse errors
    }

    console.log("================================")
    console.log("SERVICIO:", servicio)
    console.log("USER ID:", userId)
    console.log("ARCHIVOS:", archivos)
    console.log("ARCHIVOS LENGTH:", archivos?.length)
    console.log("ARCHIVOS URLS:", urlsDocumentos)
    console.log("SERVICIO VACIO:", !servicio)
    console.log("USER ID VACIO:", !userId)
    console.log("SIN ARCHIVOS:", archivos.length === 0 && urlsDocumentos.length === 0)
    console.log("================================")

    if (!servicio || !userId) {
      return NextResponse.json(
        {
          message: "Datos de solicitud invalidos. Verifica servicio y usuario.",
          debug: {
            servicio,
            userId,
          },
        },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Faltan variables de entorno de Supabase")
      return NextResponse.json(
        { message: "Error de configuración del servidor." },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("user_id", userId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json(
        { message: "Cliente no encontrado." },
        { status: 404 }
      )
    }

    if (urlsDocumentos.length === 0 && archivos.length > 0) {
      for (const archivo of archivos) {
        if (archivo.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { message: `El archivo ${archivo.name} supera el limite de 10 MB.` },
            { status: 400 }
          )
        }

        const extension = archivo.name.split(".").pop()?.toLowerCase() || "bin"
        const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
        const rutaStorage = `solicitudes/${cliente.id}/${nombreUnico}`

        const arrayBuffer = await archivo.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from("documentos")
          .upload(rutaStorage, fileBuffer, {
            upsert: false,
            contentType: archivo.type || "application/octet-stream",
          })

        if (uploadError) {
          console.error("Error upload:", uploadError)
          return NextResponse.json(
            {
              message: `Error al guardar el archivo ${archivo.name}.`,
              details: uploadError.message,
            },
            { status: 500 }
          )
        }

        const { data: urlData } = supabase.storage
          .from("documentos")
          .getPublicUrl(rutaStorage)

        urlsDocumentos.push(urlData.publicUrl)
        nombresArchivos.push(archivo.name)
      }
    } else if (urlsDocumentos.length > 0 && nombresArchivos.length === 0) {
      for (let i = 0; i < urlsDocumentos.length; i++) {
        nombresArchivos.push(`Archivo ${i + 1}`)
      }
    }

    if (dibujoOdontologo) {
      const dibujoNombre = `dibujo-${cliente.id}-${Date.now()}.png`
      const rutaDibujo = `solicitudes/${cliente.id}/${dibujoNombre}`
      const dibujoBase64 = dibujoOdontologo.split(",")[1]
      const dibujoBuffer = Buffer.from(dibujoBase64, "base64")

      const { error: dibujoUploadError } = await supabase.storage
        .from("documentos")
        .upload(rutaDibujo, dibujoBuffer, {
          upsert: false,
          contentType: "image/png",
        })

      if (!dibujoUploadError) {
        const { data: urlDibujo } = supabase.storage
          .from("documentos")
          .getPublicUrl(rutaDibujo)
        urlsDocumentos.push(urlDibujo.publicUrl)
        nombresArchivos.push("Dibujo del odontólogo.png")
      } else {
        console.error("Error uploading drawing:", dibujoUploadError)
      }
    }

    const servicioNombre = servicio.includes("|")
      ? servicio.split("|")[0].trim()
      : servicio

    const servicioDescripcion = servicio.includes("|")
      ? servicio
      : observaciones

    const unitPrice = SERVICE_PRICES[servicioNombre] ?? parsePrice(servicioDescripcion)
    const cantidad = Math.max(dientesTrabajados.length, 1)
    const total = totalProductos > 0 ? totalProductos : unitPrice * cantidad

    const pdfBytes = await buildPdfBuffer({
      clienteNombre: (cliente.nombre || "").trim(),
      clienteDocumento: `${cliente.tipo || ""} ${cliente.documento || ""}`.trim(),
      clienteClinica: (cliente.clinica || "").trim(),
      clienteCorreo: (cliente.correo || "").trim(),
      clienteTelefono: (cliente.telefono || "").trim(),
      servicio,
      observaciones,
      archivosNombres: nombresArchivos,
      createdAt: new Date().toISOString(),
      dientesTrabajados: dientesTrabajados.length > 0 ? dientesTrabajados : undefined,
      precio: total > 0 ? total : null,
      fechaElaboracion: fechaElaboracion || undefined,
      fechaEntrega: fechaEntrega || undefined,
      historiaClinica: historiaClinica || undefined,
      odontologo: formData.get("odontologo")?.toString() || undefined,
      ccOdontologo: formData.get("ccOdontologo")?.toString() || undefined,
      paciente: paciente || undefined,
      tarjetaProfesional: tarjetaProfesional || undefined,
      ccPaciente: ccPaciente || undefined,
      direccion: direccion || undefined,
      firma: firma || undefined,
      tiposTrabajo: tiposTrabajo.length > 0 ? tiposTrabajo : undefined,
      materiales: materiales.length > 0 ? materiales : undefined,
      chimenea: chimenea || undefined,
      prueba: prueba || undefined,
      terminado: terminado || undefined,
      color: color || undefined,
      guia: guia || undefined,
      indicaciones: indicaciones || undefined,
      piezasEnviadas: piezasEnviadas.length > 0 ? piezasEnviadas : undefined,
      codigoTrazabilidad: codigoTrazabilidad || undefined,
      productos: productos.length > 0 ? productos.map((p: any) => ({
        producto: p.producto || p.nombre || "Producto",
        unidades: p.unidades || 1,
        dientes: p.dientes || "",
        precio: p.precio || 0,
        precioUnitario: p.precioUnitario || p.precio || 0,
      })) : undefined,
      dibujoOdontologo: dibujoOdontologo || undefined,
    })

    const nombrePdf = `solicitud-${cliente.id}-${Date.now()}.pdf`
    const rutaPdf = `solicitudes/${cliente.id}/${nombrePdf}`

    const { error: pdfUploadError } = await supabase.storage
      .from("documentos")
      .upload(rutaPdf, pdfBytes, {
        upsert: false,
        contentType: "application/pdf",
      })

    if (pdfUploadError) {
      console.error("Error subiendo PDF:", pdfUploadError)
      return NextResponse.json(
        { message: "Error interno del servidor.", details: String(pdfUploadError) },
        { status: 500 }
      )
    }

    const { data: urlPdf } = supabase.storage
      .from("documentos")
      .getPublicUrl(rutaPdf)

    const todosLosDocumentos = [urlPdf.publicUrl, ...urlsDocumentos]

    let solicitudInsertada: any = null

    const extraFields: Record<string, unknown> = {
      fecha_elaboracion: fechaElaboracionFormateada,
      fecha_entrega: fechaEntregaFormateada,
      historia_clinica: historiaClinica || null,
      odontologo: formData.get("odontologo")?.toString() || null,
      cc_odontologo: formData.get("ccOdontologo")?.toString() || null,
      odontologo_tarjeta_profesional: tarjetaProfesional || null,
      odontologo_direccion: direccion || null,
      odontologo_firma: firma || null,
      paciente: paciente || null,
      cc_paciente: ccPaciente || null,
      observaciones: observaciones || null,
      color: color || null,
      guia: guia || null,
      chimenea: chimenea,
      prueba: prueba,
      terminado: terminado,
      caja: caja || null,
      tipos_trabajo: tiposTrabajo,
      materiales: materiales,
      dientes_trabajados: dientesTrabajados,
      piezas_enviadas: piezasEnviadas,
      dibujo_odontologo: dibujoOdontologo || null,
    }

    const siNo = (value: boolean) => (value ? "Si" : "No")

    const insertData: Record<string, unknown> = {
      cliente_id: cliente.id,
      servicio,
      observaciones,
      urls_documentos: todosLosDocumentos,
      estado: "pendiente",
      codigo_trazabilidad: codigoTrazabilidad || null,
      ...extraFields,
      chimenea: siNo(chimenea),
      prueba: siNo(prueba),
      terminado: siNo(terminado),
    }

    const { data: inserted, error: firstError } = await supabase
      .from("solicitudes")
      .insert(insertData)
      .select("id")
      .single()

    if (firstError) {
      console.error("Error en insert:", firstError)
      const msg = (firstError.message || "").toLowerCase()
      if (msg.includes("column") || msg.includes("schema") || msg.includes("does not exist")) {
        const { data: fallback, error: fallbackError } = await supabase
          .from("solicitudes")
          .insert(insertData)
          .select("id")
          .single()

        if (fallbackError) {
          console.error("Error en fallback:", fallbackError)
          throw fallbackError
        }
        solicitudInsertada = fallback
      } else {
        throw firstError
      }
    } else {
      solicitudInsertada = inserted
    }

    if (!solicitudInsertada) {
      console.error("Error insertando solicitud: no se obtuvo ID después del insert")
      return NextResponse.json(
        {
          message: "Error al guardar la solicitud.",
          details: "No se pudo registrar la solicitud.",
        },
        { status: 500 }
      )
    }

    if (productos.length > 0) {
      // Los productos seleccionados son los servicios reales. No se guarda la
      // categoría (servicioTipo) como un servicio aparte.
      const productosRows = productos.map((p: any) => ({
        solicitud_id: solicitudInsertada.id,
        nombre: p.producto || p.nombre || "Producto",
        descripcion: servicioNombre || null,
        tipo_trabajo: tiposTrabajo.length > 0 ? tiposTrabajo.join(", ") : null,
        material: materiales.length > 0 ? materiales.join(", ") : null,
        dientes: p.dientes || null,
        piezas_enviadas: piezasEnviadas.length > 0 ? piezasEnviadas : null,
        precio: (Number(p.unidades) || 0) * (Number(p.precioUnitario) || Number(p.precio) || 0),
        cantidad: Number(p.unidades) || 1,
        es_principal: false,
      }))

      const { error: productosInsertError } = await insertarServicios(supabase, productosRows)

      if (productosInsertError) {
        console.error("Error insertando productos:", productosInsertError)
      }
    } else {
      // Sin productos: el tipo de trabajo principal es el servicio.
      const servicioData: any = {
        solicitud_id: solicitudInsertada.id,
        nombre: servicioNombre,
        descripcion: servicioDescripcion || observaciones,
        tipo_trabajo: tiposTrabajo.length > 0 ? tiposTrabajo.join(", ") : null,
        material: materiales.length > 0 ? materiales.join(", ") : null,
        dientes: dientesTrabajados.length > 0 ? dientesTrabajados.join(", ") : null,
        piezas_enviadas: piezasEnviadas.length > 0 ? piezasEnviadas : null,
        precio: total,
        cantidad: cantidad,
        es_principal: true,
      }

      const categoria = servicioDescripcion.match(/Categoría: (.+)/i)
      if (categoria && categoria[1]) {
        servicioData.descripcion = `${categoria[1].trim()} - ${observaciones || servicioNombre}`
      }

      const { error: serviciosInsertError } = await insertarServicios(supabase, [servicioData])

      if (serviciosInsertError) {
        console.error("Error insertando servicio:", serviciosInsertError)
      }
    }

    if (dientesDetallados.length > 0) {
      const dientesRows = dientesDetallados.map((d) => ({
        solicitud_id: solicitudInsertada.id,
        numero: d.diente,
        servicio: d.servicio || null,
        estado: d.estado || "normal",
      }))

      const { error: dientesInsertError } = await supabase
        .from("dientes")
        .insert(dientesRows)

      if (dientesInsertError) {
        console.error("Error insertando dientes:", dientesInsertError)
      }
    }

    return NextResponse.json(
      {
        message: "Solicitud registrada correctamente.",
        solicitudId: solicitudInsertada?.id ?? null,
        urls: todosLosDocumentos,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get("cliente_id")
  const estado = searchParams.get("estado")
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from("solicitudes")
      .select("id, servicio, estado, created_at, cliente_id, dientes_trabajados")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (clienteId) {
      query = query.eq("cliente_id", parseInt(clienteId))
    }

    if (estado) {
      query = query.eq("estado", estado)
    }

    const { data: solicitudes, error } = await query

    if (error) {
      console.error("Error obteniendo solicitudes:", error)
      return NextResponse.json(
        { message: "Error al obtener solicitudes." },
        { status: 500 }
      )
    }

    if (!solicitudes || solicitudes.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const clienteIds = [...new Set(solicitudes.map((s) => s.cliente_id).filter(Boolean))]
    const clientesMap = new Map<number, string>()

    if (clienteIds.length > 0) {
      const { data: clientes, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre")
        .in("id", clienteIds)

      if (!clientesError && clientes) {
        clientes.forEach((c) => clientesMap.set(c.id, c.nombre))
      }
    }

    const solicitudIds = solicitudes.map((s) => s.id)

    const { data: servicios, error: serviciosError } = await supabase
      .from("servicios")
      .select(`
        solicitud_id,
        precio,
        dientes,
        tipo_trabajo,
        material,
        piezas_enviadas,
        id,
        nombre,
        descripcion,
        cantidad
      `)
       .in("solicitud_id", solicitudIds)
       .order("solicitud_id", { ascending: true })

    const { data: dientesData, error: dientesError } = await supabase
      .from("dientes")
      .select("solicitud_id, numero, servicio, estado")
      .in("solicitud_id", solicitudIds)
      .order("numero", { ascending: true })

    const dientesMap = new Map<
      number,
      { numero: number; servicio: string; estado: string }[]
    >()

    if (!dientesError && dientesData) {
      dientesData.forEach((d: any) => {
        const actual = dientesMap.get(d.solicitud_id) || []
        actual.push({
          numero: Number(d.numero),
          servicio: String(d.servicio || ""),
          estado: String(d.estado || "normal"),
        })
        dientesMap.set(d.solicitud_id, actual)
      })
    }

    const serviciosMap = new Map<
      number,
      {
        precio: number
        dientes: string[]
        tipoTrabajo: string[]
        materiales: string[]
        piezas: number
        servicios_detalle: any[]
      }
    >()

    if (!serviciosError && servicios) {
      servicios.forEach((serv: any) => {
        const actual = serviciosMap.get(serv.solicitud_id) || {
          precio: 0,
          dientes: [],
          tipoTrabajo: [],
          materiales: [],
          piezas: 0,
          servicios_detalle: [],
        }

        const piezas = Array.isArray(serv.piezas_enviadas)
          ? serv.piezas_enviadas.length
          : Number(serv.piezas_enviadas || 0)

        serviciosMap.set(serv.solicitud_id, {
          precio: serv.es_principal ? Number(serv.precio || 0) : actual.precio,
          dientes: serv.es_principal
            ? [...(serv.dientes ? [serv.dientes] : [])]
            : actual.dientes,
          tipoTrabajo: serv.es_principal
            ? [...(serv.tipo_trabajo ? [serv.tipo_trabajo] : [])]
            : actual.tipoTrabajo,
          materiales: serv.es_principal
            ? [...(serv.material ? [serv.material] : [])]
            : actual.materiales,
          piezas: serv.es_principal ? piezas : actual.piezas,
          servicios_detalle: serv.es_principal
            ? []
            : [
                ...actual.servicios_detalle,
                {
                  id: serv.id,
                  nombre: serv.nombre,
                  descripcion: serv.descripcion,
                  precio: Number(serv.precio || 0),
                  cantidad: serv.cantidad || 1,
                  tipo_trabajo: serv.tipo_trabajo || null,
                  material: serv.material || null,
                  dientes: serv.dientes || null,
                  piezas_enviadas: serv.piezas_enviadas || null,
                },
              ],
        })
      })
    }

    const formatted = solicitudes.map((item: any) => {
      const info = serviciosMap.get(item.id)
      let dientesInfo = dientesMap.get(item.id) || []

      if (dientesInfo.length === 0 && Array.isArray(item.dientes_trabajados)) {
        dientesInfo = item.dientes_trabajados.map((d: string) => {
          const partes = String(d).split("-")
          const numero = parseInt(partes[0], 10)
          if (partes.length === 3) {
            return { numero, servicio: partes[1], estado: partes[2] }
          }
          if (partes.length === 2) {
            return { numero, servicio: "", estado: partes[1] }
          }
          return { numero, servicio: "", estado: "normal" }
        }).filter((d: any) => !isNaN(d.numero))
      }

      return {
        id: item.id,
        servicio: item.servicio || "Servicio",
        estado: item.estado || "pendiente",
        created_at: item.created_at,
        cliente_id: item.cliente_id,
        cliente_nombre: clientesMap.get(item.cliente_id) || "Sin cliente",
        dientes_trabajados: item.dientes_trabajados || [],
        dientesTrabajados: info?.dientes || [],
        dientes_detallados: dientesInfo,
        servicios_detalle: info?.servicios_detalle || [],
        tiposTrabajo: info?.tipoTrabajo || [],
        materiales: info?.materiales || [],
        piezasEnviadas: info?.piezas || 0,
        precio: info?.precio || null,
      }
    })

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error("Error inesperado en GET:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
