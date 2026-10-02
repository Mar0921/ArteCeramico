import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/fechas"

export interface VenceMananaItem {
  codigo: string
  fechaEntrega: string | null
  href?: string
}

interface ExpiracionMananaBannerProps {
  items: VenceMananaItem[]
}

export default function ExpiracionMananaBanner({ items }: ExpiracionMananaBannerProps) {
  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
          <AlertCircle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-red-700">Entrega próxima: vence mañana</p>
          <div className="mt-1 space-y-1">
            {items.map((item) => (
              <p key={item.codigo} className="text-sm font-medium text-foreground">
                La solicitud {item.codigo} vence mañana
                {item.fechaEntrega ? ` (entrega: ${formatDate(item.fechaEntrega)})` : ""}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
