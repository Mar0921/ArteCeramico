"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { NuevaSolicitudDesdeCliente } from "@/components/nueva-solicitud/nueva-solicitud-cliente"

export default function NuevaSolicitudAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <NuevaSolicitudDesdeCliente
        modo="admin"
        volverA="/dashboard/clientes"
        redireccionExitosa="/dashboard/clientes"
      />
    </Suspense>
  )
}