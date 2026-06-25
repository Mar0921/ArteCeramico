"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface PreaprobadoItem {
  id: number
  servicio: string
  estado: string
  created_at: string
  cliente_nombre: string
  precio: number | null
  servicios?: { id: number; nombre: string; precio: number | null }[]
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  aprobado: "bg-green-100 text-green-700",
  completado: "bg-primary/10 text-primary",
  cancelado: "bg-red-100 text-red-700",
}

export default function PreaprobadosPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<PreaprobadoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editEstado, setEditEstado] = useState("")
  const [editPrecio, setEditPrecio] = useState("")
  const [editServicioId, setEditServicioId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await fetch("/api/solicitudes?estado=pendiente&limit=100")
    if (res.ok) {
      const json = await res.json()
      setItems(json.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openEdit = async (item: PreaprobadoItem) => {
    setEditId(item.id)
    setEditEstado(item.estado)
    setEditPrecio(item.precio ? String(item.precio) : "")
    setEditServicioId(null)

    const { data } = await supabase
      .from("servicios")
      .select("id, precio")
      .eq("solicitud_id", item.id)
      .limit(1)

    if (data && data.length > 0) {
      setEditServicioId(data[0].id)
      setEditPrecio(data[0].precio ? String(data[0].precio) : "")
    }

    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!editId) return
    setSaving(true)
    try {
      const precioNum = editPrecio ? Number(editPrecio) : null
      const { error: solError } = await supabase
        .from("solicitudes")
        .update({ estado: editEstado })
        .eq("id", editId)

      if (solError) throw solError

      if (editServicioId && precioNum !== null) {
        const { error: servError } = await supabase
          .from("servicios")
          .update({ precio: precioNum })
          .eq("id", editServicioId)

        if (servError) throw servError
      }

      toast({
        title: "Cambios guardados",
        description: "La solicitud fue actualizada correctamente.",
      })

      setEditOpen(false)
      await loadData()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const pendientes = items.filter((i) => !i.estado || i.estado === "pendiente").length
  const enRevision = items.filter((i) => i.estado === "en_proceso").length
  const conObservaciones = items.filter((i) => i.estado === "cancelado").length

  const totalValue = items.reduce((acc, item) => acc + (item.precio || 0), 0)

  const estadosPosibles = ["pendiente", "en_proceso", "aprobado", "completado", "cancelado"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Productos Pre-aprobados
        </h1>
        <p className="text-muted-foreground">
          Trabajos pendientes de aprobación final del cliente
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-foreground">{pendientes}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En Revisión</p>
              <p className="text-2xl font-bold text-foreground">{enRevision}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-primary">
                ${totalValue.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Monto</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No hay solicitudes pendientes
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{item.id}</td>
                    <td className="px-6 py-4 text-foreground">
                      {item.servicio}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.cliente_nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.estado] || "bg-gray-100 text-gray-700"}`}
                      >
                        {item.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {item.precio ? `$${item.precio.toLocaleString("es-CO")}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Eye size={16} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50">
                          <CheckCircle size={16} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Solicitud</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Estado</label>
              <select
                value={editEstado}
                onChange={(e) => setEditEstado(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              >
                {estadosPosibles.map((est) => (
                  <option key={est} value={est}>
                    {est.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Precio</label>
              <input
                type="number"
                value={editPrecio}
                onChange={(e) => setEditPrecio(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditOpen(false)}
              disabled={saving}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
