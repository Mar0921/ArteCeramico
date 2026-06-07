import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jsPDF from "jspdf"

export const runtime = "nodejs"

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
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

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

  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.line(15, y, pageWidth - 15, y)
  y += 6

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("SOLICITUD DE SERVICIO", pageWidth / 2, y, { align: "center" })
  y += 8

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const fieldsLeft = [
    ["Fecha de solicitud", new Date(data.createdAt).toLocaleString()],
    ["Nombre del cliente", data.clienteNombre],
    ["Documento", data.clienteDocumento],
    ["Clinica", data.clienteClinica],
    ["Correo", data.clienteCorreo],
    ["Telefono", data.clienteTelefono],
  ]

  for (const [label, value] of fieldsLeft) {
    doc.setFont("helvetica", "bold")
    doc.text(`${label}:`, 15, y)
    doc.setFont("helvetica", "normal")
    doc.text(value, 65, y)
    y += 5.5
  }

  y += 2
  doc.line(15, y, pageWidth - 15, y)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.text("Servicio solicitado", 15, y)
  y += 2
  doc.setFont("helvetica", "normal")
  const splitServicio = doc.splitTextToSize(data.servicio, pageWidth - 30)
  doc.text(splitServicio, 15, y)
  y += splitServicio.length * 4.5 + 4

  doc.line(15, y, pageWidth - 15, y)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.text("Observaciones o detalles adicionales", 15, y)
  y += 2
  doc.setFont("helvetica", "normal")
  const splitObs = doc.splitTextToSize(data.observaciones || "Sin observaciones.", pageWidth - 30)
  doc.text(splitObs, 15, y)
  y += splitObs.length * 4.5 + 4

  if (data.archivosNombres.length > 0) {
    doc.line(15, y, pageWidth - 15, y)
    y += 6

    doc.setFont("helvetica", "bold")
    doc.text("Archivos adjuntos", 15, y)
    y += 5

    doc.setFont("helvetica", "normal")
    for (const nombre of data.archivosNombres) {
      doc.text(`- ${nombre}`, 20, y)
      y += 4.5
    }
  }

  y += 6
  doc.line(15, y, pageWidth - 15, y)
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
    const correoOdontologo = String(formData.get("correoOdontologo") || "").trim()
    const archivos = formData.getAll("archivos").filter((value): value is File => value instanceof File)

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
    const chimenea = String(formData.get("chimenea") || "No").trim() === "true" ? "Si" : "No"
    const prueba = String(formData.get("prueba") || "No").trim() === "true" ? "Si" : "No"
    const terminado = String(formData.get("terminado") || "No").trim() === "true" ? "Si" : "No"
    const color = String(formData.get("color") || "").trim()
const guia = String(formData.get("guia_color") || "").trim()
     const piezasEnviadasJson = String(formData.get("piezasEnviadas") || "[]").trim()
      const caja = String(formData.get("caja") || "").trim()
     const codigoTrazabilidad = String(formData.get("codigoTrazabilidad") || "").trim()
     const dientesTrabajadosJson = String(formData.get("dientesTrabajados") || "[]").trim()
     const dibujoOdontologo = String(formData.get("dibujoOdontologo") || "").trim()

     let tiposTrabajo: string[] = []
     let materiales: string[] = []
     let piezasEnviadas: string[] = []
     let dientesTrabajados: string[] = []

    try {
      tiposTrabajo = JSON.parse(tiposTrabajoJson)
    } catch { tiposTrabajo = [] }
    try {
      materiales = JSON.parse(materialesJson)
    } catch { materiales = [] }
try {
       piezasEnviadas = JSON.parse(piezasEnviadasJson)
     } catch { piezasEnviadas = [] }
     try {
       dientesTrabajados = JSON.parse(dientesTrabajadosJson)
     } catch { dientesTrabajados = [] }

    if (!servicio || !correoOdontologo || archivos.length === 0) {
      return NextResponse.json(
        { message: "Datos de solicitud invalidos. Verifica servicio, correo y adjuntos." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nombre, tipo, documento, correo, telefono, clinica")
      .eq("correo", correoOdontologo)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json(
        { message: "Cliente no encontrado." },
        { status: 404 }
      )
    }

    const urlsDocumentos: string[] = []
    const nombresArchivos: string[] = []

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
      { message: "Error interno del servidor.", details: String(error) },
      { status: 500 }
    )
    }

    const { data: urlPdf } = supabase.storage
      .from("documentos")
      .getPublicUrl(rutaPdf)

    const todosLosDocumentos = [urlPdf.publicUrl, ...urlsDocumentos]

    let recordToInsert: Record<string, unknown> = {
      cliente_id: cliente.id,
      servicio,
      observaciones,
      urls_documentos: todosLosDocumentos,
      estado: "pendiente",
      codigo_trazabilidad: codigoTrazabilidad || null,
      fecha_elaboracion: fechaElaboracionFormateada,
      fecha_entrega: fechaEntregaFormateada,
      historia_clinica: historiaClinica || null,
      odontologo: formData.get("odontologo")?.toString() || null,
      cc_odontologo: formData.get("ccOdontologo")?.toString() || null,
      odontologo_direccion: direccion || null,
      odontologo_firma: firma || null,
      paciente: paciente || null,
      cc_paciente: ccPaciente || null,
      color: color || null,
      guia: guia || null,
      chimenea: chimenea,
      prueba: prueba,
      terminado: terminado,
      caja: caja || null,
      tipos_trabajo: tiposTrabajo.length > 0 ? tiposTrabajo : [],
      materiales: materiales.length > 0 ? materiales : [],
      dientes_trabajados: dientesTrabajados,
      piezas_enviadas: piezasEnviadas,
      dibujo_odontologo: dibujoOdontologo || null,
    }

    let solicitudInsertada: any = null

    const { data: inserted, error: firstError } = await supabase
      .from("solicitudes")
      .insert(recordToInsert)
      .select("id")
      .single()

    if (firstError) {
      const msg = (firstError.message || "").toLowerCase()
      if (msg.includes("column") && msg.includes("does not exist")) {
        const columnMatch = firstError.message.match(/column "(.+?)"/i)
        const badColumn = columnMatch ? columnMatch[1] : null
        if (badColumn && badColumn in recordToInsert) {
          console.warn(`Columna inexistente detectada: ${badColumn}. Reintentando sin esa columna.`)
          const { [badColumn]: _, ...nextRecord } = recordToInsert
          recordToInsert = nextRecord
          const { data: retryInserted, error: retryError } = await supabase
            .from("solicitudes")
            .insert(recordToInsert)
            .select("id")
            .single()

          if (retryError) {
            console.error("Error en reintento de insert:", retryError)
            const retryMsg = (retryError.message || "").toLowerCase()
            if (retryMsg.includes("column") && retryMsg.includes("does not exist")) {
              const retryColumnMatch = retryError.message.match(/column "(.+?)"/i)
              const retryBadColumn = retryColumnMatch ? retryColumnMatch[1] : null
              if (retryBadColumn && retryBadColumn in recordToInsert) {
                console.warn(`Segunda columna inexistente: ${retryBadColumn}. Continuando sin ella.`)
                const { [retryBadColumn]: __, ...finalRecord } = recordToInsert
                recordToInsert = finalRecord
                const { data: finalInserted, error: finalError } = await supabase
                  .from("solicitudes")
                  .insert(recordToInsert)
                  .select("id")
                  .single()

                if (finalError) {
                  console.error("Error final:", finalError)
                  return NextResponse.json(
                    { message: "Error al guardar la solicitud.", details: finalError.message },
                    { status: 500 }
                  )
                }
                solicitudInsertada = finalInserted
              } else {
                return NextResponse.json(
                  { message: "Error al guardar la solicitud.", details: retryError.message },
                  { status: 500 }
                )
              }
            } else {
              return NextResponse.json(
                { message: "Error al guardar la solicitud.", details: retryError.message },
                { status: 500 }
              )
            }
          } else {
            solicitudInsertada = retryInserted
          }
        } else {
          return NextResponse.json(
            { message: "Error al guardar la solicitud.", details: firstError.message },
            { status: 500 }
          )
        }
      } else {
        console.error("Error en insert:", firstError)
        return NextResponse.json(
          { message: "Error al guardar la solicitud.", details: firstError.message },
          { status: 500 }
        )
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

    const servicioNombre = servicio.includes("|")
      ? servicio.split("|")[0].trim()
      : servicio

    const servicioDescripcion = servicio.includes("|")
      ? servicio
      : observaciones

const servicioData: any = {
       solicitud_id: solicitudInsertada.id,
       nombre: servicioNombre,
       descripcion: servicioDescripcion || observaciones,
       tipo_trabajo: tiposTrabajo.length > 0 ? tiposTrabajo.join(", ") : null,
       material: materiales.length > 0 ? materiales.join(", ") : null,
       dientes: dientesTrabajados.length > 0 ? dientesTrabajados.join(", ") : null,
       piezas_enviadas: piezasEnviadas.length > 0 ? piezasEnviadas : null,
     }

    const categoria = servicioDescripcion.match(/Categoría: (.+)/i)
    if (categoria && categoria[1]) {
      servicioData.descripcion = `${categoria[1].trim()} - ${observaciones || servicioNombre}`
    }

    const precioMatch = servicioDescripcion.match(/\$[\d\.]+/g)
    if (precioMatch && precioMatch.length > 0) {
      const precioStr = precioMatch[0].replace(/[$,\.]/g, "")
      const precioNum = Number(precioStr)
      if (Number.isFinite(precioNum) && precioNum > 0) {
        servicioData.precio = precioNum
      }
    }

    if (!servicioData.precio) {
      servicioData.precio = 0
    }

    servicioData.cantidad = 1

    const { error: serviciosInsertError } = await supabase
      .from("servicios")
      .insert(servicioData)

    if (serviciosInsertError) {
      console.error("Error insertando servicio:", serviciosInsertError)
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
  const limit = parseInt(searchParams.get("limit") || "5")

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let query = supabase
      .from("solicitudes")
      .select("id, servicio, estado, created_at, cliente_id")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (clienteId) {
      query = query.eq("cliente_id", parseInt(clienteId))
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

    const formatted = solicitudes.map((item: any) => ({
      id: item.id,
      servicio: item.servicio || "Servicio",
      estado: item.estado || "pendiente",
      created_at: item.created_at,
      cliente_id: item.cliente_id,
      cliente_nombre: clientesMap.get(item.cliente_id) || "Sin cliente",
    }))

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error("Error inesperado en GET:", error)
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
