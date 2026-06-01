"use client"

import { motion } from "framer-motion"
import { Clock, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const preapprovedProducts = [
  {
    id: "PRE-001",
    product: "Corona Zirconia x2",
    client: "Clínica Dental Sonrisa",
    submittedDate: "2024-01-16",
    status: "Pendiente revisión",
    amount: "$900,000",
  },
  {
    id: "PRE-002",
    product: "Prótesis Parcial Inferior",
    client: "Dr. Juan García",
    submittedDate: "2024-01-15",
    status: "En revisión",
    amount: "$1,200,000",
  },
  {
    id: "PRE-003",
    product: "Carillas x4",
    client: "Centro Odontológico Elite",
    submittedDate: "2024-01-14",
    status: "Pendiente revisión",
    amount: "$2,400,000",
  },
  {
    id: "PRE-004",
    product: "Onlays x2",
    client: "Dra. María López",
    submittedDate: "2024-01-13",
    status: "Observaciones",
    amount: "$640,000",
  },
  {
    id: "PRE-005",
    product: "Diseño Digital",
    client: "Consultorio Dr. Pérez",
    submittedDate: "2024-01-12",
    status: "En revisión",
    amount: "$150,000",
  },
]

const statusStyles: Record<string, string> = {
  "Pendiente revisión": "bg-amber-100 text-amber-700",
  "En revisión": "bg-blue-100 text-blue-700",
  Observaciones: "bg-red-100 text-red-700",
}

export default function PreaprobadosPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Productos Pre-aprobados
        </h1>
        <p className="text-muted-foreground">
          Trabajos pendientes de aprobación final del cliente
        </p>
      </div>

      {/* Stats */}
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
              <p className="text-2xl font-bold text-foreground">2</p>
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
              <p className="text-2xl font-bold text-foreground">2</p>
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
              <p className="text-sm text-muted-foreground">Con Observaciones</p>
              <p className="text-2xl font-bold text-foreground">1</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pre-approved Products Table */}
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
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha Envío
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Monto
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {preapprovedProducts.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-foreground">{item.product}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.client}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.submittedDate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">
                    {item.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
