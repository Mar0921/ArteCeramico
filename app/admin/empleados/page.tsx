"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  User,
  Mail,
  Lock,
  Shield,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Empleado {
  id: number
  user_id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
  creado_por: string | null
  created_at: string
}

export default function AdminEmpleadosPage() {
  const { toast } = useToast()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "empleado",
    activo: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchEmpleados = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setEmpleados(data || [])
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al cargar empleados", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const handleOpenModal = (empleado?: Empleado) => {
    if (empleado) {
      setEditingEmpleado(empleado)
      setFormData({
        nombre: empleado.nombre,
        email: empleado.email,
        password: "",
        rol: empleado.rol,
        activo: empleado.activo,
      })
    } else {
      setEditingEmpleado(null)
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "empleado",
        activo: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmpleado(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingEmpleado) {
        const updates: any = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo,
        }

        const response = await fetch(`/api/admin/empleados?id=${editingEmpleado.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updates, password: formData.password }),
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Error al actualizar")

        toast({ title: "Actualizado", description: "Empleado actualizado correctamente" })
      } else {
        const response = await fetch("/api/admin/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Error al crear")

        toast({ title: "Creado", description: "Empleado creado correctamente" })
      }

      handleCloseModal()
      fetchEmpleados()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al guardar", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este empleado?")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/empleados?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Error al eliminar")

      toast({ title: "Eliminado", description: "Empleado eliminado correctamente" })
      fetchEmpleados()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al eliminar", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredEmpleados = empleados.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Empleados</h1>
          <p className="text-muted-foreground">Crea y gestiona accesos para tu equipo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
        >
          <Plus size={18} />
          Nuevo Empleado
        </button>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar empleados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEmpleados.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No hay empleados registrados</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="px-6 py-4">Empleado</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Creado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpleados.map((empleado) => (
                  <tr key={empleado.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {empleado.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{empleado.nombre}</p>
                          <p className="text-xs text-muted-foreground">ID: {empleado.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{empleado.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        <Shield size={10} />
                        {empleado.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          empleado.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {empleado.activo ? (
                          <>
                            <CheckCircle size={10} />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle size={10} />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(empleado.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(empleado)}
                          className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(empleado.id, empleado.user_id)}
                          disabled={deletingId === empleado.id}
                          className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                          title="Eliminar"
                        >
                          {deletingId === empleado.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${showModal ? "" : "hidden"}`}
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {editingEmpleado
                ? "Actualiza la información del empleado"
                : "Crea una nueva cuenta de acceso para un empleado"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-foreground">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-5 text-muted-foreground" />
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan Pérez"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="empleado@arteceramico.com"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                  disabled={!!editingEmpleado}
                />
              </div>
              {editingEmpleado && (
                <p className="mt-1 text-xs text-muted-foreground">El email no se puede cambiar</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Contraseña {editingEmpleado ? "(dejar en blanco para no cambiar)" : ""}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingEmpleado ? "••••••••" : "Mínimo 6 caracteres"}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required={!editingEmpleado}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="rol" className="mb-2 block text-sm font-medium text-foreground">
                Rol
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 size-5 text-muted-foreground" />
                <input
                  type="text"
                  id="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  placeholder="ej. empleado, supervisor, admin"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="activo" className="text-sm text-foreground">
                Activo
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-xl border border-border bg-card py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {submitting ? "Guardando..." : editingEmpleado ? "Actualizar" : "Crear Empleado"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}