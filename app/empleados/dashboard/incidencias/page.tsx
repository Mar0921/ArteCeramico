"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function EmpleadoIncidenciasPage() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    supabase.from("incidencias").select("*").then(({ data }) => setItems((data as any[]) || []))
  }, [])
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Incidencias</h1>
      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className="border p-2 rounded">
            {i.codigo} - {i.tipo} - {i.fecha}
          </li>
        ))}
      </ul>
    </div>
  )
}