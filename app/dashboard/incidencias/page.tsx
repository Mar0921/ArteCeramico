"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Loader2, Search, Plus, Edit } from "lucide-react"

export default function IncidenciasPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    supabase
      .from("incidencias")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as any[]) || [])
        setLoading(false)
      })
  }, [])

  const filtered = items.filter(
    (i) =>
      (i.codigo || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.tipo || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incidencias</h1>
          <p className="text-muted-foreground">Listado de incidencias registradas</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark">
          <Plus size={18} />
          Crear Incidencia
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por código, tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No hay incidencias registradas</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Fase</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{i.codigo}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {i.fecha ? new Date(i.fecha).toLocaleDateString("es-CO") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{i.tipo || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{i.fase || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          (i.estado || "nueva") === "nueva"
                            ? "bg-red-100 text-red-700"
                            : (i.estado || "nueva") === "abierta"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {i.estado || "nueva"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5">
                        <Edit size={14} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}