"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Filter, Grid, List, Package } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Corona Cerámica E.max",
    category: "Coronas",
    price: "$350,000",
    stock: 45,
    status: "Disponible",
  },
  {
    id: 2,
    name: "Corona Zirconia Premium",
    category: "Coronas",
    price: "$450,000",
    stock: 32,
    status: "Disponible",
  },
  {
    id: 3,
    name: "Carilla Porcelana",
    category: "Carillas",
    price: "$600,000",
    stock: 18,
    status: "Disponible",
  },
  {
    id: 4,
    name: "Prótesis Parcial Removible",
    category: "Prótesis",
    price: "$1,200,000",
    stock: 8,
    status: "Bajo stock",
  },
  {
    id: 5,
    name: "Prótesis Total Superior",
    category: "Prótesis",
    price: "$1,800,000",
    stock: 5,
    status: "Bajo stock",
  },
  {
    id: 6,
    name: "Inlay Cerámica",
    category: "Restauraciones",
    price: "$280,000",
    stock: 0,
    status: "Agotado",
  },
  {
    id: 7,
    name: "Onlay Cerámica",
    category: "Restauraciones",
    price: "$320,000",
    stock: 25,
    status: "Disponible",
  },
  {
    id: 8,
    name: "Diseño Digital Smile Design",
    category: "Digital",
    price: "$150,000",
    stock: 999,
    status: "Disponible",
  },
]

const statusStyles: Record<string, string> = {
  Disponible: "bg-green-100 text-green-700",
  "Bajo stock": "bg-amber-100 text-amber-700",
  Agotado: "bg-red-100 text-red-700",
}

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">
            Catálogo de productos y servicios
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark">
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Filter size={18} />
            Filtros
          </button>
          <div className="flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted/50">
                <Package size={48} className="text-muted-foreground/50" />
              </div>
              <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {product.category}
              </span>
              <h3 className="mb-2 font-semibold text-foreground">
                {product.name}
              </h3>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {product.price}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[product.status]}`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock} unidades
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Precio
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[product.status]}`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
