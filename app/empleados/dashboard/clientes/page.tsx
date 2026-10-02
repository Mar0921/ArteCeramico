"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Loader2, Mail, Phone, Search, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface Cliente {
  id: number
  nombre: string
  correo: string
  telefono: string
  clinica: string
  tipo: string | null
  documento: string | null
  created_at: string
  total_solicitudes: number
}

export default function EmpleadosClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/clientes")
        if (!res.ok) throw new Error("No se pudieron cargar los clientes.")
        const result = await res.json()
        setClientes(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los clientes.")
      } finally {
        setLoading(false)
      }
    }
    loadClientes()
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return clientes
    return clientes.filter((c) =>
      [c.nombre, c.correo, c.telefono, c.clinica, c.documento]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term))
    )
  }, [clientes, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])

  return (
    <div className="w-full space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="mt-1 text-muted-foreground">
            Listado de clientes del laboratorio.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Buscar por nombre, email, clínica..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Clínica</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium text-right">Solicitudes</th>
              <th className="px-4 py-3 font-medium">Ver solicitudes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando clientes...
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              paged.map((cliente) => (
                <tr key={cliente.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <Stethoscope className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{cliente.nombre || "Sin nombre"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{cliente.tipo || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-foreground break-words">
                    {cliente.documento || "-"}
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-muted-foreground break-words">
                    {cliente.clinica || "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Mail size={12} />
                        {cliente.correo || "-"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Phone size={12} />
                        {cliente.telefono || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                        cliente.total_solicitudes > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cliente.total_solicitudes}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/empleados/dashboard/solicitudes?cliente_id=${cliente.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Ver solicitudes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filtered.length, currentPage * pageSize)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors disabled:opacity-50 hover:bg-muted"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors disabled:opacity-50 hover:bg-muted"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
