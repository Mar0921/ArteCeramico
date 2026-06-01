"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Calendar, Tag, User, Package } from "lucide-react"

const searchResults = [
  {
    type: "cliente",
    title: "Clínica Dental Sonrisa",
    subtitle: "contacto@sonrisa.com",
    date: "Cliente desde 2020",
  },
  {
    type: "producto",
    title: "Corona Cerámica E.max",
    subtitle: "Categoría: Coronas",
    date: "$350,000",
  },
  {
    type: "factura",
    title: "FAC-2024-001",
    subtitle: "Clínica Dental Sonrisa",
    date: "$3,450,000",
  },
  {
    type: "cliente",
    title: "Dr. Juan García",
    subtitle: "jgarcia@email.com",
    date: "Cliente desde 2021",
  },
  {
    type: "producto",
    title: "Carilla Porcelana",
    subtitle: "Categoría: Carillas",
    date: "$600,000",
  },
]

const typeIcons: Record<string, typeof User> = {
  cliente: User,
  producto: Package,
  factura: Calendar,
}

const typeColors: Record<string, string> = {
  cliente: "bg-blue-100 text-blue-600",
  producto: "bg-primary/10 text-primary",
  factura: "bg-amber-100 text-amber-600",
}

const filters = [
  { label: "Todos", value: "all" },
  { label: "Clientes", value: "cliente" },
  { label: "Productos", value: "producto" },
  { label: "Facturas", value: "factura" },
]

export default function BusquedaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredResults = searchResults.filter((result) => {
    const matchesSearch =
      result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      activeFilter === "all" || result.type === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Búsqueda Avanzada
        </h1>
        <p className="text-muted-foreground">
          Busca en toda la base de datos con filtros indexados
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Buscar clientes, productos, facturas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-4 pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Filter size={14} />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm"
      >
        <h3 className="mb-4 font-semibold text-foreground">Filtros Avanzados</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Fecha Desde
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Fecha Hasta
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Categoría
            </label>
            <select className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Todas</option>
              <option>Coronas</option>
              <option>Carillas</option>
              <option>Prótesis</option>
              <option>Restauraciones</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Estado
            </label>
            <select className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Todos</option>
              <option>Activo</option>
              <option>Pendiente</option>
              <option>Completado</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Search Results */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {filteredResults.length} resultados encontrados
        </h3>
        <div className="space-y-3">
          {filteredResults.map((result, index) => {
            const Icon = typeIcons[result.type]
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColors[result.type]}`}
                >
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{result.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.subtitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    <Tag size={12} />
                    {result.type}
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {result.date}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
