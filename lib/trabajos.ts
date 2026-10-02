/**
 * Orden de las tablas de trabajos (admin y empleado).
 *
 * Lo que va primero es lo que se entrega antes: así la fecha de entrega más
 * cercana queda arriba y la más lejana al final. Los trabajos completados
 * mantienen su posición al final, que es como se venían mostrando.
 */

type TrabajoOrdenable = {
  estado?: string | null
  fecha_entrega?: string | null
}

/** Estados con los que un trabajo se da por cerrado. */
const ESTADOS_FINALIZADOS = ["completado", "finalizado"]

export function esFinalizada(estado?: string | null): boolean {
  return ESTADOS_FINALIZADOS.includes(estado || "")
}

export function esCancelada(estado?: string | null): boolean {
  return estado === "cancelado"
}

/**
 * Las solicitudes canceladas no se listan: se consultan en el historial del
 * cliente, pero no son un trabajo pendiente de laboratorio.
 */
export function trabajosVisibles<T extends TrabajoOrdenable>(trabajos: T[]): T[] {
  return trabajos.filter((trabajo) => !esCancelada(trabajo.estado))
}

function instanteEntrega(fecha: string | null | undefined): number {
  if (!fecha) return Number.POSITIVE_INFINITY
  // Se fija a mediodía para que la zona horaria no corree el día.
  const ms = new Date(`${fecha}T12:00:00`).getTime()
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms
}

export function ordenarTrabajos<T extends TrabajoOrdenable>(trabajos: T[]): T[] {
  return [...trabajos].sort((a, b) => {
    const aFinalizada = esFinalizada(a.estado)
    const bFinalizada = esFinalizada(b.estado)
    if (aFinalizada && !bFinalizada) return 1
    if (!aFinalizada && bFinalizada) return -1

    return instanteEntrega(a.fecha_entrega) - instanteEntrega(b.fecha_entrega)
  })
}