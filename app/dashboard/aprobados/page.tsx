"use client"

import { motion } from "framer-motion"
import { CheckCircle, Eye, Download, Calendar } from "lucide-react"

const approvedProducts = [
  {
    id: "APR-001",
    product: "Coronas Cerámicas x4",
    client: "Clínica Dental Sonrisa",
    approvedDate: "2024-01-15",
    deliveryDate: "2024-01-22",
    amount: "$1,400,000",
  },
  {
    id: "APR-002",
    product: "Prótesis Completa Superior",
    client: "Dr. Juan García",
    approvedDate: "2024-01-14",
    deliveryDate: "2024-01-28",
    amount: "$2,500,000",
  },
  {
    id: "APR-003",
    product: "Carillas x6",
    client: "Centro Odontológico Elite",
    approvedDate: "2024-01-12",
    deliveryDate: "2024-01-26",
    amount: "$3,600,000",
  },
  {
    id: "APR-004",
    product: "Diseño Digital Smile Design",
    client: "Dra. María López",
    approvedDate: "2024-01-10",
    deliveryDate: "2024-01-17",
    amount: "$150,000",
  },
  {
    id: "APR-005",
    product: "Inlays x3",
    client: "Clínica Dental Norte",
    approvedDate: "2024-01-08",
    deliveryDate: "2024-01-15",
    amount: "$840,000",
  },
]

export default function AprobadosPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Productos Aprobados
        </h1>
        <p className="text-muted-foreground">
          Trabajos aprobados por los clientes y en proceso de fabricación
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Aprobados</p>
              <p className="text-2xl font-bold text-foreground">
                {approvedProducts.length}
              </p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Por Entregar</p>
              <p className="text-2xl font-bold text-foreground">3</p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-primary">$8.49M</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Approved Products Table */}
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
                  Fecha Aprobación
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha Entrega
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
              {approvedProducts.map((item) => (
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
                    {item.approvedDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <Calendar size={12} />
                      {item.deliveryDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-primary">
                    {item.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye size={16} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Download size={16} />
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
