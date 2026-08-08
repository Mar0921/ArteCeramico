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
import { FichaTecnicaDisilicato } from "./ficha-tecnica-disilicato"
import { FichaTecnicaMonolitica } from "./ficha-tecnica-monolitica"
import { FichaTecnicaResina } from "./ficha-tecnica-resina"
import { FichaTecnicaCeramicaEncia } from "./ficha-tecnica-ceramica-encia"
import { FichaTecnicaColadoUcla } from "./ficha-tecnica-colado-ucla"
import { FichaTecnicaCoronaDisilicatoEstratificada } from "./ficha-tecnica-corona-disilicato-estratificada"
import { FichaTecnicaCoronaDisilicatoMonolitica } from "./ficha-tecnica-corona-disilicato-monolitica"
import { FichaTecnicaCoronaDisilicatoImplante } from "./ficha-tecnica-corona-disilicato-implante"

interface FichaTecnica {
  id: number
  nombre: string
  tipo: string
  fecha: string
  url: string
}

export interface CampoEditable {
  label: string
  value: string
}

export interface Seccion {
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
    tipo: "Carilla de Disilicato Estratificada",
    fecha: new Date().toISOString().split("T")[0],
  })

  const [fichaActual, setFichaActual] = useState<Seccion[]>([])
  const [tipoFichaActual, setTipoFichaActual] = useState<string>("")
  const [editingFicha, setEditingFicha] = useState(true)
  const [downloadingFicha, setDownloadingFicha] = useState(false)

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
        { label: "VERSIÓN", value: "01" },
        { label: "FECHA DE APROBACIÓN", value: "17 de julio 2026" },
        { label: "DESCRIPCIÓN DEL CAMBIO", value: "Elaboración, revisión y aprobación del documento" },
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

  const crearFichaMonoliticaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de prótesis fija / carilla en Disilicato monolítica" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración dental fija sobre medida bucal, tipo carilla monolítica, elaborada en cerámica de Disilicato de litio. Diseñada para adherirse a la superficie vestibular de dientes naturales con fines estéticos y funcionales.",
        },
        {
          label: "Uso previsto",
          value: "Restaurar la estética y función dental mediante la corrección de alteraciones de forma, tamaño, color, desgaste, fracturas menores o espacios interdentales. Indicada para rehabilitaciones estéticas conservadoras en dientes anteriores y premolares, según prescripción del profesional tratante.",
        },
        {
          label: "Materiales Empleados",
          value: "Cerámica de Disilicato de litio de grado médico, utilizada como material principal de la restauración monolítica.\nPigmentos, tintes o maquillajes cerámicos biocompatibles para caracterización estética individualizada, cuando aplique.\nMateriales de glaseado y acabado superficial biocompatibles para proporcionar brillo, textura y protección de la superficie.\nSe debe registrar la marca comercial, referencia y número de lote de los materiales utilizados en la fabricación del dispositivo.",
        },
        {
          label: "Vida útil estimada",
          value: "Período durante el cual se espera que la carilla en Disilicato de litio monolítica mantenga de forma segura y efectiva sus características funcionales y estéticas. La vida útil estimada es de 5 a 10 años, siempre que se mantengan adecuadas condiciones de uso, higiene oral, controles odontológicos periódicos y ausencia de factores que comprometan la integridad del dispositivo.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al dispositivo: desprendimiento o fractura de la carilla por trauma o sobrecarga oclusal, sensibilidad dental transitoria posterior a la cementación, irritación de tejidos blandos por desajustes marginales, reacción alérgica a materiales complementarios utilizados en la cementación (casos excepcionales) y desgaste del diente antagonista en presencia de ajustes oclusales inadecuados.\nMitigación de riesgos como por ejemplo ajustes, control dimensional, pruebas de resistencia.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "No utilizar en pacientes con higiene oral deficiente, enfermedad periodontal activa no controlada o estructura dental insuficiente para la adhesión. Contraindicado en casos de bruxismo severo no tratado, hábitos parafuncionales sin control, movilidad dental avanzada o alergia conocida a alguno de los materiales empleados. Evitar impactos directos sobre la restauración y el uso de los dientes para abrir o cortar objetos.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaResinaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de prótesis fija / provisional en termo curado" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración dental provisional fabricada a medida para cada paciente mediante resina acrílica termocurada de uso odontológico. Elaborada en laboratorio dental mediante procesos de polimerización por calor, diseñada para reemplazar temporalmente dientes o estructuras dentales ausentes o preparadas, proporcionando protección, función masticatoria, estabilidad oclusal y estética durante el período previo a la instalación de la restauración definitiva.",
        },
        {
          label: "Uso previsto",
          value: "Mantener la función, estética y protección de dientes preparados o espacios edéntulos durante tratamientos protésicos, restauradores o de rehabilitación oral. Su finalidad es preservar la posición de los dientes, proteger los tejidos orales, favorecer la adaptación funcional y estética del paciente y servir como restauración temporal mientras se fabrica el dispositivo definitivo.",
        },
        {
          label: "Materiales Empleados",
          value: "Resina acrílica termocurada de grado odontológico.\nPigmentos y caracterizadores dentales biocompatibles (cuando aplique).\nMateriales para acabado, ajuste y pulido.\nDebe registrarse la marca comercial, referencia y número de lote de todos los materiales utilizados en la fabricación del dispositivo.",
        },
        {
          label: "Vida útil estimada",
          value: "Dispositivo de carácter temporal con una vida útil estimada entre 3 y 12 meses, dependiendo de las condiciones clínicas, ubicación de la restauración, hábitos del paciente, fuerzas masticatorias y cumplimiento de las recomendaciones profesionales. Durante este período pueden requerirse ajustes, reparaciones, rebasados o recementaciones para mantener su correcta adaptación, funcionalidad y comodidad hasta la colocación de la restauración definitiva.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "El provisional en resina acrílica termocurada es una restauración temporal utilizada para proteger dientes preparados o reemplazar temporalmente dientes ausentes durante un tratamiento odontológico. Aunque es un dispositivo de bajo riesgo, pueden presentarse molestias leves durante el período de adaptación, sensibilidad dental temporal, desgaste del material, fractura o desprendimiento de la restauración. También puede producirse acumulación de placa bacteriana o irritación gingival si no se mantiene una adecuada higiene oral. En casos poco frecuentes, pueden presentarse reacciones de hipersensibilidad a los materiales empleados.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "Advertencias:\nEste dispositivo es de carácter temporal y no sustituye la restauración definitiva.\nEvite consumir alimentos muy duros, pegajosos o que requieran una fuerza excesiva de masticación.\nMantenga una adecuada higiene oral para prevenir inflamación de las encías y problemas periodontales.\nNo manipule, ajuste ni intente reparar la restauración por su cuenta.\nAcuda a los controles odontológicos programados para verificar su adaptación y estado.\nContraindicaciones:\nPacientes con alergia conocida a alguno de los componentes de la resina acrílica utilizada.\nCasos clínicos en los que el profesional determine que otro tipo de restauración provisional es más apropiado.\nPacientes con hábitos parafuncionales severos no controlados (bruxismo intenso), salvo indicación profesional.",
        },
        {
          label: "Instrucciones de uso",
          value: "Cepille sus dientes después de cada comida utilizando un cepillo de cerdas suaves y crema dental.\nUtilice seda dental de acuerdo con las recomendaciones de su odontólogo.\nEvite masticar alimentos extremadamente duros o pegajosos que puedan fracturar o desprender la restauración.\nMantenga las citas de control programadas por el profesional tratante.\nSi presenta molestias persistentes, fractura, aflojamiento o desprendimiento del provisional, contacte a su odontólogo de manera inmediata.\nSiga todas las recomendaciones específicas proporcionadas por el profesional responsable de su tratamiento.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Revisiones periódicas recomendadas cada 6–12 meses.",
        },
      ],
    },
    {
      titulo: "5. Garantía",
      campos: [
        {
          label: "Garantía",
          value: "El dispositivo médico sobre medida bucal cumple con los requisitos esenciales de seguridad y se ajusta estrictamente a la prescripción y a los requisitos establecidos en el capítulo VI, artículos 9, 10 y 11 de la resolución 214 de 2022.\n\nNo aplica.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaCeramicaEnciaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de prótesis fija / cerámica de encía" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración protésica sobre medida bucal elaborada en cerámica dental de grado médico, diseñada para reemplazar o simular el tejido gingival perdido alrededor de dientes naturales, implantes o prótesis. Su fabricación es personalizada de acuerdo con las características anatómicas, funcionales y estéticas de cada paciente, permitiendo recuperar la apariencia natural de la encía y mejorar la armonía de la sonrisa.",
        },
        {
          label: "Uso previsto",
          value: "Dispositivo destinado a restaurar o compensar pérdidas de tejido gingival ocasionadas por reabsorciones óseas, enfermedades periodontales, traumatismos, defectos anatómicos o tratamientos de rehabilitación oral. Su finalidad es mejorar la estética, el soporte de tejidos blandos y la integración visual de restauraciones dentales o implantosoportadas.",
        },
        {
          label: "Materiales Empleados",
          value: "Cerámica dental de grado médico (feldespática, prensada o estratificada según el caso clínico), pigmentos y maquillajes cerámicos biocompatibles para caracterización estética, materiales de glaseado y acabado superficial. Se debe registrar la marca comercial, referencia y número de lote de los materiales utilizados en la fabricación del dispositivo.",
        },
        {
          label: "Vida útil estimada",
          value: "Entre 10 y 15 años, dependiendo de las condiciones de uso, higiene oral, controles odontológicos periódicos, estabilidad de los tejidos orales y ausencia de traumatismos o hábitos que puedan comprometer la integridad del dispositivo. Durante este período pueden requerirse ajustes, mantenimiento o reacondicionamiento profesional para conservar sus características estéticas y funcionales.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al dispositivo: fractura o desprendimiento de la cerámica por traumatismos o fuerzas excesivas, irritación de los tejidos blandos por acumulación de placa bacteriana, molestias derivadas de una adaptación inadecuada, dificultad en la higiene oral si no se siguen las recomendaciones de limpieza y alteraciones estéticas por desgaste o cambios en los tejidos de soporte.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "No manipular ni realizar ajustes sobre el dispositivo sin supervisión profesional. Mantener una adecuada higiene oral para evitar inflamación de los tejidos circundantes. Evitar morder objetos duros o someter la restauración a fuerzas excesivas. En caso de fractura, desprendimiento, incomodidad persistente o inflamación, acudir inmediatamente al odontólogo. Contraindicado en pacientes con alergia conocida a alguno de los materiales utilizados en la restauración (casos excepcionales).",
        },
        {
          label: "Instrucciones de uso",
          value: "Mantener una higiene oral adecuada mediante cepillado y uso de elementos de higiene interdental recomendados por el odontólogo. Asistir periódicamente a controles clínicos para evaluar el estado de la restauración y de los tejidos de soporte. Evitar hábitos parafuncionales y el contacto con objetos que puedan ocasionar fracturas.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "La durabilidad y apariencia de la cerámica de encía dependen del mantenimiento adecuado, la higiene oral diaria y las revisiones periódicas realizadas por el profesional tratante.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaColadoUclaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de protesis fija / colado de ucla" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Dispositivo médico sobre medida bucal elaborado a partir de una base UCLA prefabricada para implantes dentales, diseñado para servir como estructura de soporte y conexión entre el implante osteointegrado y la restauración protésica definitiva. El componente es personalizado mediante técnicas de colado dental para obtener la anatomía, ajuste y funcionalidad requeridos según la prescripción del odontólogo tratante y las características clínicas del paciente.",
        },
        {
          label: "Uso previsto",
          value: "Proporcionar soporte, retención y estabilidad a restauraciones protésicas sobre implantes dentales, permitiendo la rehabilitación funcional y estética de dientes ausentes. Está indicado para la fabricación de coronas unitarias, puentes o estructuras implantosoportadas personalizadas.",
        },
        {
          label: "Materiales Empleados",
          value: "Base UCLA prefabricada compatible con el sistema de implante indicado por el odontólogo tratante. Aleación metálica de grado médico para colado (cromo-cobalto, metal noble u otra autorizada para uso odontológico), materiales de revestimiento, acabado y pulido biocompatibles. Debe registrarse la marca comercial, referencia y número de lote de todos los materiales utilizados en la fabricación del dispositivo.",
        },
        {
          label: "Vida útil estimada",
          value: "Entre 10 y 15 años o más, dependiendo de las condiciones clínicas del paciente, la estabilidad del implante, la higiene oral, el mantenimiento profesional periódico, la calidad de la rehabilitación protésica y la ausencia de sobrecargas funcionales o hábitos parafuncionales. Durante este período pueden requerirse ajustes, mantenimiento o reemplazo de componentes protésicos asociados.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al uso de la restauración: aflojamiento de tornillos protésicos, fractura o desgaste de componentes protésicos, inflamación de los tejidos blandos por deficiente higiene oral, acumulación de placa bacteriana alrededor del implante, molestias durante la masticación por sobrecarga oclusal y pérdida de estabilidad de la restauración por falta de mantenimiento profesional periódico.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "Mantener una adecuada higiene oral y asistir a los controles periódicos programados por el odontólogo. Evitar morder objetos duros o utilizar los dientes como herramienta. Informar al odontólogo ante cualquier sensación de movilidad, dolor, inflamación, sangrado o cambio en el ajuste de la restauración. No manipular ni intentar ajustar la prótesis por cuenta propia. Contraindicado en pacientes con alergia conocida a alguno de los materiales utilizados en la rehabilitación (casos excepcionales).",
        },
        {
          label: "Instrucciones de uso",
          value: "Realizar cepillado dental después de cada comida y utilizar los elementos de higiene recomendados por el odontólogo para la limpieza alrededor de implantes y prótesis. Asistir a controles periódicos para evaluación, mantenimiento y limpieza profesional de la restauración. Evitar hábitos parafuncionales como apretar o rechinar los dientes sin tratamiento adecuado.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Seguir las indicaciones de higiene y mantenimiento suministradas por el profesional tratante.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaCoronaDisilicatoEstratificadaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de protesis fija / corona en Disilicato de litio estratificada" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración protésica fija sobre medida bucal, elaborada con una estructura de disilicato de litio de grado médico recubierta mediante técnica de estratificación con cerámica feldespática para lograr una óptima caracterización estética. Diseñada para restaurar la anatomía, función masticatoria, fonética y estética de dientes naturales. Fabricada de forma individualizada según la prescripción del odontólogo tratante y las características clínicas del paciente.",
        },
        {
          label: "Uso previsto",
          value: "Restaurar dientes con pérdida parcial o total de estructura coronaria, devolviendo la función masticatoria, estabilidad oclusal, fonética y estética dental. Indicada para rehabilitaciones protésicas unitarias definitivas en dientes naturales que requieren una restauración de alta resistencia y excelente integración estética.",
        },
        {
          label: "Materiales Empleados",
          value: "Cerámica de disilicato de litio de grado médico como estructura base, cerámica feldespática de estratificación para caracterización estética, pigmentos y maquillajes cerámicos biocompatibles, materiales de glaseado y acabado superficial. Se debe registrar la marca comercial, referencia y número de lote de todos los materiales utilizados en la fabricación del dispositivo médico sobre medida bucal.",
        },
        {
          label: "Vida útil estimada",
          value: "Entre 10 y 15 años, dependiendo de las condiciones clínicas del paciente, la higiene oral, los controles odontológicos periódicos, la correcta función oclusal y el cumplimiento de las recomendaciones del odontólogo tratante. Durante este período pueden requerirse procedimientos de mantenimiento, ajuste o pulido para conservar sus características funcionales y estéticas.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al uso de la restauración incluyen fractura o desprendimiento de la corona debido a traumatismos o fuerzas masticatorias excesivas, sensibilidad dental, desgaste de la restauración o de los dientes antagonistas, acumulación de placa bacteriana por higiene inadecuada, inflamación de las encías y alteraciones funcionales o estéticas derivadas del uso prolongado o de hábitos parafuncionales como el bruxismo.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "Mantenga una adecuada higiene oral para preservar la salud del diente restaurado y de los tejidos circundantes. Evite morder objetos duros como hielo, huesos, lápices o utilizar los dientes para abrir envases. No manipule ni intente reparar la restauración por cuenta propia. Consulte inmediatamente a su odontólogo si presenta dolor, movilidad, fractura, desprendimiento, sensibilidad persistente o cualquier cambio en la restauración. Los pacientes con bruxismo deben utilizar los dispositivos de protección recomendados por el profesional tratante.",
        },
        {
          label: "Instrucciones de uso",
          value: "Cepille sus dientes después de cada comida utilizando un cepillo de cerdas suaves y crema dental de baja abrasividad. Utilice diariamente seda dental y siga las recomendaciones de higiene indicadas por su odontólogo. Asista a controles odontológicos periódicos para verificar el estado de la restauración.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Evite hábitos que puedan generar sobrecargas sobre la corona. Mantenga una adecuada higiene oral y realice limpiezas profesionales periódicas. En caso de fractura, desprendimiento o cualquier anomalía, solicite atención odontológica de manera oportuna.\nRevisiones periódicas recomendadas cada 6–12 meses.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaCoronaDisilicatoMonoliticaVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de protesis fija / Corona en Disilicato de litio monolitica" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración protésica fija sobre medida bucal, elaborada completamente en cerámica de Disilicato de litio de grado médico en una sola estructura (monolítica), diseñada para restaurar la anatomía, función masticatoria, fonética y estética de dientes naturales. Fabricada de forma personalizada de acuerdo con la prescripción del odontólogo tratante y las características anatómicas y funcionales del paciente, ofreciendo alta resistencia mecánica, biocompatibilidad y estabilidad estética.",
        },
        {
          label: "Uso previsto",
          value: "Restaurar dientes con pérdida parcial o total de estructura coronaria, devolviendo la función masticatoria, la estabilidad oclusal, la fonética y la estética dental. Indicada para rehabilitaciones protésicas unitarias definitivas en dientes naturales, tanto en el sector anterior como posterior, cuando se requiere una restauración de alta resistencia y excelente comportamiento estético.",
        },
        {
          label: "Materiales Empleados",
          value: "Cerámica de Disilicato de litio de grado médico como material principal de la restauración, pigmentos y maquillajes cerámicos biocompatibles para caracterización estética cuando sea necesario, materiales de glaseado y acabado superficial. Se debe registrar la marca comercial, referencia y número de lote de todos los materiales utilizados en la fabricación del dispositivo médico sobre medida bucal.",
        },
        {
          label: "Vida útil estimada",
          value: "Entre 10 y 15 años, dependiendo de las condiciones clínicas del paciente, la higiene oral, los controles odontológicos periódicos, la correcta función oclusal y el cumplimiento de las recomendaciones del odontólogo tratante. Durante este período pueden requerirse procedimientos de mantenimiento, ajuste o reacondicionamiento superficial para conservar sus propiedades funcionales y estéticas.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al uso de la restauración incluyen fractura o desprendimiento de la corona debido a traumatismos o fuerzas masticatorias excesivas, sensibilidad dental transitoria, desgaste de dientes antagonistas en caso de alteraciones oclusales, acumulación de placa bacteriana por higiene oral deficiente, inflamación de la encía y disminución de la vida útil de la restauración por hábitos parafuncionales como el bruxismo.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "Mantenga una adecuada higiene oral para preservar la salud del diente restaurado y los tejidos circundantes. Evite morder alimentos u objetos extremadamente duros, como hielo, huesos, semillas o utilizar los dientes para abrir envases. No intente ajustar, pulir o reparar la restauración por cuenta propia. Consulte a su odontólogo si presenta dolor, sensibilidad persistente, fractura, movilidad o desprendimiento de la corona. Los pacientes con bruxismo o apretamiento dental deben seguir las recomendaciones de protección indicadas por el profesional tratante.",
        },
        {
          label: "Instrucciones de uso",
          value: "Cepille sus dientes después de cada comida utilizando un cepillo de cerdas suaves y crema dental de baja abrasividad. Utilice diariamente seda dental o los elementos de higiene recomendados por su odontólogo. Mantenga hábitos adecuados de cuidado oral y asista a los controles periódicos programados.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Realice limpiezas profesionales periódicas según indicación odontológica. Evite hábitos que generen sobrecargas sobre la restauración. En caso de notar cambios en la mordida, molestias, fracturas o cualquier alteración de la corona, solicite valoración odontológica de manera inmediata.\nRevisiones periódicas recomendadas cada 6–12 meses.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
      ],
    },
  ]

  const crearFichaCoronaDisilicatoImplanteVacia = (): Seccion[] => [
    {
      titulo: "1. Información de Identificación y Trazabilidad",
      campos: [
        { label: "Nombre del paciente", value: "" },
        { label: "Prescriptor", value: "" },
        { label: "Clasificación de DMSMB", value: "Línea de protesis fija / corona en Disilicato de litio sobre implante" },
        { label: "Número de Serie o identificación del dispositivo", value: "" },
      ],
    },
    {
      titulo: "2. Identificación del producto",
      campos: [
        {
          label: "Descripción técnica del dispositivo médico",
          value: "Restauración protésica fija sobre medida bucal, elaborada completamente en cerámica de Disilicato de litio de grado médico en una sola estructura (monolítica), diseñada para restaurar la anatomía, función masticatoria, fonética y estética de dientes naturales. Fabricada de forma personalizada de acuerdo con la prescripción del odontólogo tratante y las características anatómicas y funcionales del paciente, ofreciendo alta resistencia mecánica, biocompatibilidad y estabilidad estética.",
        },
        {
          label: "Uso previsto",
          value: "Restaurar dientes con pérdida parcial o total de estructura coronaria, devolviendo la función masticatoria, la estabilidad oclusal, la fonética y la estética dental. Indicada para rehabilitaciones protésicas unitarias definitivas en dientes naturales, tanto en el sector anterior como posterior, cuando se requiere una restauración de alta resistencia y excelente comportamiento estético.",
        },
        {
          label: "Materiales Empleados",
          value: "Cerámica de Disilicato de litio de grado médico como material principal de la restauración, pigmentos y maquillajes cerámicos biocompatibles para caracterización estética cuando sea necesario, materiales de glaseado y acabado superficial. Se debe registrar la marca comercial, referencia y número de lote de todos los materiales utilizados en la fabricación del dispositivo médico sobre medida bucal.",
        },
        {
          label: "Vida útil estimada",
          value: "Entre 10 y 15 años, dependiendo de las condiciones clínicas del paciente, la higiene oral, los controles odontológicos periódicos, la correcta función oclusal y el cumplimiento de las recomendaciones del odontólogo tratante. Durante este período pueden requerirse procedimientos de mantenimiento, ajuste o reacondicionamiento superficial para conservar sus propiedades funcionales y estéticas.",
        },
      ],
    },
    {
      titulo: "3. Proceso de diseño y fabricación",
      campos: [
        { label: "Especificaciones de diseño", value: "Prescripción odontológica, Diseño personalizado mediante CAD/CAM o modelos de yeso basados en la anatomía del paciente" },
        {
          label: "Normas aplicadas",
          value: "Resolución 214 de 2022 “Por la cual se establecen los requisitos sanitarios que deben cumplir los dispositivos médicos sobre medida bucal”\n\nOtras normas técnicas nacionales o internacionales aplicadas para materias primas utilizadas, procesos de fabricación y control de calidad. Ejemplo:\nISO 10139-1 / ISO 10139-2: Materiales de revestimiento blando para prótesis.\nISO 10477: Materiales poliméricos para coronas y recubrimientos (prótesis fija).\nISO 10873: Adhesivos para prótesis dentales.\nISO 13017: Anclajes magnéticos para prótesis.\nISO 7405 y ISO 10993: Evaluación biológica de materiales dentales y médicos.\nISO 13116: Método de ensayo para determinar la radiopacidad de los materiales\nISO 10271: Métodos de ensayo de corrosión para materiales metálicos\nISO 12836: Dispositivos de digitalización para sistemas CAD/CAM para restauraciones dentales indirectas: métodos de ensayo para evaluar la precisión\nNTC-ISO 10993: Evaluación biológica de dispositivos médicos\nISO 15841: alambres para uso en ortodoncia",
        },
      ],
    },
    {
      titulo: "4. Requisitos de seguridad y funcionamiento",
      campos: [
        {
          label: "Análisis de riesgos",
          value: "Posibles riesgos asociados al uso de la restauración incluyen fractura o desprendimiento de la corona debido a traumatismos o fuerzas masticatorias excesivas, sensibilidad dental transitoria, desgaste de dientes antagonistas en caso de alteraciones oclusales, acumulación de placa bacteriana por higiene oral deficiente, inflamación de la encía y disminución de la vida útil de la restauración por hábitos parafuncionales como el bruxismo.",
        },
        {
          label: "Advertencias y contraindicaciones",
          value: "Mantenga una adecuada higiene oral para preservar la salud del diente restaurado y los tejidos circundantes. Evite morder alimentos u objetos extremadamente duros, como hielo, huesos, semillas o utilizar los dientes para abrir envases. No intente ajustar, pulir o reparar la restauración por cuenta propia. Consulte a su odontólogo si presenta dolor, sensibilidad persistente, fractura, movilidad o desprendimiento de la corona. Los pacientes con bruxismo o apretamiento dental deben seguir las recomendaciones de protección indicadas por el profesional tratante.",
        },
        {
          label: "Instrucciones de uso",
          value: "Cepille sus dientes después de cada comida utilizando un cepillo de cerdas suaves y crema dental de baja abrasividad. Utilice diariamente seda dental o los elementos de higiene recomendados por su odontólogo. Mantenga hábitos adecuados de cuidado oral y asista a los controles periódicos programados.",
        },
        {
          label: "Instrucciones de mantenimiento",
          value: "Realice limpiezas profesionales periódicas según indicación odontológica. Evite hábitos que generen sobrecargas sobre la restauración. En caso de notar cambios en la mordida, molestias, fracturas o cualquier alteración de la corona, solicite valoración odontológica de manera inmediata.\nRevisiones periódicas recomendadas cada 6–12 meses.",
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
        { label: "CARGO", value: "Director técnico" },
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
        { label: "NOMBRES Y APELLIDOS", value: "Jazmín Valencia" },
        { label: "CARGO", value: "Director técnico" },
        { label: "FIRMA", value: "/firma-jazmin.jpeg" },
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
    setNuevaFicha({ nombre: "", tipo: "Carilla de Disilicato Estratificada", fecha: new Date().toISOString().split("T")[0] })
    setShowModal(false)
  }

  const handleAbrirFicha = (tipo: string = "Carilla de Disilicato Estratificada") => {
    let ficha: Seccion[] = []
    if (tipo === "Carilla de Disilicato Monolitica") {
      ficha = crearFichaMonoliticaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Carilla de Disilicato Impresa en Resina") {
      ficha = crearFichaResinaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Ceramica de Encia") {
      ficha = crearFichaCeramicaEnciaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Colado de UCLA") {
      ficha = crearFichaColadoUclaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Corona Disilicato Estratificada") {
      ficha = crearFichaCoronaDisilicatoEstratificadaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Corona Disilicato Monolitica") {
      ficha = crearFichaCoronaDisilicatoMonoliticaVacia()
      setTipoFichaActual(tipo)
    } else if (tipo === "Corona Disilicato Sobre Implante") {
      ficha = crearFichaCoronaDisilicatoImplanteVacia()
      setTipoFichaActual(tipo)
    } else {
      ficha = crearFichaVacia()
      setTipoFichaActual(tipo)
    }
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

  const handleDownloadPdf = async () => {
    setDownloadingFicha(true)
    setEditingFicha(false)
    await new Promise((r) => setTimeout(r, 50))

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])

      const node = document.getElementById("documento")
      const headerEl = document.getElementById("doc-header")
      if (!node || !headerEl) {
        console.log("[PDF] No se encontraron los elementos del documento")
        alert("No se encontró el documento para generar el PDF.")
        setDownloadingFicha(false)
        setEditingFicha(true)
        return
      }

      const modalScroll = node.closest(".overflow-y-auto") as HTMLElement | null
      const parent = node.parentElement
      const previousOverflow = parent?.style.overflow || ""
      const previousMaxHeight = parent?.style.maxHeight || ""

      if (parent) {
        parent.style.overflow = "visible"
        parent.style.maxHeight = "none"
      }
      if (modalScroll) {
        modalScroll.scrollTop = 0
      }

      const replaceLabColors = (root: HTMLElement | Document) => {
        const walk = (el: HTMLElement | Element) => {
          if (el instanceof HTMLElement) {
            const computed = getComputedStyle(el)
            if ((computed.color || "").includes("lab")) el.style.color = "#000000"
            if ((computed.backgroundColor || "").includes("lab")) el.style.backgroundColor = "#ffffff"
            if ((computed.borderColor || "").includes("lab")) el.style.borderColor = "#d4d4d8"
          }
          for (const child of Array.from(el.children)) {
            walk(child)
          }
        }
        walk(root)
      }

      replaceLabColors(node)

      const shot = (el: HTMLElement) =>
        html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: true } as any)

      let headerRect = headerEl.getBoundingClientRect()
      const indicatorEl = document.getElementById("page-indicator")
      const indRect = indicatorEl?.getBoundingClientRect()
      const indicatorRel = indRect
        ? {
            left: (indRect.left - headerRect.left) / headerRect.width,
            top: (indRect.top - headerRect.top) / headerRect.height,
            height: indRect.height / headerRect.height,
          }
        : null

      const headerCanvas = await shot(headerEl)
      const logoEl = document.getElementById("doc-header-logo")
      let logoRect = null
      const logoDataUrl = logoEl ? await shot(logoEl).then(c => c.toDataURL("image/png")) : null
      if (logoEl && headerEl) {
        headerRect = headerEl.getBoundingClientRect()
        logoRect = logoEl.getBoundingClientRect()
        logoEl.style.display = "none"
      }
      const headerCanvasNoLogo = await shot(headerEl)
      headerEl.style.display = "none"
      const fullCanvas = await shot(node)

      const pdf = new jsPDF({ unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const marginX = 40
      const marginTop = 28
      const marginBottom = 28
      const gap = 8
      const contentWidth = pageWidth - marginX * 2
      const pageBottom = pageHeight - marginBottom

      const ptHeight = (c: HTMLCanvasElement) => (c.height * contentWidth) / c.width
      const headerHpt = ptHeight(headerCanvasNoLogo)
      const headerData = headerCanvasNoLogo.toDataURL("image/png")

      const scaleX = headerRect ? contentWidth / headerRect.width : 0
      const scaleY = headerRect ? headerHpt / headerRect.height : 0

      const topOfContent = () => marginTop + headerHpt + gap * 2
      const contentHeightPt = ptHeight(fullCanvas)
      const contentTop = marginTop + headerHpt + gap * 2
      const availableContentHeight = pageHeight - marginBottom - contentTop

      const pxPerPt = fullCanvas.width / contentWidth

      const totalPages = Math.max(1, Math.ceil((contentHeightPt + gap) / (availableContentHeight + gap)))

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        pdf.addImage(headerData, "PNG", marginX, marginTop, contentWidth, headerHpt)

        if (logoDataUrl && logoRect && headerRect) {
          const logoH = 14
          const aspect = logoRect.width / logoRect.height
          const logoW = logoH * aspect
          const logoX = marginX + (logoRect.left - headerRect.left) / headerRect.width * contentWidth
          const logoY = marginTop + (logoRect.top - headerRect.top) / headerRect.height * headerHpt
          if (logoW > 0 && logoH > 0 && logoX >= marginX && logoY >= marginTop) {
            try {
              pdf.addImage(logoDataUrl, "PNG", logoX, logoY, logoW, logoH)
            } catch {}
          }
        }

        const startY = i * availableContentHeight
        const sliceH = Math.min(availableContentHeight, contentHeightPt - startY)
        if (sliceH <= 0) continue

        const tmp = document.createElement("canvas")
        tmp.width = fullCanvas.width
        tmp.height = Math.max(1, Math.round(sliceH * pxPerPt))
        const ctx = tmp.getContext("2d")
        if (!ctx) continue
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, tmp.width, tmp.height)
        ctx.drawImage(fullCanvas, 0, Math.round(startY * pxPerPt), fullCanvas.width, tmp.height, 0, 0, fullCanvas.width, tmp.height)

        pdf.addImage(tmp.toDataURL("image/png"), "PNG", marginX, contentTop, contentWidth, sliceH)
      }

      if (indicatorRel) {
        const x = marginX + indicatorRel.left * contentWidth
        const yTop = marginTop + indicatorRel.top * headerHpt
        const boxH = indicatorRel.height * headerHpt
        const fontSize = Math.max(7, Math.min(9, boxH * 0.7))
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i)
          pdf.setFillColor(255, 255, 255)
          pdf.rect(x, yTop, contentWidth * 0.3, boxH, "F")
          pdf.setFontSize(fontSize)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`Pagina ${i} de ${totalPages}`, x + 2, yTop + boxH * 0.75)
        }
      }

      pdf.save("carilla-en-disilicato-estratificada.pdf")
      console.log("[PDF] Descarga completada")
    } catch (err) {
      const message = (err as Error)?.message || String(err)
      console.log("[PDF] Error generando PDF:", message)
      alert("Error generando el PDF: " + message)
    } finally {
      const parent = document.getElementById("documento")?.parentElement
      if (parent) {
        parent.style.overflow = ""
        parent.style.maxHeight = ""
      }
      const headerElFinally = document.getElementById("doc-header")
      if (headerElFinally) {
        headerElFinally.style.display = ""
      }
      const logoElFinally = document.getElementById("doc-header-logo")
      if (logoElFinally) {
        logoElFinally.style.display = ""
      }
      setDownloadingFicha(false)
      setEditingFicha(true)
    }
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
        onClick={() => handleAbrirFicha("Carilla de Disilicato Estratificada")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Carilla de Disilicato Estratificada
              </p>
              <p className="text-lg font-semibold text-foreground">
                Carilla de Disilicato Estratificada
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Carilla de Disilicato Monolitica")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Carilla de Disilicato Monolítica
              </p>
              <p className="text-lg font-semibold text-foreground">
                Carilla de Disilicato Monolítica
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Carilla de Disilicato Impresa en Resina")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Carilla de Disilicato Impresa en Resina
              </p>
              <p className="text-lg font-semibold text-foreground">
                Carilla de Disilicato Impresa en Resina
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Ceramica de Encia")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Cerámica de Encía
              </p>
              <p className="text-lg font-semibold text-foreground">
                Cerámica de Encía
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Colado de UCLA")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Colado de UCLA
              </p>
              <p className="text-lg font-semibold text-foreground">
                Colado de UCLA
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Corona Disilicato Estratificada")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Corona en Disilicato de litio estratificada
              </p>
              <p className="text-lg font-semibold text-foreground">
                Corona en Disilicato de litio estratificada
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Corona Disilicato Monolitica")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Corona en Disilicato de litio monolítica
              </p>
              <p className="text-lg font-semibold text-foreground">
                Corona en Disilicato de litio monolítica
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
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => handleAbrirFicha("Corona Disilicato Sobre Implante")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ficha rápida de Corona en Disilicato de litio sobre implante
              </p>
              <p className="text-lg font-semibold text-foreground">
                Corona en Disilicato de litio sobre implante
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
                  <option value="Carilla de Disilicato Estratificada">
                    Carilla de Disilicato Estratificada
                  </option>
                  <option value="Carilla de Disilicato Monolitica">
                    Carilla de Disilicato Monolítica
                  </option>
                  <option value="Carilla de Disilicato Impresa en Resina">
                    Carilla de Disilicato Impresa en Resina
                  </option>
                  <option value="Ceramica de Encia">
                    Cerámica de Encía
                  </option>
                  <option value="Colado de UCLA">
                    Colado de UCLA
                  </option>
                  <option value="Corona Disilicato Estratificada">
                    Corona en Disilicato de litio estratificada
                  </option>
                  <option value="Corona Disilicato Monolitica">
                    Corona en Disilicato de litio monolítica
                  </option>
                  <option value="Corona Disilicato Sobre Implante">
                    Corona en Disilicato de litio sobre implante
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
          <div className="rounded-xl bg-card shadow-xl w-full max-w-[850px] my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {tipoFichaActual === "Carilla de Disilicato Monolitica" ? "Carilla de Disilicato Monolítica" : tipoFichaActual === "Carilla de Disilicato Impresa en Resina" ? "Carilla de Disilicato Impresa en Resina" : tipoFichaActual === "Ceramica de Encia" ? "Cerámica de Encía" : tipoFichaActual === "Colado de UCLA" ? "Colado de UCLA" : tipoFichaActual === "Corona Disilicato Estratificada" ? "Corona en Disilicato de litio estratificada" : tipoFichaActual === "Corona Disilicato Monolitica" ? "Corona en Disilicato de litio monolítica" : tipoFichaActual === "Corona Disilicato Sobre Implante" ? "Corona en Disilicato de litio sobre implante" : "Carilla de Disilicato Estratificada"}
              </h3>
              <button
                onClick={() => setShowFichaModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-neutral-200">
              {tipoFichaActual === "Carilla de Disilicato Monolitica" ? (
                <FichaTecnicaMonolitica
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Carilla de Disilicato Impresa en Resina" ? (
                <FichaTecnicaResina
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Ceramica de Encia" ? (
                <FichaTecnicaCeramicaEncia
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Colado de UCLA" ? (
                <FichaTecnicaColadoUcla
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Corona Disilicato Estratificada" ? (
                <FichaTecnicaCoronaDisilicatoEstratificada
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Corona Disilicato Monolitica" ? (
                <FichaTecnicaCoronaDisilicatoMonolitica
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : tipoFichaActual === "Corona Disilicato Sobre Implante" ? (
                <FichaTecnicaCoronaDisilicatoImplante
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              ) : (
                <FichaTecnicaDisilicato
                  secciones={fichaActual}
                  onCampoChange={handleCampoChange}
                  editing={editingFicha}
                  onToggleEditing={() => setEditingFicha((e) => !e)}
                  onDownload={handleDownloadPdf}
                  downloading={downloadingFicha}
                  showToolbar={true}
                />
              )}
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