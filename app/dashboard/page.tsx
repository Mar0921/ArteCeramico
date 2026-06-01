"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
} from "lucide-react"

const stats = [
  {
    label: "Total Clientes",
    value: "1,248",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Productos Activos",
    value: "356",
    change: "+8%",
    trend: "up",
    icon: Package,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Trabajos Completados",
    value: "892",
    change: "+23%",
    trend: "up",
    icon: CheckCircle,
    color: "bg-accent/20 text-accent",
  },
  {
    label: "Ingresos del Mes",
    value: "$45.2M",
    change: "-3%",
    trend: "down",
    icon: DollarSign,
    color: "bg-amber-500/10 text-amber-600",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    client: "Clínica Dental Sonrisa",
    product: "Coronas Cerámicas x4",
    status: "En proceso",
    date: "2024-01-15",
    amount: "$1,200,000",
  },
  {
    id: "ORD-002",
    client: "Dr. Juan García",
    product: "Prótesis Completa",
    status: "Aprobado",
    date: "2024-01-14",
    amount: "$2,500,000",
  },
  {
    id: "ORD-003",
    client: "Centro Odontológico Elite",
    product: "Carillas x6",
    status: "Pendiente",
    date: "2024-01-14",
    amount: "$3,600,000",
  },
  {
    id: "ORD-004",
    client: "Dra. María López",
    product: "Inlays/Onlays x2",
    status: "Completado",
    date: "2024-01-13",
    amount: "$800,000",
  },
  {
    id: "ORD-005",
    client: "Clínica Dental Norte",
    product: "Diseño Digital",
    status: "En proceso",
    date: "2024-01-13",
    amount: "$450,000",
  },
]

const statusStyles: Record<string, string> = {
  "En proceso": "bg-blue-100 text-blue-700",
  Aprobado: "bg-green-100 text-green-700",
  Pendiente: "bg-amber-100 text-amber-700",
  Completado: "bg-primary/10 text-primary",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/Arte_Ceramico_Logo.svg"
              alt="Arte Cerámico - Laboratorio Dental"
              width={120}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido al panel de administración de Arte Cerámico
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-dark"
          >
            <Users size={18} />
            Ver Clientes
          </Link>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                  // Here you would typically call your logout function
                  // For now, we'll redirect to the login page or home
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl bg-card p-6 shadow-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Actividad Mensual
            </h2>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp size={16} />
              <span>+15% este mes</span>
            </div>
          </div>
          <div className="flex h-64 items-center justify-center rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Gráfico de actividad (UI placeholder)
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Estado de Pedidos
          </h2>
          <div className="space-y-4">
            {[
              { label: "Pendientes", value: 23, color: "bg-amber-500" },
              { label: "En Proceso", value: 45, color: "bg-blue-500" },
              { label: "Aprobados", value: 18, color: "bg-green-500" },
              { label: "Completados", value: 89, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="rounded-xl bg-card shadow-sm"
      >
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Pedidos Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.client}
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
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                    {order.amount}
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
