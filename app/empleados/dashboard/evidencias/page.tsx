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
}

export default function EmpleadoEvidenciasPage() {
  const [rows, setRows] = useState<Evidencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase.from("evidencias").select("*").order("created_at", { ascending: false })
      setRows((data as Evidencia[]) || [])
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
            <th className="border p-2">Foto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.solicitud_id}</td>
              <td className="border p-2">{r.fase}</td>
              <td className="border p-2"><img src={r.foto_url} alt="evidencia" className="h-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
