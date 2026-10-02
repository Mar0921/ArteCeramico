export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function parseDate(value: string | null): Date | null {
  if (!value) return null
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

export function getDaysHastaEntrega(value: string | null): number | null {
  const deliveryDate = parseDate(value)
  if (!deliveryDate) return null
  const today = startOfDay(new Date())
  return Math.round((deliveryDate.getTime() - today.getTime()) / 86400000)
}

export function formatDate(value: string | null) {
  const date = parseDate(value)
  if (!date) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}
