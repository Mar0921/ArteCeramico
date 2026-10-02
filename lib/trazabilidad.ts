/**
 * Generador del código de trazabilidad de las prescripciones.
 * Formato: AAAAMMDDHHmmss (por ejemplo 20260929143012).
 *
 * Vive fuera de los componentes de cliente para que la misma lógica se aplique
 * en el formulario y en las rutas de API, garantizando que el Nº de
 * prescripción que se ve en pantalla sea el que queda guardado en la base de
 * datos.
 */
export function generateCodigoTrazabilidad(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}
