"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Upload, FileText, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const CATEGORIAS = [
  "Acrilicos",
  "Encerados",
  "Implantologia",
  "Impresion en resina LCD",
  "Libre de metal",
  "Metal",
  "Uclas/Anillos en cromo",
  "Yesos",
  "Otros",
]

const TIPOS_MATERIAL = [
  "Resina",
  "Metal",
  "Zirconio",
  "Disilicato",
  "Cera",
  "Yeso",
  "Otros",
]

interface MaterialesFormValues {
  codigo: string
  numero_lote: string
  nombre: string
  categoria: string
  tipo_material: string
  marca_fabricante: string
  ref_fabricante: string
  material: string
  producto: string
  proveedor: string
}

interface MaterialesUploadProps {
  open: boolean
  onClose: () => void
}

export function MaterialesUpload({ open, onClose }: MaterialesUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MaterialesFormValues>({
    defaultValues: {
      codigo: "",
      numero_lote: "",
      nombre: "",
      categoria: "",
      tipo_material: "",
      marca_fabricante: "",
      ref_fabricante: "",
      material: "",
      producto: "",
      proveedor: "",
    },
  })

  const onSubmit = async (values: MaterialesFormValues) => {
    if (!selectedFile) {
      toast.error("Selecciona un archivo para subir")
      return
    }

    setIsUploading(true)

    try {
      const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "bin"
      const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
      const rutaStorage = `materiales/${nombreUnico}`

      const { error: uploadError } = await supabase.storage
        .from("materiales")
        .upload(rutaStorage, selectedFile, {
          upsert: false,
          contentType: selectedFile.type || "application/octet-stream",
        })

      if (uploadError) {
        toast.error(`Error al subir archivo: ${uploadError.message}`)
        return
      }

      const { data: urlData } = supabase.storage
        .from("materiales")
        .getPublicUrl(rutaStorage)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from("materiales")
        .insert([
          {
            codigo: values.codigo,
            numero_lote: values.numero_lote,
            nombre: values.nombre,
            categoria: values.categoria,
            tipo_material: values.tipo_material,
            marca_fabricante: values.marca_fabricante,
            ref_fabricante: values.ref_fabricante,
            material: values.material,
            producto: values.producto,
            proveedor: values.proveedor,
            archivo_url: urlData.publicUrl,
            archivo_nombre: selectedFile.name,
            subido_por: user?.id ?? null,
          },
        ])

      if (insertError) {
        toast.error(`Error al guardar registro: ${insertError.message}`)
        await supabase.storage.from("materiales").remove([rutaStorage])
        return
      }

      toast.success("Material registrado y archivo subido correctamente")
      reset()
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onClose()
    } catch (err) {
      toast.error("Error inesperado al registrar el material")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUploading}>
          {isUploading ? <Upload className="size-4 animate-spin" /> : <Upload size={16} />}
          {isUploading ? " Subiendo..." : "Nuevo Material"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Material</DialogTitle>
          <DialogDescription>
            Completa los datos y sube el archivo del material
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">CODIGO</Label>
              <Input
                id="codigo"
                {...register("codigo")}
                placeholder="Ej: MAT-001"
                disabled={isUploading}
                className={errors.codigo ? "border-red-500" : undefined}
              />
              {errors.codigo && (
                <span className="text-xs text-destructive">{errors.codigo.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="numero_lote">NÚMERO DE LOTE</Label>
              <Input
                id="numero_lote"
                {...register("numero_lote")}
                placeholder="Ej: LOTE-001"
                disabled={isUploading}
                className={errors.numero_lote ? "border-red-500" : undefined}
              />
              {errors.numero_lote && (
                <span className="text-xs text-destructive">{errors.numero_lote.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre">NOMBRE</Label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Nombre del material"
                disabled={isUploading}
                className={errors.nombre ? "border-red-500" : undefined}
              />
              {errors.nombre && (
                <span className="text-xs text-destructive">{errors.nombre.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <select
                id="categoria"
                {...register("categoria")}
                disabled={isUploading}
                className={errors.categoria ? "border-red-500" : undefined}
                onChange={(e) => {}}
              >
                <option value="">Selecciona categoría</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <span className="text-xs text-destructive">{errors.categoria.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo_material">Tipo de material</Label>
              <select
                id="tipo_material"
                {...register("tipo_material")}
                disabled={isUploading}
                className={errors.tipo_material ? "border-red-500" : undefined}
                onChange={(e) => {}}
              >
                <option value="">Selecciona tipo</option>
                {TIPOS_MATERIAL.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tipo_material && (
                <span className="text-xs text-destructive">{errors.tipo_material.message}</span>
              )}
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="marca_fabricante">Marca/Fabricante</Label>
              <Input
                id="marca_fabricante"
                {...register("marca_fabricante")}
                placeholder="Marca o fabricante"
                disabled={isUploading}
                className={errors.marca_fabricante ? "border-red-500" : undefined}
              />
              {errors.marca_fabricante && (
                <span className="text-xs text-destructive">{errors.marca_fabricante.message}</span>
              )}
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="ref_fabricante">Ref. Fabricante</Label>
              <Input
                id="ref_fabricante"
                {...register("ref_fabricante")}
                placeholder="Referencia del fabricante"
                disabled={isUploading}
                className={errors.ref_fabricante ? "border-red-500" : undefined}
              />
              {errors.ref_fabricante && (
                <span className="text-xs text-destructive">{errors.ref_fabricante.message}</span>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  {...register("material")}
                  placeholder="Material"
                  disabled={isUploading}
                  className={errors.material ? "border-red-500" : undefined}
                />
                {errors.material && (
                  <span className="text-xs text-destructive">{errors.material.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="producto">Producto</Label>
                <Input
                  id="producto"
                  {...register("producto")}
                  placeholder="Producto"
                  disabled={isUploading}
                  className={errors.producto ? "border-red-500" : undefined}
                />
                {errors.producto && (
                  <span className="text-xs text-destructive">{errors.producto.message}</span>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                {...register("proveedor")}
                placeholder="Proveedor"
                disabled={isUploading}
                className={errors.proveedor ? "border-red-500" : undefined}
              />
              {errors.proveedor && (
                <span className="text-xs text-destructive">{errors.proveedor.message}</span>
              )}
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="archivo">Archivo del material</Label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-background px-4 py-3 hover:bg-accent hover:border-accent transition-colors cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  id="archivo"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setSelectedFile(file)
                  }}
                  disabled={isUploading}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                  disabled={isUploading}
                >
                  <Upload size={18} />
                  {selectedFile
                    ? `Archivo: ${selectedFile.name}`
                    : "Seleccionar archivo"}
                </button>
                {selectedFile && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    disabled={isUploading}
                  >
                    <FileText size={14} /> Quitar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isUploading}
            >
              <Save size={16} />
              {isUploading ? "Guardando..." : "Guardar Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
