"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Package,
  CheckCircle,
  DollarSign,
  Clock,
  FileText,
  Mail,
  Phone,
  Building2,
  Eye,
  Download,
} from "lucide-react"

const clients = [
  {
    id: 1,
    name: "Clínica Dental Sonrisa",
    documentType: "nit",
    documentNumber: "900.123.456-7",
    email: "contacto@sonrisa.com",
    phone: "+57 300 123 4567",
    clinic: "Clínica Dental Sonrisa",
    status: "Activo",
    orders: [
      {
        id: "ORD-001",
        date: "2024-01-15",
        invoiceId: "FAC-2024-001",
        amount: "$1,200,000",
        product: "Coronas Cerámicas x4",
        status: "En proceso",
      },
      {
        id: "ORD-005",
        date: "2024-01-13",
        invoiceId: "FAC-2024-005",
        amount: "$450,000",
        product: "Diseño Digital",
        status: "En proceso",
      },
    ],
    totalSpent: "$15,200,000",
  },
  {
    id: 2,
    name: "Dr. Juan García",
    documentType: "cc",
    documentNumber: "12.345.678-9",
    email: "jgarcia@email.com",
    phone: "+57 301 234 5678",
    clinic: "Consultorio Privado García",
    status: "Activo",
    orders: [
      {
        id: "ORD-002",
        date: "2024-01-14",
        invoiceId: "FAC-2024-002",
        amount: "$2,500,000",
        product: "Prótesis Completa",
        status: "Aprobado",
      },
    ],
    totalSpent: "$8,500,000",
  },
  {
    id: 3,
    name: "Centro Odontológico Elite",
    documentType: "nit",
    documentNumber: "800.987.654-3",
    email: "info@elite.com",
    phone: "+57 302 345 6789",
    clinic: "Centro Odontológico Elite",
    status: "Activo",
    orders: [
      {
        id: "ORD-003",
        date: "2024-01-14",
        invoiceId: "FAC-2024-003",
        amount: "$3,600,000",
        product: "Carillas x6",
        status: "Pendiente",
      },
    ],
    totalSpent: "$22,800,000",
  },
  {
    id: 4,
    name: "Dra. María López",
    documentType: "cc",
    documentNumber: "98.765.432-1",
    email: "mlopez@dental.com",
    phone: "+57 303 456 7890",
    clinic: "Consultorio Dental López",
    status: "Inactivo",
    orders: [
      {
        id: "ORD-004",
        date: "2024-01-13",
        invoiceId: "FAC-2024-004",
        amount: "$800,000",
        product: "Inlays/Onlays x2",
        status: "Completado",
      },
    ],
    totalSpent: "$4,200,000",
  },
  {
    id: 5,
    name: "Clínica Dental Norte",
    documentType: "nit",
    documentNumber: "900.555.777-2",
    email: "norte@clinica.com",
    phone: "+57 304 567 8901",
    clinic: "Clínica Dental Norte",
    status: "Activo",
    orders: [
      {
        id: "ORD-006",
        date: "2024-01-12",
        invoiceId: "FAC-2024-006",
        amount: "$1,200,000",
        product: "Prótesis Parcial x3",
        status: "Aprobado",
      },
    ],
    totalSpent: "$12,100,000",
  },
  {
    id: 6,
    name: "Consultorio Dr. Pérez",
    documentType: "cc",
    documentNumber: "11.222.333-4",
    email: "drperez@consultorio.com",
    phone: "+57 305 678 9012",
    clinic: "Consultorio Dr. Pérez",
    status: "Activo",
    orders: [
      {
        id: "ORD-007",
        date: "2024-01-10",
        invoiceId: "FAC-2024-007",
        amount: "$890,000",
        product: "Carillas x4",
        status: "Pendiente",
      },
    ],
    totalSpent: "$6,800,000",
  },
]

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
  "En proceso": "bg-blue-100 text-blue-700",
  Aprobado: "bg-green-100 text-green-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Completado: "bg-primary/10 text-primary",
}
const invoiceStatusStyles: Record<string, string> = {
  Pagada: "bg-green-100 text-green-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Vencida: "bg-red-100 text-red-700",
}

export default function ClientePerfilPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clientId = parseInt(id)
    const foundClient = clients.find((c) => c.id === clientId)
    setClient(foundClient || null)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
          <Package size={24} className="text-primary" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Users size={48} className="text-muted-foreground" />
        </motion.div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Cliente no encontrado</h2>
        <p className="mb-6 text-muted-foreground max-w-xl">
          El cliente que estás buscando no existe o ha sido eliminado.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Users size={18} />
          Volver a Clientes
        </motion.div>
      </div>
    )
  }

  const clientInvoices = invoices.filter(
    (invoice) => invoice.client === client.name
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground">
            Perfil del cliente
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Users size={18} />
            Volver a Clientes
          </Link>
        </div>
      </div>

      {/* Client Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card p-6 shadow-sm"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {client.name.charAt(0)}
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
                <p className="text-muted-foreground">
                  {client.clinic}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building2 size={16} />
                <span>
                  {client.documentType.toUpperCase()}: {client.documentNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle size={16} />
                <span className={`${
                  client.status === "Activo"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Pedidos Totales</p>
                <p className="font-semibold text-foreground">
                  {client.orders.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Gastado</p>
                <p className="font-semibold text-primary">
                  {client.totalSpent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders Section */}
      {client.orders.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Pedidos del Cliente
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      ID Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Factura
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {client.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.product}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {order.invoiceId}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Visualizar Factura */}
                          <button
                            onClick={() => {
                              const invoice = clientInvoices.find(
                                (inv) => inv.id === order.invoiceId
                              )
                              if (invoice) {
                                // Here you would typically open a modal or navigate to invoice view
                                alert(`Visualizando factura ${invoice.id}`)
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye size={16} />
                          </button>
                          {/* Descargar Factura */}
                          <button
                            onClick={() => {
                              const invoice = clientInvoices.find(
                                (inv) => inv.id === order.invoiceId
                              )
                              if (invoice) {
                                // Here you would trigger a download
                                alert(`Descargando factura ${invoice.id}`)
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
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
        </>
      )}

      {/* No Orders Message */}
      {client.orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center py-12"
        >
          <Users size={32} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Este cliente aún no tiene pedidos registrados.
          </p>
        </motion.div>
      )}
    </div>
  )
}