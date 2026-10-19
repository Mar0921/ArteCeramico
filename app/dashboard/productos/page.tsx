"use client"

import { CatalogoProductos } from "@/components/productos/catalogo-productos"

export default function ProductosPage() {
  return (
    <div className="space-y-6 mt-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Productos</h1>
        <p className="text-muted-foreground">
          Catálogo de productos del laboratorio (ProductosLab)
        </p>
      </div>

      <CatalogoProductos />
    </div>
  )
}
