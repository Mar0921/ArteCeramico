/**
 * Fases de fabricación de una solicitud (`solicitudes.orden_fases`).
 *
 * La columna es TEXT con un JSON que edita el administrador al aceptar el
 * pedido. El empleado solo avanza el estado de cada fase, así que aquí se
 * concentran las reglas que ambos lados deben respetar:
 *
 * - La guía la arma el administrador. El empleado no la puede borrar ni
 *   quitar fases.
 * - Una fase marcada como completada no vuelve a pendiente: se conserva con su
 *   fecha de terminación y su responsable aunque el empleado reenvíe el arreglo
 *   completo de fases.
 */

export interface FaseProceso {
  tipo: string
  estado: string
  realizada_por: string
  fecha_finalizacion: string
  fecha_prueba: string
  /** Campos que envía el formulario del cliente y el admin no usa aquí. */
  descripcion?: string
}

export const ESTADOS_FASE = ["pendiente", "en_proceso", "completado"] as const

/**
 * Catálogo de fases del proceso de laboratorio.
 *
 * El texto va tal cual aparece en las solicitudes ya guardadas, includedo el
 * typo histórico de "LIBERADO Y PULIDO DE META externalizadoL": corregirlo
 * aquí dejaría esas solicitudes sin fase reconocible.
 */
export const FASES_PROCESO = [
  "LIMPIEZA Y DESINFECCION DE ENTRADA",
  "VACEADO Y PREPARACION MODELOS",
  "PLATO BASE Y RODETE",
  "ESCANEO Y DISEÑO",
  "DISEÑO DE MODELO 3D",
  "LIBERADO Y PULIDO DE META externalizadoL",
  "CONTROL DE CALIDAD DE PROCESO 1",
  "IMPRESION RESINA",
  "FRESADO ZR-DSL-PMMA",
  "FRESADO CERA",
  "ENCERADO MANUAL",
  "SINTERIZADO",
  "IMPRESION 3D",
  "DISEÑO DE BARRA",
  "ENFILADO",
  "CONTROL CALIDAD DE PROCESO 2",
  "PULIDO DE METAL Y RESINAS",
  "MICROFRESADO",
  "FRESADO MONTURA",
  "REVESTIR + DESENCERAR + INYECTAR",
  "LIBERADO Y PULIDO LIBRE DE METAL",
  "MAQUILLAJE Y CERAMICA",
  "CONTROL DE CALIDAD LIBERACION",
  "LIMPIEZA Y DESINFECCION DE DISPOSITIVO TERMINADO",
]

export function normalizarFase(fase: Partial<FaseProceso> | null | undefined): FaseProceso {
  const estado = String(fase?.estado || "pendiente")
  return {
    tipo: String(fase?.tipo || ""),
    estado: ESTADOS_FASE.includes(estado as (typeof ESTADOS_FASE)[number])
      ? estado
      : "pendiente",
    realizada_por: String(fase?.realizada_por || ""),
    fecha_finalizacion: String(fase?.fecha_finalizacion || ""),
    fecha_prueba: String(fase?.fecha_prueba || ""),
    ...(fase?.descripcion ? { descripcion: String(fase.descripcion) } : {}),
  }
}

export function parseFases(value: unknown): FaseProceso[] {
  if (!value) return []
  let datos: unknown = value
  if (typeof value === "string") {
    try {
      datos = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(datos)) return []
  return datos.map((fase) => normalizarFase(fase as Partial<FaseProceso>))
}

export function esCompletada(fase: Partial<FaseProceso> | null | undefined): boolean {
  return String(fase?.estado || "") === "completado"
}

/** Fecha local en formato YYYY-MM-DD, sin desfase por zona horaria. */
export function hoyISO(): string {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, "0")
  const dia = String(ahora.getDate()).padStart(2, "0")
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

/**
 * Fase que la solicitud tiene en curso: la que está en proceso o, si ninguna,
 * la primera pendiente. Se usa para el campo `solicitudes.fase`.
 */
export function faseEnCurso(fases: FaseProceso[]): string | null {
  const enProceso = fases.find((fase) => fase.estado === "en_proceso")
  if (enProceso?.tipo) return enProceso.tipo
  const pendiente = fases.find((fase) => fase.estado === "pendiente")
  return pendiente?.tipo || null
}

/**
 * Combina las fases que envía el empleado con las que ya están guardadas.
 *
 * Una fase que estaba completada se mantiene completada y conserva su fecha de
 * terminación y responsable; solo se acepta que se actualicen esos datos si el
 * empleado los manda explícitamente. Las fases nuevas que agrega el empleado se
 * respetan tal como llegan.
 *
 * El cruce entre lo guardado y lo recibido se hace primero por posición (el
 * caso normal: editar campos o agregar al final) y luego por nombre, de modo
 * que una fase completada no se proteja por error si hay dos del mismo tipo.
 */
export function preservarFasesTerminadas(
  actuales: FaseProceso[],
  entrantes: FaseProceso[]
): FaseProceso[] {
  const protegidaPorIndice = new Map<number, FaseProceso>()
  const yaEmparejadas = new Set<number>()

  const comunes = Math.min(actuales.length, entrantes.length)
  for (let i = 0; i < comunes; i++) {
    const previa = actuales[i]
    const nueva = entrantes[i]
    if (!esCompletada(previa)) continue
    if (!previa.tipo || !nueva.tipo || previa.tipo === nueva.tipo) {
      protegidaPorIndice.set(i, previa)
      yaEmparejadas.add(i)
    }
  }

  for (let i = 0; i < entrantes.length; i++) {
    if (protegidaPorIndice.has(i)) continue
    const tipo = entrantes[i].tipo
    if (!tipo) continue
    const indicePrevio = actuales.findIndex(
      (previa, j) => esCompletada(previa) && previa.tipo === tipo && !yaEmparejadas.has(j)
    )
    if (indicePrevio === -1) continue
    protegidaPorIndice.set(i, actuales[indicePrevio])
    yaEmparejadas.add(indicePrevio)
  }

  return entrantes.map((fase, i) => {
    const nueva = normalizarFase(fase)
    const previa = protegidaPorIndice.get(i)
    if (!previa) return nueva

    return {
      ...nueva,
      estado: "completado",
      fecha_finalizacion: nueva.fecha_finalizacion || previa.fecha_finalizacion,
      realizada_por: nueva.realizada_por || previa.realizada_por,
      fecha_prueba: nueva.fecha_prueba || previa.fecha_prueba,
    }
  })
}

/**
 * Indica si al aplicar `resultado` se perdió alguna fase que ya estaba
 * terminada. El empleado puede agregar y editar fases, pero no borrar el
 * trabajo que ya quedó registrado.
 */
export function pierdeFasesTerminadas(
  actuales: FaseProceso[],
  resultado: FaseProceso[]
): FaseProceso[] {
  const disponibles = resultado.filter(esCompletada)
  const copiadas = [...disponibles]

  return actuales.filter(esCompletada).filter((previa) => {
    const indice = copiadas.findIndex(
      (fase) =>
        fase.estado === "completado" &&
        fase.tipo === previa.tipo &&
        (previa.fecha_finalizacion === "" ||
          fase.fecha_finalizacion === previa.fecha_finalizacion)
    )
    if (indice === -1) return true
    copiadas.splice(indice, 1)
    return false
  })
}