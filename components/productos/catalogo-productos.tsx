"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Plus, Pencil, Trash2, Package, Loader2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { FASES_PROCESO } from "@/lib/fases"
import { useToast } from "@/hooks/use-toast"

interface ProductoLab {
  id: number
  codigo: string
  nombre: string
  codigo_categoria: string | null
  categoria: string | null
  iva: number | null
  activo: boolean | null
  fases_fabricacion: string | null
  created_at: string | null
  updated_at: string | null
}

function parsearFases(valor: string | null | undefined): string[] {
  if (!valor) return []
  try {
    const datos = JSON.parse(valor)
    return Array.isArray(datos) ? datos.map(String) : []
  } catch {
    return []
  }
}

export function CatalogoProductos() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<ProductoLab[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<ProductoLab | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    codigo_categoria: "",
    categoria: "",
    iva: "",
    activo: true,
    fases: [] as string[],
  })

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch("/api/productos", {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Error al cargar los productos")
      setProductos(result.data || [])
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    cargar()
  }, [cargar])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ codigo: "", nombre: "", codigo_categoria: "", categoria: "", iva: "", activo: true, fases: [] })
    setModalAbierto(true)
  }

  const abrirEditar = (p: ProductoLab) => {
    setEditando(p)
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      codigo_categoria: p.codigo_categoria || "",
      categoria: p.categoria || "",
      iva: p.iva == null ? "" : String(p.iva),
      activo: p.activo !== false,
      fases: parsearFases(p.fases_fabricacion),
    })
    setModalAbierto(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.codigo.trim() || !form.nombre.trim()) {
      toast({ title: "Error", description: "El código y el nombre son obligatorios.", variant: "destructive" })
      return
    }

    setGuardando(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      }
      const payload = {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        codigo_categoria: form.codigo_categoria.trim() || null,
        categoria: form.categoria.trim() || null,
        iva: form.iva === "" ? 0 : Number(form.iva),
        activo: form.activo,
        fases_fabricacion: form.fases,
      }

      const res = editando
        ? await fetch(`/api/productos/${editando.id}`, { method: "PATCH", headers, body: JSON.stringify(payload) })
        : await fetch("/api/productos", { method: "POST", headers, body: JSON.stringify(payload) })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Error al guardar el producto")

      toast({ title: "Guardado", description: "Producto guardado correctamente." })
      setModalAbierto(false)
      await cargar()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (p: ProductoLab) => {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}" (${p.codigo})?`)) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(`/api/productos/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.message || "Error al eliminar el producto")
      }

      toast({ title: "Eliminado", description: "Producto eliminado correctamente." })
      await cargar()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))) as string[]

  const contarFases = (valor: string | null | undefined): number => {
    if (!valor) return 0
    try {
      const datos = JSON.parse(valor)
      return Array.isArray(datos) ? datos.length : 0
    } catch {
      return 0
    }
  }

  const filtrados = productos.filter((p) => {
    const texto = busqueda.trim().toLowerCase()
    const coincideTexto =
      !texto ||
      p.codigo.toLowerCase().includes(texto) ||
      p.nombre.toLowerCase().includes(texto) ||
      (p.categoria || "").toLowerCase().includes(texto)
    const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria
    return coincideTexto && coincideCategoria
  })

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No se encontraron productos</p>
          <p className="text-xs text-muted-foreground">
            {productos.length === 0 ? "El catálogo está vacío" : "Prueba con otra búsqueda"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Código</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Cod. Categoría</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">IVA</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Activo</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Fases</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.codigo}</td>
                  <td className="px-4 py-3 text-foreground">{p.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categoria || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.codigo_categoria || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.iva ?? 0}%</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.activo !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contarFases(p.fases_fabricacion) > 0
                      ? `${contarFases(p.fases_fabricacion)} fases`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(p)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtrados.length} de {productos.length} productos
      </p>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editando ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={guardar} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ej: ACR002"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Provisional PMMA INT"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="Ej: Acrilicos"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Código de categoría
                  </label>
                  <input
                    type="text"
                    value={form.codigo_categoria}
                    onChange={(e) => setForm({ ...form, codigo_categoria: e.target.value })}
                    placeholder="Ej: ACR"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    IVA (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.iva}
                    onChange={(e) => setForm({ ...form, iva: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <label className="flex items-center gap-2 pt-6 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="size-4"
                  />
                  Activo
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Fases de fabricación
                </label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border bg-background p-2">
                  {FASES_PROCESO.map((fase) => (
                    <label
                      key={fase}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-foreground hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={form.fases.includes(fase)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            fases: e.target.checked
                              ? [...form.fases, fase]
                              : form.fases.filter((f) => f !== fase),
                          })
                        }
                        className="size-4"
                      />
                      {fase}
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.fases.length} de {FASES_PROCESO.length} fases seleccionadas
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
                >
                  {guardando && <Loader2 size={16} className="animate-spin" />}
                  {editando ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
