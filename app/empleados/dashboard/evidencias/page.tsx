"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Evidencia {
  id: number
  solicitud_id: number
  fase: string
  foto_url: string
  created_at: string
  empleado_id: number | null
  empleado?: { nombre: string } | null
}

export default function EmpleadoEvidenciasPage() {
  const [rows, setRows] = useState<Evidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase.from("evidencias").select("*").order("created_at", { ascending: false })
      const rows = (data as Evidencia[]) || []
      const ids = Array.from(new Set(rows.map(r => r.empleado_id).filter((x): x is number => x != null)))
      let nombres: Record<number, string> = {}
      if (ids.length) {
        const { data: emps } = await supabase.from("empleados").select("id, nombre").in("id", ids)
        for (const e of emps || []) nombres[e.id] = e.nombre
      }
      const solIds = Array.from(new Set(rows.map(r => r.solicitud_id).filter((x): x is number => x != null)))
      let codigos: Record<number, string> = {}
      if (solIds.length) {
        const { data: sols } = await supabase.from("solicitudes").select("id, codigo_trazabilidad").in("id", solIds)
        for (const s of sols || []) codigos[s.id] = s.codigo_trazabilidad || `#${s.id}`
      }
      setRows(rows.map(r => ({ ...r, empleado: r.empleado_id ? { nombre: nombres[r.empleado_id] || "-" } : null, codigo: codigos[r.solicitud_id] || `#${r.solicitud_id}` } as any)))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Evidencias</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Solicitud</th>
            <th className="border p-2">Fase</th>
            <th className="border p-2">Subido por</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Foto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{(r as any).codigo}</td>
              <td className="border p-2">{r.fase}</td>
              <td className="border p-2">{r.empleado?.nombre || "-"}</td>
              <td className="border p-2">{new Date(r.created_at).toLocaleString("es-CO")}</td>
              <td className="border p-2"><img src={r.foto_url} alt="evidencia" className="h-20 cursor-pointer" onClick={() => setZoom(r.foto_url)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setZoom(null)}>
          <img src={zoom} alt="evidencia ampliada" className="max-h-[90vh] max-w-[90vw]" />
        </div>
      )}
    </div>
  )
}
