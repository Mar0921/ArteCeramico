"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Tag, User, Package, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function BusquedaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from("solicitudes")
      .select("id, servicio, estado, created_at, cliente_id")
      .or(`servicio.ilike.%${searchTerm}%`)

    if (!error && data) {
      const clienteIds = [...new Set(data.map((s: any) => s.cliente_id).filter(Boolean))]
      const clientesMap = new Map<number, string>()
      if (clienteIds.length > 0) {
        const { data: clientes } = await supabase
          .from("clientes")
          .select("id, nombre")
          .in("id", clienteIds)

        clientes?.forEach((c: any) => clientesMap.set(c.id, c.nombre))
      }

      const solicitudIds = data.map((s: any) => s.id)
      const { data: servicios } = await supabase
        .from("servicios")
        .select("solicitud_id, precio")
        .in("solicitud_id", solicitudIds)

      const preciosMap = new Map<number, number>()
      servicios?.forEach((s: any) => {
        preciosMap.set(s.solicitud_id, (preciosMap.get(s.solicitud_id) || 0) + Number(s.precio || 0))
      })

      setResults(
        data.map((s: any) => ({
          id: s.id,
          title: s.servicio,
          subtitle: clientesMap.get(s.cliente_id) || "Sin cliente",
          date: preciosMap.get(s.id) ? `$${preciosMap.get(s.id)!.toLocaleString("es-CO")}` : "-",
          type: "solicitud",
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const typeIcons: Record<string, typeof User> = {
    solicitud: Package,
    cliente: User,
  }

  const typeColors: Record<string, string> = {
    solicitud: "bg-primary/10 text-primary",
    cliente: "bg-blue-100 text-blue-600",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Búsqueda Avanzada</h1>
        <p className="text-muted-foreground">
          Busca en toda la base de datos con filtros indexados
        </p>
      </div>

      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Buscar solicitudes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {loading ? "Buscando..." : `${results.length} resultados encontrados`}
        </h3>
        <div className="space-y-3">
          {results.map((result) => {
            const Icon = typeIcons[result.type] || Package
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColors[result.type] || "bg-gray-100 text-gray-600"}`}
                >
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{result.title}</h4>
                  <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    <Tag size={12} />
                    {result.type}
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{result.date}</p>
                </div>
              </motion.div>
            )
          })}
          {!loading && results.length === 0 && searchTerm && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No se encontraron resultados
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
