"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Plus, Search, UserPlus } from "lucide-react"
import { PrescriptionForm } from "@/app/formulario/components/prescription-form"
import { supabase } from "@/lib/supabase"

interface Cliente {
  id: number
  nombre: string
  correo: string | null
  telefono: string | null
  clinica: string | null
  documento: string | null
}

const TIPOS_DOCUMENTO = [
  { value: "cc", label: "Cédula de Ciudadanía" },
  { value: "ce", label: "Cédula de Extranjería" },
  { value: "nit", label: "NIT" },
  { value: "pasaporte", label: "Pasaporte" },
]

/**
 * Alta de solicitudes por parte del personal interno.
 *
 * Admin y empleado comparten este flujo: se busca al cliente (o se registra en
 * el momento) y luego se diligencia la prescripción a su nombre. Lo único que
 * cambia entre ambos es el destino y la clave del borrador, así que ambos
 * wrappers pasan esos dos valores en vez de duplicar la pantalla.
 */
export function NuevaSolicitudDesdeCliente({
  modo,
  volverA,
  redireccionExitosa,
}: {
  modo: "empleado" | "admin"
  volverA: string
  redireccionExitosa: string
}) {
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargandoClientes, setCargandoClientes] = useState(true)
  const [errorClientes, setErrorClientes] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [seleccion, setSeleccion] = useState<Cliente | null>(null)

  const [mostrandoFormularioNuevo, setMostrandoFormularioNuevo] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/clientes")
        if (!res.ok) throw new Error("No se pudieron cargar los clientes.")
        const result = await res.json()
        setClientes(result.data || [])
      } catch (err) {
        setErrorClientes(err instanceof Error ? err.message : "Error al cargar los clientes.")
      } finally {
        setCargandoClientes(false)
      }
    }
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    if (!term) return clientes.slice(0, 25)
    return clientes
      .filter((c) =>
        [c.nombre, c.correo, c.clinica, c.documento]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term))
      )
      .slice(0, 25)
  }, [clientes, busqueda])

  if (!seleccion) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push(volverA)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-foreground">Nueva solicitud</h1>
          <p className="mt-1 text-muted-foreground">
            Selecciona el cliente (odontólogo) al que corresponde la solicitud.
          </p>
        </div>

        {errorClientes && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{errorClientes}</span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="relative mb-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, documento, clínica o correo..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {cargandoClientes ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
              Cargando clientes...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {busqueda
                  ? "No hay clientes que coincidan con la búsqueda."
                  : "Todavía no hay clientes registrados."}
              </p>
            </div>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-y-auto">
              {filtrados.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccion(c)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 text-left transition-all hover:border-blue-500 hover:bg-blue-500/5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {c.nombre}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[c.clinica, c.documento].filter(Boolean).join(" · ") || "Sin datos"}
                      </span>
                    </span>
                    <Plus size={16} className="shrink-0 text-blue-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!mostrandoFormularioNuevo && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                ¿El odontólogo aún no está registrado?
              </p>
              <button
                type="button"
                onClick={() => setMostrandoFormularioNuevo(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-500/20"
              >
                <UserPlus size={16} />
                Registrar cliente nuevo
              </button>
            </div>
          )}
        </div>

        {mostrandoFormularioNuevo && (
          <FormularioNuevoCliente
            onCancel={() => setMostrandoFormularioNuevo(false)}
            onCreado={(nuevo) => setSeleccion(nuevo)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => setSeleccion(null)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Cambiar de cliente
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Nueva solicitud</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
            <CheckCircle2 size={14} />
            {seleccion.nombre}
            {seleccion.clinica ? ` · ${seleccion.clinica}` : ""}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground">
          La solicitud quedará asociada a este cliente.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <PrescriptionForm
          cliente={{
            id: seleccion.id,
            nombre: seleccion.nombre,
            correo: seleccion.correo,
            telefono: seleccion.telefono,
          }}
          modo={modo}
          redireccionExitosa={redireccionExitosa}
        />
      </div>
    </div>
  )
}

function FormularioNuevoCliente({
  onCancel,
  onCreado,
}: {
  onCancel: () => void
  onCreado: (cliente: Cliente) => void
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    tipodoc: "cc",
    documento: "",
    correo: "",
    telefono: "",
    clinica: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError("Tu sesión expiró. Vuelve a iniciar sesión.")
        return
      }

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "No fue posible crear el cliente.")
        return
      }

      onCreado(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el cliente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Registrar cliente nuevo
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="nombre"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Nombre completo *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre del odontólogo"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div>
          <label
            htmlFor="tipodoc"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Tipo de documento
          </label>
          <select
            id="tipodoc"
            name="tipodoc"
            value={formData.tipodoc}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="documento"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Número de documento *
          </label>
          <input
            type="text"
            id="documento"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            placeholder="Número de documento"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div>
          <label
            htmlFor="correo"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="correo@clinica.com"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="telefono"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="clinica"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Clínica
          </label>
          <input
            type="text"
            id="clinica"
            name="clinica"
            value={formData.clinica}
            onChange={handleChange}
            placeholder="Nombre de la clínica"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 ${
            loading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Crear cliente y continuar
            </>
          )}
        </button>
      </div>
    </form>
  )
}