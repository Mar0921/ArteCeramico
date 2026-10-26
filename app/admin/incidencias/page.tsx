"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Search, AlertCircle, Plus, Edit, Trash2, X, Save } from "lucide-react"

interface Incidencia {
  id: string
  codigo: string
  fecha: string
  hora: string | null
  tipo: string
  fase: string | null
  descripcion: string
  solicitud_id: string | null
  estado: string | null
  created_at: string
}

export default function AdminIncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [incCodigo, setIncCodigo] = useState("")
  const [incFecha, setIncFecha] = useState("")
  const [incHora, setIncHora] = useState("")
  const [incTipo, setIncTipo] = useState("")
  const [incFase, setIncFase] = useState("")
  const [incDescripcion, setIncDescripcion] = useState("")
  const [incSolicitudId, setIncSolicitudId] = useState("")
  const [incEstado, setIncEstado] = useState("nueva")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [tabEditInc, setTabEditInc] = useState<"basicos" | "productos" | "medidas">("basicos")
  const [saving, setSaving] = useState<string | null>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [cargandoServicios, setCargandoServicios] = useState(false)
  const [editData, setEditData] = useState<{
    codigo: string
    tipo: string
    fecha: string
    hora: string | null
    fase: string | null
    descripcion: string
    solicitud_id: string | null
    estado: string | null
  } | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchIncidencias = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("incidencias")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setIncidencias((data as Incidencia[]) || [])
    } catch (err) {
      console.error("Error cargando incidencias:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidencias()
  }, [])

  const filteredIncidencias = incidencias.filter(
    (inc) =>
      inc.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inc.solicitud_id || "").includes(searchTerm)
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!incCodigo.trim() || !incTipo.trim() || !incFecha) return
    setCreating(true)
    try {
      const { error } = await supabase
        .from("incidencias")
        .insert({
          codigo: incCodigo.trim(),
          fecha: incFecha,
          hora: incHora || null,
          tipo: incTipo.trim(),
          fase: incFase || null,
          descripcion: incDescripcion || null,
          solicitud_id: incSolicitudId || null,
          estado: incEstado || "nueva",
        })
      if (error) throw error
      setShowCreateForm(false)
      setIncCodigo("")
      setIncFecha("")
      setIncHora("")
      setIncTipo("")
      setIncFase("")
      setIncDescripcion("")
      setIncSolicitudId("")
      setIncEstado("nueva")
      await fetchIncidencias()
    } catch (err: any) {
      alert(err.message || "No se pudo crear la incidencia.")
    } finally {
      setCreating(false)
    }
  }

  const startEdit = async (inc: Incidencia) => {
    setTabEditInc("basicos")
    setEditData({
      codigo: inc.codigo,
      tipo: inc.tipo,
      fecha: inc.fecha,
      hora: inc.hora,
      fase: inc.fase,
      descripcion: inc.descripcion,
      solicitud_id: inc.solicitud_id,
      estado: inc.estado,
    })
    setEditingId(inc.id)
    await cargarServicios(inc.solicitud_id)
  }

  const cargarServicios = async (solicitudId: string | null) => {
    if (!solicitudId) {
      setServicios([])
      return
    }
    setCargandoServicios(true)
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .order("created_at", { ascending: false })
      if (error) throw error
      setServicios((data as any[]) || [])
    } catch (err) {
      console.error("Error cargando servicios:", err)
      setServicios([])
    } finally {
      setCargandoServicios(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData || !editingId) return
    if (!editData.codigo.trim() || !editData.tipo.trim() || !editData.fecha) return
    setSaving(editingId)
    try {
      const { error } = await supabase
        .from("incidencias")
        .update({
          codigo: editData.codigo.trim(),
          tipo: editData.tipo.trim(),
          fecha: editData.fecha,
          hora: editData.hora,
          fase: editData.fase,
          descripcion: editData.descripcion,
          solicitud_id: editData.solicitud_id,
          estado: editData.estado,
        })
        .eq("id", editingId)
      if (error) throw error
      setEditingId(null)
      setEditData(null)
      await fetchIncidencias()
    } catch (err: any) {
      alert(err.message || "No se pudo guardar la incidencia.")
    } finally {
      setSaving(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
  }

  const cancelDelete = () => {
    setDeletingId(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const { error } = await supabase.from("incidencias").delete().eq("id", id)
      if (error) throw error
      setDeletingId(null)
      await fetchIncidencias()
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar la incidencia.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incidencias</h1>
          <p className="text-muted-foreground">Listado de todas las incidencias registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
          >
            <Plus size={18} />
            {showCreateForm ? "Ocultar formulario" : "Crear Incidencia"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Nueva Incidencia</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Código</label>
              <input
                type="text"
                value={incCodigo}
                onChange={(e) => setIncCodigo(e.target.value)}
                placeholder="Ej. INC-20261025-001"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
              <input
                type="text"
                value={incTipo}
                onChange={(e) => setIncTipo(e.target.value)}
                placeholder="Ej. Retraso, Calidad, Daño"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha</label>
              <input
                type="date"
                value={incFecha}
                onChange={(e) => setIncFecha(e.target.value)}
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hora</label>
              <input
                type="time"
                value={incHora}
                onChange={(e) => setIncHora(e.target.value)}
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fase</label>
              <input
                type="text"
                value={incFase}
                onChange={(e) => setIncFase(e.target.value)}
                placeholder="Ej. Pulido, Empastado"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Estado</label>
              <select
                value={incEstado}
                onChange={(e) => setIncEstado(e.target.value)}
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="nueva">Nueva</option>
                <option value="abierta">Abierta</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelta">Resuelta</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Solicitud ID</label>
              <input
                type="text"
                value={incSolicitudId}
                onChange={(e) => setIncSolicitudId(e.target.value)}
                placeholder="ID de la solicitud (opcional)"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Descripción</label>
              <textarea
                value={incDescripcion}
                onChange={(e) => setIncDescripcion(e.target.value)}
                rows={3}
                placeholder="Descripción de la incidencia"
                className="w-full rounded-xl border border-border bg-input py-2.5 pl-4 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {creating ? "Guardando..." : "Guardar Incidencia"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por código, tipo o solicitud..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredIncidencias.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay incidencias registradas</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Fase</th>
                  <th className="px-6 py-4">Solicitud</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidencias.map((inc) => (
                  <>
                    <tr key={`row-${inc.id}`} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium text-foreground">{inc.codigo}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {inc.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {inc.fecha ? new Date(inc.fecha).toLocaleDateString("es-CO") : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{inc.hora || "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{inc.fase || "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{inc.solicitud_id || "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {inc.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            inc.estado === "resuelta"
                              ? "bg-green-100 text-green-700"
                              : inc.estado === "en_proceso"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inc.estado || "nueva"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === inc.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSaveEdit(e as any) }}
                              disabled={saving === inc.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-60"
                            >
                              {saving === inc.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                              Guardar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); cancelEdit() }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red hover:text-red-600 hover:bg-red/5"
                            >
                              <X size={14} />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); startEdit(inc) }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
                            >
                              <Edit size={14} />
                              Editar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmDelete(inc.id) }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red hover:text-red-600 hover:bg-red/5"
                            >
                              <Trash2 size={14} />
                              Borrar
                            </button>
                          </div>
                        )}
                        {deletingId === inc.id && (
                          <div className="mt-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 leading-relaxed">
                            ¿Estás seguro de que deseas eliminar la incidencia "{inc.codigo}"? Esta acción no se puede deshacer.
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(inc.id) }}
                                disabled={deleting === inc.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-colors hover:bg-red-200 disabled:opacity-60"
                              >
                                {deleting === inc.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Eliminar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); cancelDelete() }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                              >
                                <X size={14} />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>


                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editingId && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg p-6 w-[600px] max-h-[80vh] overflow-auto border border-border">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTabEditInc("basicos")} className={tabEditInc === "basicos" ? "font-bold underline" : ""}>Datos básicos</button>
              <button onClick={() => setTabEditInc("productos")} className={tabEditInc === "productos" ? "font-bold underline" : ""}>Productos</button>
              <button onClick={() => setTabEditInc("medidas")} className={tabEditInc === "medidas" ? "font-bold underline" : ""}>Medidas</button>
            </div>
            {tabEditInc === "basicos" && (
              <form onSubmit={handleSaveEdit} className="space-y-2">
                <input className="w-full border rounded px-2 py-1" value={editData.codigo} onChange={(e) => setEditData({ ...editData, codigo: e.target.value })} />
                <textarea className="w-full border rounded px-2 py-1" value={editData.descripcion || ""} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })} />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Guardar</button>
              </form>
            )}
            {tabEditInc === "productos" && (
              <div className="space-y-2">
                {cargandoServicios ? (
                  <p className="text-muted-foreground">Cargando servicios...</p>
                ) : servicios.length === 0 ? (
                  <p className="text-muted-foreground">No hay servicios disponibles para esta solicitud</p>
                ) : (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                          <th className="px-4 py-3">Servicio</th>
                          <th className="px-4 py-3">Descripción</th>
                          <th className="px-4 py-3">Precio</th>
                          <th className="px-4 py-3">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicios.map((s) => (
                          <tr key={s.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-medium text-foreground">{s.nombre || "-"}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{s.descripcion || "-"}</td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {s.precio != null ? `$${Number(s.precio).toLocaleString("es-CO")}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{s.cantidad ?? 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {tabEditInc === "medidas" && <p>Sin medidas</p>}
            <button className="mt-4 px-4 py-2 border rounded" onClick={cancelEdit}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
