"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, X, Save, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MaterialOrden {
  material: string
  producto: string
  lote: string
  fabricante: string
  proveedor: string
}

interface Observacion {
  fecha: string
  texto: string
}

interface MaterialDisponible {
  codigo: string
  nombre: string
  producto: string | null
  fabricante: string | null
  proveedor: string | null
}

export default function AdminSolicitudPage() {
  const { id } = useParams()
  const solicitudId = Number(id)
  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [materialesOrden, setMaterialesOrden] = useState<MaterialOrden[]>([])
  const [materialesDisponibles, setMaterialesDisponibles] = useState<
    MaterialDisponible[]
  >([])
  const [savingMateriales, setSavingMateriales] = useState(false)
  const [observacionesOrden, setObservacionesOrden] = useState<Observacion[]>([])
  const [nuevaObservacion, setNuevaObservacion] = useState("")
  const [savingObservacion, setSavingObservacion] = useState(false)

  const cargarMaterialesDisponibles = async () => {
    const { data, error } = await supabase
      .from("materiales")
      .select("codigo, nombre, producto, marca_fabricante, proveedor, numero_lote")
      .order("nombre", { ascending: true })

    if (error) {
      console.error("Error cargando materiales disponibles:", error.message)
      return
    }

    setMaterialesDisponibles(
      (data ?? []).map((m) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        producto: m.producto ?? null,
        fabricante: m.marca_fabricante ?? null,
        proveedor: m.proveedor ?? null,
        numero_lote: m.numero_lote ?? null,
      }))
    )
  }

  const loadSolicitud = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw Error(body?.details || body?.message || "No se pudo cargar la solicitud.")
      }
      const result = await res.json()
      setData(result.data)

      if (result.data?.solicitud?.orden_materiales) {
        try {
          const materiales = JSON.parse(result.data.solicitud.orden_materiales)
          setMaterialesOrden(Array.isArray(materiales) ? materiales : [])
        } catch {
          setMaterialesOrden([])
        }
      } else {
        setMaterialesOrden([])
      }

      if (result.data?.solicitud?.observaciones_orden) {
        try {
          const obs = JSON.parse(result.data.solicitud.observaciones_orden)
          if (Array.isArray(obs)) {
            setObservacionesOrden(obs)
          } else if (typeof obs === "string") {
            setObservacionesOrden([{ fecha: "", texto: obs }])
          } else {
            setObservacionesOrden([])
          }
        } catch {
          const raw = result.data.solicitud.observaciones_orden
          if (typeof raw === "string" && raw.trim()) {
            setObservacionesOrden([{ fecha: "", texto: raw }])
          } else {
            setObservacionesOrden([])
          }
        }
      } else {
        setObservacionesOrden([])
      }

      await cargarMaterialesDisponibles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isNaN(solicitudId)) {
      setError("ID de solicitud inválido.")
      setLoading(false)
      return
    }
    loadSolicitud()
  }, [solicitudId])

  const guardarMateriales = async (materiales: MaterialOrden[]) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.")
      return false
    }

    const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ orden_materiales: JSON.stringify(materiales) }),
    })

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}))
      throw Error(cuerpo.message || "No se pudieron guardar los materiales.")
    }

    await loadSolicitud()
    return true
  }

  const guardarObservacion = async (texto: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión.")
      return false
    }

    const fechaHoy = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    const nuevaObs: Observacion = { fecha: fechaHoy, texto }

    const res = await fetch(`/api/empleados/solicitudes/${solicitudId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ observaciones_orden: [nuevaObs] }),
    })

    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}))
      throw Error(cuerpo.message || "No se pudo guardar la observación.")
    }

    await loadSolicitud()
    return true
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-medium text-destructive">{error}</h2>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    )
  }

  const solicitud = data?.solicitud

  return (
    <div className="space-y-6 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orden de Fabricación</h1>
          <p className="text-muted-foreground">
            Solicitud #{solicitud?.id} - {solicitud?.cliente?.nombre || "Cliente"}
          </p>
        </div>
        <Button onClick={() => router.back()}>
          <CalendarDays size={16} />
          Volver
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Materiales de la Orden</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border">
            <thead className="bg-muted">
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Material</th>
                <th className="px-3 py-2 font-medium">Producto</th>
                <th className="px-3 py-2 font-medium">Número de lote</th>
                <th className="px-3 py-2 font-medium">Fabricante</th>
                <th className="px-3 py-2 font-medium">Proveedor</th>
                <th className="px-3 py-2 font-medium text-center w-16">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materialesOrden.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                    Sin materiales registrados
                  </td>
                </tr>
              ) : (
                materialesOrden.map((mat, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                     <td className="px-3 py-2">
                       {mat.material ? (
                         <Input
                           type="text"
                           value={mat.material}
                           readOnly
                           className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                         />
                       ) : (
                       <select
                         value={mat.material}
                        onChange={(e) => {
                          const value = e.target.value
                          const seleccionado =
                            materialesDisponibles.find((m) => m.nombre === value) ?? null
                          setMaterialesOrden((prev) =>
                            prev.map((m, i) => {
                              if (i !== idx) return m
                              return {
                                ...m,
                                material: value,
                                producto: seleccionado?.producto ?? m.producto ?? "",
                                lote: seleccionado?.numero_lote ?? m.lote ?? "",
                                fabricante: seleccionado?.marca_fabricante ?? seleccionado?.fabricante ?? m.fabricante ?? "",
                                proveedor: seleccionado?.proveedor ?? m.proveedor ?? "",
                              }
                            })
                          )
                        }}
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Seleccionar material</option>
                        {materialesDisponibles.map((m) => (
                          <option key={m.codigo} value={m.nombre}>
                            {m.codigo} - {m.nombre}
                          </option>
                        ))}
                       </select>
                       )
                       }
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={mat.producto}
                        readOnly
                        className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                        placeholder="Producto"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={mat.lote}
                        readOnly
                        className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                        placeholder="N° Lote"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={mat.fabricante}
                        readOnly
                        className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                        placeholder="Fabricante"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={mat.proveedor}
                        readOnly
                        className="w-full rounded-lg border border-border bg-muted px-2 py-1.5 text-sm text-foreground outline-none"
                        placeholder="Proveedor"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={savingMateriales}
                        onClick={() => {
                          setMaterialesOrden((prev) => prev.filter((_, i) => i !== idx))
                        }}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Eliminar material"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex justify-end">
          <select
            value=""
            onChange={(e) => {
              const value = e.target.value
              if (!value) return
              const seleccionado = materialesDisponibles.find((m) => m.nombre === value) ?? null
              if (!seleccionado) return
              setMaterialesOrden((prev) => [
                ...prev,
                {
                  material: seleccionado.nombre,
                  producto: seleccionado.producto ?? "",
                  lote: seleccionado.numero_lote ?? "",
                  fabricante: seleccionado.marca_fabricante ?? seleccionado.fabricante ?? "",
                  proveedor: seleccionado.proveedor ?? "",
                },
              ])
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <option value="">Agregar material existente</option>
            {materialesDisponibles.map((m) => (
              <option key={m.codigo} value={m.nombre}>
                {m.codigo} - {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={savingMateriales || materialesOrden.length === 0}
            onClick={async () => {
              setSavingMateriales(true)
              try {
                await guardarMateriales(materialesOrden)
                toast.success("Materiales guardados correctamente")
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Error al guardar materiales"
                )
              } finally {
                setSavingMateriales(false)
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {savingMateriales ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Guardar Materiales
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Observaciones</h2>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-border">
            <thead className="bg-muted">
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Observación</th>
              </tr>
            </thead>
            <tbody>
              {observacionesOrden.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={2}>
                    Sin observaciones registradas
                  </td>
                </tr>
              ) : (
                observacionesOrden.map((obs, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {obs.fecha}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {obs.texto}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <textarea
            value={nuevaObservacion}
            onChange={(e) => setNuevaObservacion(e.target.value)}
            placeholder="Escribir observación..."
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={savingObservacion || !nuevaObservacion.trim()}
              onClick={async () => {
                setSavingObservacion(true)
                try {
                  await guardarObservacion(nuevaObservacion.trim())
                  setNuevaObservacion("")
                  toast.success("Observación agregada correctamente")
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Error al guardar observación"
                  )
                } finally {
                  setSavingObservacion(false)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {savingObservacion ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Agregar Observación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
