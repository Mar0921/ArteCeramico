"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
}

interface EmpleadoFase {
  empleado_id: number
  fase_template_id: number
}

export default function FasesPage() {
  const { toast } = useToast()
  const [fases, setFases] = useState<FaseTemplate[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoFases, setEmpleadoFases] = useState<EmpleadoFase[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fasesRes, empleadosRes, asignacionesRes] = await Promise.all([
        supabase.from("fases_template").select("*").order("orden", { ascending: true }),
        supabase.from("empleados").select("id, nombre, email").eq("activo", true).order("nombre"),
        supabase.from("empleado_fases").select("empleado_id, fase_template_id"),
      ])

      if (fasesRes.error) throw fasesRes.error
      if (empleadosRes.error) throw empleadosRes.error
      if (asignacionesRes.error) throw asignacionesRes.error

      setFases(fasesRes.data || [])
      setEmpleados(empleadosRes.data || [])
      setEmpleadoFases(asignacionesRes.data || [])
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al cargar datos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleEmpleadoFase = async (empleadoId: number, faseId: number, currentlyAssigned: boolean) => {
    try {
      if (currentlyAssigned) {
        const response = await fetch("/api/admin/empleado-fases", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empleado_id: empleadoId, fase_template_id: faseId }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Error al desasignar")
      } else {
        const response = await fetch("/api/admin/empleado-fases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empleado_id: empleadoId, fase_template_id: faseId }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Error al asignar")
      }
      fetchData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al actualizar asignación", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fases</h1>
        <p className="mt-1 text-muted-foreground">
          Sigue el avance de fabricación de cada solicitud.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Asignación de fases</h2>
          <p className="text-muted-foreground mt-1">Empleado asignado a cada fase del proceso</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : fases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay fases configuradas.</div>
          ) : (
            <div className="space-y-3">
              {fases.map((fase) => {
                const assignedEmpleadoId = empleadoFases.find((ef) => ef.fase_template_id === fase.id)?.empleado_id
                const assignedEmpleado = assignedEmpleadoId ? empleados.find((e) => e.id === assignedEmpleadoId) : null

                return (
                  <div key={fase.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border bg-background/50">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm shrink-0">
                        {fase.orden}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{fase.nombre}</p>
                        {fase.descripcion && <p className="text-xs text-muted-foreground truncate">{fase.descripcion}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-72">
                      <label htmlFor={`empleado-fase-${fase.id}`} className="text-sm font-medium text-muted-foreground shrink-0 whitespace-nowrap">
                        Asignar a:
                      </label>
                      <select
                        id={`empleado-fase-${fase.id}`}
                        value={assignedEmpleadoId || ""}
                        onChange={(e) => {
                          const empleadoId = e.target.value ? Number(e.target.value) : null
                          if (empleadoId === assignedEmpleadoId) return
                          if (assignedEmpleadoId) {
                            toggleEmpleadoFase(assignedEmpleadoId, fase.id, true)
                          }
                          if (empleadoId) {
                            toggleEmpleadoFase(empleadoId, fase.id, false)
                          }
                        }}
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.75rem_center] bg-no-repeat"
                      >
                        <option value="">Sin asignar</option>
                        {empleados.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.nombre}
                          </option>
                        ))}
                      </select>
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