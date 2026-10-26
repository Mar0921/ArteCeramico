"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Save, Loader2, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MaterialesUpload } from "@/components/materiales-upload"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export interface MaterialRow {
  id: number
  codigo: string
  numero_lote: string | null
  nombre: string
  categoria: string | null
  tipo_material: string | null
  marca_fabricante: string | null
  ref_fabricante: string | null
  material: string | null
  producto: string | null
  proveedor: string | null
  archivo_url: string | null
  archivo_nombre: string | null
  subido_por: string | null
  created_at: string | null
}

interface MaterialesTableProps {
  initialOpen?: boolean
}

export function MaterialesTable({ initialOpen = false }: MaterialesTableProps) {
  const [materiales, setMateriales] = useState<MaterialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(initialOpen)
  const [eliminando, setEliminando] = useState<number | null>(null)
  const [subidoPorMap, setSubidoPorMap] = useState<Record<string, string>>({})

  useEffect(() => {
    setOpen(initialOpen)
  }, [initialOpen])

  const cargarNombresSubidoPor = async (ids: string[]) => {
    if (ids.length === 0) return

    const [empRes, adminRes] = await Promise.all([
      supabase.from("empleados").select("user_id, nombre").in("user_id", ids),
      supabase.from("admins").select("user_id, nombre").in("user_id", ids),
    ])

    const map: Record<string, string> = {}

    empRes.data?.forEach((e) => {
      if (e.user_id) map[e.user_id] = e.nombre
    })

    adminRes.data?.forEach((a) => {
      if (a.user_id) map[a.user_id] = a.nombre
    })

    setSubidoPorMap(map)
  }

  const fetchMateriales = async () => {
    const { data, error } = await supabase
      .from("materiales")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast.error(`Error cargando materiales: ${error.message}`)
      return
    }

    const rows = (data ?? []) as MaterialRow[]
    setMateriales(rows)

    const ids = [...new Set(rows.map((r) => r.subido_por).filter(Boolean))] as string[]
    await cargarNombresSubidoPor(ids)

    setLoading(false)
  }

  useEffect(() => {
    fetchMateriales()
  }, [])

  const handleCreated = () => {
    fetchMateriales()
    setOpen(false)
  }

  const eliminarMaterialo = async (id: number, archivoUrl: string | null) => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return

    setEliminando(id)

    try {
      if (archivoUrl) {
        try {
          const url = new URL(archivoUrl)
          const bucketPath = url.pathname.split("/").slice(3).join("/")
          await supabase.storage.from("materiales").remove([bucketPath])
        } catch {
          // Ignorar errores de limpieza del archivo
        }
      }

      const { error } = await supabase.from("materiales").delete().eq("id", id)

      if (error) {
        toast.error(`Error al eliminar: ${error.message}`)
        return
      }

      toast.success("Material eliminado correctamente")
      fetchMateriales()
    } catch (err) {
      toast.error("Error inesperado al eliminar el material")
      console.error(err)
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="space-y-4 pt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Materiales</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} />
          Nuevo Material
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">CÓDIGO</TableHead>
              <TableHead className="w-[120px]">NÚMERO DE LOTE</TableHead>
              <TableHead>NOMBRE</TableHead>
              <TableHead className="w-[140px]">Categoría</TableHead>
              <TableHead className="w-[140px]">Tipo de material</TableHead>
              <TableHead className="w-[140px]">Marca / Fabricante</TableHead>
              <TableHead className="w-[120px]">Ref. Fabricante</TableHead>
              <TableHead className="w-[120px]">Material</TableHead>
              <TableHead className="w-[120px]">Producto</TableHead>
              <TableHead className="w-[140px]">Archivo</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
              <TableHead className="w-[140px]">Subido por / Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">
                  Cargando materiales...
                </TableCell>
              </TableRow>
            ) : materiales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                  No hay materiales registrados.
                </TableCell>
              </TableRow>
            ) : (
              materiales.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.codigo}</TableCell>
                  <TableCell>{m.numero_lote ?? "-"}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell>{m.categoria ?? "-"}</TableCell>
                  <TableCell>{m.tipo_material ?? "-"}</TableCell>
                  <TableCell>{m.marca_fabricante ?? "-"}</TableCell>
                  <TableCell>{m.ref_fabricante ?? "-"}</TableCell>
                  <TableCell>{m.material ?? "-"}</TableCell>
                  <TableCell>{m.producto ?? "-"}</TableCell>
                  <TableCell>
                    {m.archivo_url ? (
                      <a
                        href={m.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline underline-offset-4 hover:text-primary"
                        title={m.archivo_nombre ?? "Ver archivo"}
                      >
                        {m.archivo_nombre ?? "Ver archivo"}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => eliminarMaterialo(m.id, m.archivo_url)}
                      disabled={eliminando === m.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Eliminar material"
                    >
                      {eliminando === m.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{subidoPorMap[m.subido_por ?? ""] ?? "-"}</div>
                    <div>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MaterialesUpload open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
