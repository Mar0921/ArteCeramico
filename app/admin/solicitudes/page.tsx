"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminSolicitudesListPage() {
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadSolicitudes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("solicitudes")
        .select("*, clientes(nombre)")
        .order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        toast.error(`Error cargando solicitudes: ${error.message}`)
        return
      }

      setSolicitudes((data ?? []).map((s: any) => ({
        ...s,
        cliente_nombre: s.clientes?.[0]?.nombre || "Cliente",
      })))
    } catch (err) {
      toast.error("Error inesperado cargando solicitudes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSolicitudes()
  }, [])

  const filtradas = solicitudes.filter((s) =>
    (s.cliente_nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.codigo_trazabilidad || "").toLowerCase().includes(search.toLowerCase()) ||
    String(s.id).includes(search)
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Solicitudes</h1>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Buscar solicitud o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => router.push("/admin/solicitudes/nueva")}>
            <Plus size={16} />
            Nueva
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Cliente</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Fase</th>
              <th className="px-3 py-2 font-medium">Fecha</th>
              <th className="px-3 py-2 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                  No se encontraron solicitudes
                </td>
              </tr>
            ) : (
              filtradas.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer group"
                  onClick={() => router.push(`/admin/solicitudes/${s.id}`)}>
                  <td className="px-3 py-2 font-medium">{s.id}</td>
                  <td className="px-3 py-2">{s.cliente_nombre}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.estado === "completado" ? "bg-green-100 text-green-700" :
                      s.estado === "aprobado" ? "bg-blue-100 text-blue-700" :
                      s.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">{s.fase || "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-xs text-primary">Ver</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
