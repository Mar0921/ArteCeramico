/**
 * Reconstrucción del detalle de dientes working por solicitud.
 *
 * El desglose por diente vive hoy en dos sitios con formatos distintos:
 *
 * - `solicitudes.dientes_trabajados`: arreglo de cadenas con el formato
 *   "numero-servicio-estado" (por ejemplo "11-Provisional PMMA-normal"), que
 *   es lo que escribe el formulario de prescripción.
 * - `dientes`: una fila por diente con numero/servicio/estado ya separados.
 *
 * El tipo de trabajo de cada diente no está en ninguno de los dos: se deduce
 * de `servicios`, donde cada fila indica qué dientes cubre y qué tipo de
 * trabajo los aplica. Este módulo cruza las tres fuentes para que el detalle
 * muestre siempre diente, tipo de trabajo y estado.
 */

const ESTADOS_DIENTE = new Set(["normal", "ausencia", "implante", "pilar"])

export type ServicioFila = {
  nombre?: string | null
  descripcion?: string | null
  tipo_trabajo?: string | null
  material?: string | null
  dientes?: string | null
}

export type DienteToken = {
  numero: number
  servicio: string
  estado: string
}

export type DienteDetalle = DienteToken & {
  tipoTrabajo: string
  material: string
}

/** Interpreta un token "numero-servicio-estado" de `dientes_trabajados`. */
export function parseDienteToken(valor: string): DienteToken | null {
  const partes = String(valor ?? "")
    .trim()
    .split("-")

  if (partes.length === 0) return null

  const numero = Number(partes[0].trim())
  if (Number.isNaN(numero)) return null

  if (partes.length === 1) {
    return { numero, servicio: "", estado: "normal" }
  }

  // El estado siempre es la última parte cuando es un valor conocido; así el
  // servicio, que puede contener guiones, no se trunca.
  const ultimo = partes[partes.length - 1].trim().toLowerCase()
  const tieneEstado = ESTADOS_DIENTE.has(ultimo)

  return {
    numero,
    servicio: partes.slice(1, tieneEstado ? -1 : undefined).join("-").trim(),
    estado: tieneEstado ? ultimo : "normal",
  }
}

/**
 * Extrae los números de diente de una columna de `servicios`.
 * Acepta "11", "11,12" y "TRAZABILIDAD-11" (formato de las fichas técnicas).
 */
export function parseDientesServicio(valor: string | null | undefined): number[] {
  if (!valor) return []

  return String(valor)
    .split(",")
    .map((v) => Number(v.trim().split("-")[0]))
    .filter((n) => !Number.isNaN(n))
}

/**
 * Cruza tokens, filas de la tabla `dientes` y servicios para devolver un
 * registro por diente con su tipo de trabajo y estado.
 */
export function construirDetalleDientes(params: {
  tokens?: string[] | null
  filasDientes?: { numero: number; servicio?: string | null; estado?: string | null }[] | null
  servicios?: ServicioFila[] | null
}): DienteDetalle[] {
  const { tokens, filasDientes, servicios } = params

  const porNumero = new Map<number, DienteToken & { tipoTrabajo: string[]; material: string[] }>()

  const obtener = (numero: number) => {
    let registro = porNumero.get(numero)
    if (!registro) {
      registro = { numero, servicio: "", estado: "normal", tipoTrabajo: [], material: [] }
      porNumero.set(numero, registro)
    }
    return registro
  }

  const agregarValor = (lista: string[], valor: string | null | undefined) => {
    const limpio = String(valor ?? "").trim()
    if (limpio && !lista.includes(limpio)) lista.push(limpio)
  }

  // 1) Tokens del formulario: contienen el servicio y el estado original.
  for (const token of tokens || []) {
    const parseado = parseDienteToken(token)
    if (!parseado) continue
    const registro = obtener(parseado.numero)
    registro.servicio = registro.servicio || parseado.servicio
    registro.estado = parseado.estado
  }

  // 2) Tabla `dientes`: es la fuente más precisa, pisa al token.
  for (const fila of filasDientes || []) {
    const numero = Number(fila.numero)
    if (Number.isNaN(numero)) continue
    const registro = obtener(numero)
    registro.estado = String(fila.estado || registro.estado || "normal").trim() || "normal"
    registro.servicio = String(fila.servicio || registro.servicio || "").trim()
  }

  // 3) Servicios: aporta el tipo de trabajo y el material de cada diente.
  for (const servicio of servicios || []) {
    const numeros = parseDientesServicio(servicio.dientes)
    if (numeros.length === 0) continue

    for (const numero of numeros) {
      const registro = obtener(numero)
      agregarValor(registro.tipoTrabajo, servicio.tipo_trabajo)
      agregarValor(registro.material, servicio.material)
      registro.servicio = registro.servicio || String(servicio.nombre || "").trim()
    }
  }

  return [...porNumero.values()]
    .sort((a, b) => a.numero - b.numero)
    .map((d) => ({
      numero: d.numero,
      servicio: d.servicio,
      estado: d.estado,
      tipoTrabajo: d.tipoTrabajo.join(", "),
      material: d.material.join(", "),
    }))
}