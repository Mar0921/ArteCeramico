"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
} from "lucide-react"

const invoices = [
  {
    id: "FAC-2024-001",
    client: "Clínica Dental Sonrisa",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    amount: "$3,450,000",
    status: "Pagada",
  },
  {
    id: "FAC-2024-002",
    client: "Dr. Juan García",
    date: "2024-01-14",
    dueDate: "2024-02-14",
    amount: "$2,500,000",
    status: "Pendiente",
  },
  {
    id: "FAC-2024-003",
    client: "Centro Odontológico Elite",
    date: "2024-01-12",
    dueDate: "2024-02-12",
    amount: "$5,800,000",
    status: "Pagada",
  },
  {
    id: "FAC-2024-004",
    client: "Dra. María López",
    date: "2024-01-10",
    dueDate: "2024-02-10",
    amount: "$1,200,000",
    status: "Vencida",
  },
  {
    id: "FAC-2024-005",
    client: "Clínica Dental Norte",
    date: "2024-01-08",
    dueDate: "2024-02-08",
    amount: "$4,100,000",
    status: "Pendiente",
  },
  {
    id: "FAC-2024-006",
    client: "Consultorio Dr. Pérez",
    date: "2024-01-05",
    dueDate: "2024-02-05",
    amount: "$890,000",
    status: "Pagada",
  },
]

const statusStyles: Record<string, string> = {
  Pagada: "bg-green-100 text-green-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Vencida: "bg-red-100 text-red-700",
}

export default function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPaid = invoices
    .filter((i) => i.status === "Pagada")
    .reduce((acc, i) => acc + parseInt(i.amount.replace(/[^0-9]/g, "")), 0)

  const totalPending = invoices
    .filter((i) => i.status === "Pendiente")
    .reduce((acc, i) => acc + parseInt(i.amount.replace(/[^0-9]/g, "")), 0)

  const totalOverdue = invoices
    .filter((i) => i.status === "Vencida")
    .reduce((acc, i) => acc + parseInt(i.amount.replace(/[^0-9]/g, "")), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground">
            Gestión de facturación y pagos
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark">
          <Plus size={18} />
          Nueva Factura
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagadas</p>
              <p className="text-xl font-bold text-green-600">
                ${totalPaid.toLocaleString()}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-xl font-bold text-amber-600">
                ${totalPending.toLocaleString()}
              </p>
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
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vencidas</p>
              <p className="text-xl font-bold text-red-600">
                ${totalOverdue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar facturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Invoices Table */}
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
                  No. Factura
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Vencimiento
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Monto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {invoice.client}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
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
