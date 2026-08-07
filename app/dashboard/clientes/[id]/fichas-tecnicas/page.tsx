"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import {
  FileText,
  Upload,
  ArrowLeft,
  Plus,
  Download,
  Eye,
  Save,
  X,
  Edit3,
} from "lucide-react"

interface FichaTecnica {
  id: number
  nombre: string
  tipo: string
  fecha: string
  url: string
}

interface CampoEditable {
  label: string
  value: string
}

interface Seccion {
  titulo: string
  campos: CampoEditable[]
}

export default function FichasTecnicasPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const clienteId = params.id

  const [fichas, setFichas] = useState<FichaTecnica[]>([
    {
      id: 1,
      nombre: "Carilla de Disilicato - Caso 001",
      tipo: "Carilla de Disilicato",
      fecha: "2024-01-15",
      url: "#",
    },
    {
      id: 2,
      nombre: "Ficha Técnica - Corona Zirconio",
      tipo: "Corona Zirconio",
      fecha: "2024-01-14",
      url: "#",
    },
    {
      id: 3,
      nombre: "Carilla de Disilicato - Caso 002",
      tipo: "Carilla de Disilicato",
      fecha: "2024-01-13",
      url: "#",
    },
  ])

  const [solicitudes, setSolicitudes] = useState<
    { id: number; paciente: string; odontologo: string | null; codigo_trazabilidad: string; dientes_trabajados: string[] }[]
  >([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showFichaModal, setShowFichaModal] = useState(false)
  const [nuevaFicha, setNuevaFicha] = useState({
    nombre: "",
    tipo: "Carilla de Disilicato",
    fecha: new Date().toISOString().split("T")[0],
  })

  const [fichaActual, setFichaActual] = useState<Seccion[]>([])

  useEffect(() => {
    const loadSolicitudes = async () => {
      try {
        const response = await fetch(
          `/api/solicitudes?cliente_id=${clienteId}&limit=100`
        )
        if (response.ok) {
          const result = await response.json()
          const data = result.data || []
          setSolicitudes(
            data.map((s: any) => ({
              id: s.id,
              paciente: s.paciente || "",
              odontologo: s.odontologo || null,
              codigo_trazabilidad: s.codigo_trazabilidad || "",
              dientes_trabajados: s.dientes_trabajados || [],
            }))
          )
        }
      } catch (err) {
        console.error("Error cargando solicitudes:", err)
      } finally {
        setLoadingSolicitudes(false)
      }
    }

    loadSolicitudes()
  }, [clienteId])

  const crearFichaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de prótesis fija y carilla en Disilicato estratificada" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración dental fija sobre medida bucal, tipo carilla estética, fabricada mediante una estructura base de cerámica de disilicato de litio recubierta con capas de cerámica de estratificación feldespática para lograr una mayor caracterización estética. Diseñada para adherirse de forma permanente a la superficie vestibular de dientes naturales, con el propósito de restaurar o mejorar la estética dental y contribuir a la función masticatoria. El dispositivo es elaborado de manera individualizada a partir de la prescripción del odontólogo tratante y de las características anatómicas específicas del paciente, garantizando biocompatibilidad, adaptación marginal, resistencia mecánica y alta estética mediante la reproducción de color, translucidez y textura dental natural.",
        },
        {
          label: "Uso previsto",
          value: "Restaurar la estética y función dental mediante la corrección de alteraciones de forma, tamaño, color, desgaste, fracturas menores o espacios interdentales. Indicada para rehabilitaciones estéticas conservadoras en dientes anteriores y premolares, según prescripción del profesional tratante.",
        },
        {
          label: "Materiales Empleados",
          value: "Disilicato de litio de uso odontológico (cerámica vítrea reforzada), biocompatible y de alta resistencia mecánica.\nMasas cerámicas de estratificación feldespática para caracterización anatómica, cromática y estética.\nMateriales refractarios y accesorios de laboratorio dental para el proceso de estratificación y cocción cerámica.\nPigmentos y maquillajes cerámicos para caracterización estética individualizada, cuando sea requerido.",
        },
        {
          label: "Vida útil estimada",
          value: "Período durante el cual se espera que la carilla en Disilicato de litio estratificada mantenga de forma segura y efectiva sus características funcionales, mecánicas y estéticas. La vida útil estimada es de 10 a 15 años, dependiendo de las condiciones de uso, higiene oral, mantenimiento profesional periódico y ausencia de factores que comprometan la integridad del dispositivo médico sobre medida bucal.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 \"Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal\"\n\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Desprendimiento o fractura de la carilla por trauma o sobrecarga oclusal, sensibilidad dental transitoria posterior a la cementación, irritación de tejidos blandos por desajustes marginales, reacción alérgica a materiales complementarios utilizados en la cementación (casos excepcionales) y desgaste del diente antagonista en presencia de ajustes oclusales inadecuados.",
        },
        { label: "Mitigación de riesgos", value: "Ajustes, control dimensional, pruebas de resistencia." },
        {
          label: "Advertencias y contraindicaciones",
          value: "No utilizar en pacientes con higiene oral deficiente, enfermedad periodontal activa no controlada o estructura dental insuficiente para la adhesión. Contraindicado en casos de bruxismo severo no tratado, hábitos para funcionales sin control, movilidad dental avanzada o alergia conocida a alguno de los materiales empleados. Evitar impactos directos sobre la restauración y el uso de los dientes para abrir o cortar objetos.",
        },
        {
          label: "Instrucciones de uso",
          value: "Mantener una adecuada higiene oral mediante cepillado dental mínimo tres veces al día y uso diario de seda dental, asistir a los controles odontológicos periódicos programados por su odontólogo para evaluar el estado de la restauración y de los tejidos orales, evitar morder o abrir objetos con los dientes, como tapas, empaques, uñas, bolígrafos u otros elementos duros, limitar el consumo de alimentos extremadamente duros que puedan generar fracturas o desprendimiento de la restauración. No realizar ajustes, pulidos o reparaciones por cuenta propia; cualquier intervención debe ser realizada por un profesional de la odontología.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Realice una higiene oral adecuada mediante cepillado después de cada comida utilizando un cepillo de cerdas suaves y crema dental de baja abrasividad.\nUtilice seda dental diariamente para remover la placa bacteriana y los residuos de alimentos entre los dientes y alrededor de la restauración.\nAsista a controles odontológicos periódicos, al menos cada seis meses o según indicación de su odontólogo, para evaluar el estado de la carilla y realizar mantenimiento preventivo.\nEvite masticar alimentos excesivamente duros (hielo, huesos, caramelos duros, entre otros) que puedan ocasionar fracturas o desprendimiento de la restauración.\nNo utilice los dientes como herramienta para abrir envases, cortar hilos o sujetar objetos.\nSi presenta bruxismo (rechinamiento o apretamiento dental), utilice la férula o protector nocturno recomendado por su odontólogo.\nLimite el consumo frecuente de sustancias que puedan afectar la salud oral, como bebidas azucaradas o altamente ácidas.",
        },
      ],
    },
    {
      titulo: "5. Garantía",
      campos: [
        {
          label: "Garantía",
          value: "El dispositivo médico sobre medida bucal cumple con los requisitos esenciales de seguridad y se ajusta estrictamente a la prescripción y a los requisitos establecidos en el capítulo VI, artículos 9, 10 y 11 de la resolución 214 de 2022.\n\nLa garantía del dispositivo médico será como mínimo por un (1) año a partir de la fecha de adaptación del dispositivo médico, periodo durante el cual se realiza reparación o reposición del dispositivo médico, si aplica.",
        },
      ],
    },
    {
      titulo: "6. Firma",
      campos: [
        { label: "Firma autorizada (nombre y firma del director técnico / perfil profesional)", value: "" },
      ],
    },
    {
      titulo: "CONTROL DE CAMBIOS",
      campos: [
        { label: "VERSIÓN", value: "00" },
        { label: "FECHA DE APROBACIÓN", value: "15 de febrero 2024" },
        { label: "DESCRIPCIÓN DEL CAMBIO", value: "Elaboración del documento" },
        { label: "VERSIÓN", value: "001" },
        { label: "FECHA DE APROBACIÓN", value: "15 de marzo 2025" },
        { label: "DESCRIPCIÓN DEL CAMBIO", value: "Revisión y aprobación del documento." },
      ],
    },
    {
      titulo: "ELABORÓ",
      campos: [
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico y calidad" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
    {
      titulo: "REVISÓ",
      campos: [
        { label: "NOMBRES Y APELLIDOS", value: "María del Pilar Jiménez B" },
        { label: "CARGO", value: "Asistente técnico" },
        { label: "FIRMA", value: "/firma-pilar.jpeg" },
      ],
    },
    {
      titulo: "APROBÓ",
      campos: [
        { label: "NOMBRES Y APELLIDOS", value: "Oscar Eduardo García" },
        { label: "CARGO", value: "Gerente" },
        { label: "FIRMA", value: "/firma-oscar.jpeg" },
      ],
    },
  ]

  const handleCrearFicha = () => {
    if (!nuevaFicha.nombre.trim()) return
    const ficha: FichaTecnica = {
      id: Date.now(),
      nombre: nuevaFicha.nombre,
      tipo: nuevaFicha.tipo,
      fecha: nuevaFicha.fecha,
      url: "#",
    }
    setFichas([ficha, ...fichas])
    setNuevaFicha({ nombre: "", tipo: "Carilla de Disilicato", fecha: new Date().toISOString().split("T")[0] })
    setShowModal(false)
  }

  const handleAbrirFicha = () => {
    const ficha = crearFichaVacia()
    const ultimaSolicitud = solicitudes.find((s) => s.paciente || s.odontologo) || solicitudes[0]
    if (ultimaSolicitud) {
      ficha.forEach((seccion) => {
        seccion.campos.forEach((campo) => {
          if (campo.label === "Nombre del paciente") {
            campo.value = ultimaSolicitud.paciente || ""
          }
          if (campo.label === "Prescriptor") {
            campo.value = ultimaSolicitud.odontologo || ""
          }
          if (campo.label === "Número de Serie o identificación del dispositivo") {
            const diente = (ultimaSolicitud.dientes_trabajados && ultimaSolicitud.dientes_trabajados[0]) || ""
            const codigoRaw = ultimaSolicitud.codigo_trazabilidad || ""
            const partes = codigoRaw.split("-")
            const codigo = partes.length >= 2 ? `${partes[0]}-${partes[1]}` : codigoRaw
            campo.value = codigo && diente ? `${codigo}-${diente}` : codigo || diente || ""
          }
        })
      })
    }
    setFichaActual(ficha)
    setShowFichaModal(true)
  }

  const handleGuardarFicha = () => {
    setShowFichaModal(false)
  }

  const handleCampoChange = (seccionIndex: number, campoIndex: number, value: string) => {
    setFichaActual((prev) => {
      const nueva = [...prev]
      nueva[seccionIndex] = {
        ...nueva[seccionIndex],
        campos: nueva[seccionIndex].campos.map((c, i) =>
          i === campoIndex ? { ...c, value } : c
        ),
      }
      return nueva
    })
  }

  return (
    <div className="space-y-6 mt-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Fichas Técnicas
            </h1>
            <p className="text-muted-foreground">
              Gestión de fichas técnicas del cliente
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
        >
          <Plus size={18} />
          Nueva Ficha Técnica
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={handleAbrirFicha}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Carilla de Disilicato
              </p>
              <p className="text-lg font-semibold text-foreground">
                Carilla de Disilicato
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
            <Edit3 size={16} />
            Editar
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Fichas Registradas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fichas.map((ficha) => (
                <tr
                  key={ficha.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {ficha.nombre}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {ficha.tipo}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {ficha.fecha}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye size={16} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-card p-6 shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Nueva Ficha Técnica
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nuevaFicha.nombre}
                  onChange={(e) =>
                    setNuevaFicha((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  placeholder="Nombre de la ficha técnica"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tipo
                </label>
                <select
                  value={nuevaFicha.tipo}
                  onChange={(e) =>
                    setNuevaFicha((prev) => ({ ...prev, tipo: e.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Carilla de Disilicato">
                    Carilla de Disilicato
                  </option>
                  <option value="Corona Zirconio">Corona Zirconio</option>
                  <option value="Corona Disilicato">Corona Disilicato</option>
                  <option value="Incrustación">Incrustación</option>
                  <option value="Prótesis">Prótesis</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Fecha
                </label>
                <input
                  type="date"
                  value={nuevaFicha.fecha}
                  onChange={(e) =>
                    setNuevaFicha((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearFicha}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Crear Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {showFichaModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto">
          <div className="rounded-xl bg-card shadow-xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Carilla de Disilicato
              </h3>
              <button
                onClick={() => setShowFichaModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pt-4 pb-2 border-b border-border">
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="ml-1 font-medium text-foreground">001</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha de Elaboración:</span>
                  <span className="ml-1 font-medium text-foreground">23-07-2026</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Página:</span>
                  <span className="ml-1 font-medium text-foreground">5 de 6</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <span className="ml-1 font-medium text-foreground">GF-FO-003</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs mt-2">
                <div>
                  <span className="text-muted-foreground">PROCESO:</span>
                  <span className="ml-1 font-medium text-foreground">GESTIÓN FABRICACIÓN</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">FORMATO:</span>
                  <span className="ml-1 font-medium text-foreground">FICHA TÉCNICA DISPOSITIVO MÉDICO SOBRE MEDIDA BUCAL</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {fichaActual.map((seccion, seccionIndex) => (
                <div key={seccionIndex}>
                  <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">
                    {seccion.titulo}
                  </h4>
                  <div className="space-y-3">
                    {seccion.campos.map((campo, campoIndex) => (
                      <div key={campoIndex} className="grid grid-cols-12 gap-3 items-start">
                        <label className="col-span-4 text-xs font-medium text-muted-foreground pt-2">
                          {campo.label}
                        </label>
                        {campo.label === "FIRMA" && campo.value.startsWith("/") ? (
                          <img
                            src={campo.value}
                            alt="Firma"
                            className="col-span-8 h-20 object-contain"
                          />
                        ) : (
                          <textarea
                            value={campo.value}
                            onChange={(e) =>
                              handleCampoChange(seccionIndex, campoIndex, e.target.value)
                            }
                            rows={campo.label.includes("Materiales") || campo.label.includes("Vida Ãºtil") || campo.label.includes("Normas aplicadas") || campo.label.includes("AnÃ¡lisis de riesgos") || campo.label.includes("Advertencias") || campo.label.includes("Instrucciones") || campo.label.includes("GarantÃ­a") || campo.label.includes("DescripciÃ³n tÃ©cnica") || campo.label.includes("Uso previsto") ? 6 : 2}
                            className="col-span-8 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowFichaModal(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cerrar
              </button>
              <button
                onClick={handleGuardarFicha}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}