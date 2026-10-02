"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface FaseTemplate {
  id: number
  nombre: string
  descripcion: string | null
  orden: number
  activa: boolean
}

interface Empleado {
  id: number
  nombre: string
  email: string
  rol: string | null
}

interface EmpleadoFase {
  empleado_id: number
  fase_template_id: number
}

interface ApiData {
  fases: FaseTemplate[]
  empleados: Empleado[]
  empleadoFases: EmpleadoFase[]
}

export default function EmpleadoMisFasesPage() {
  const [data, setData] = useState<ApiData | null>(null)
  const [empleadoId, setEmpleadoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError("Usuario no autenticado")
          return
        }

        const { data: me, error: meError } = await supabase
          .from("empleados")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (meError) throw meError
        setEmpleadoId(me?.id ?? null)

        const res = await fetch("/api/empleados/fases")
        if (!res.ok) throw new Error("No se pudieron cargar las fases.")
        const result = await res.json()
        setData(result.data)
      } catch (err: any) {
        setError(err.message || "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!data) return null

  const { fases, empleados, empleadoFases } = data

  return (
    <div className="w-full space-y-5 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Fases</h1>
          <p className="mt-1 text-muted-foreground">
            Todas las fases del proceso y a quienes están asignadas.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          <CheckCircle size={12} />
          Verde = asignadas a ti
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Fases del proceso</h2>
          <p className="text-muted-foreground mt-1">Listado de fases con sus empleados asignados</p>
        </div>

        <div className="p-4">
          {fases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay fases configuradas.</div>
          ) : (
            <div className="space-y-3">
              {fases.map((fase) => {
                const asignados = empleadoFases
                  .filter((ef) => ef.fase_template_id === fase.id)
                  .map((ef) => empleados.find((e) => e.id === ef.empleado_id))
                  .filter(Boolean) as Empleado[]
                const esMio =
                  empleadoId != null && asignados.some((e) => e.id === empleadoId)

                return (
                  <div
                    key={fase.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-colors",
                      esMio
                        ? "border-green-200 bg-green-50/60"
                        : "border-border bg-background/50"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full font-medium text-sm shrink-0",
                          esMio
                            ? "bg-green-500/10 text-green-600"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {esMio ? <CheckCircle size={18} /> : fase.orden}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{fase.nombre}</p>
                        {fase.descripcion && (
                          <p className="text-xs text-muted-foreground truncate">{fase.descripcion}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {asignados.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      ) : (
                        asignados.map((emp) => (
                          <span
                            key={emp.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              emp.id === empleadoId
                                ? "bg-green-100 text-green-700"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {emp.id === empleadoId && <CheckCircle size={10} />}
                            {emp.nombre}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
