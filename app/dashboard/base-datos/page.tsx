"use client"

import { motion } from "framer-motion"
import {
  Database,
  Users,
  Package,
  FileText,
  HardDrive,
  Activity,
  RefreshCw,
} from "lucide-react"

const databaseStats = [
  {
    name: "Clientes",
    count: "1,248",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    lastUpdated: "Hace 2 minutos",
  },
  {
    name: "Productos",
    count: "356",
    icon: Package,
    color: "bg-primary/10 text-primary",
    lastUpdated: "Hace 5 minutos",
  },
  {
    name: "Facturas",
    count: "4,892",
    icon: FileText,
    color: "bg-amber-100 text-amber-600",
    lastUpdated: "Hace 1 minuto",
  },
  {
    name: "Pedidos",
    count: "12,456",
    icon: Database,
    color: "bg-accent/20 text-accent",
    lastUpdated: "Hace 30 segundos",
  },
]

const recentActivities = [
  {
    action: "Nuevo cliente registrado",
    details: "Clínica Dental Elite",
    time: "Hace 2 minutos",
    type: "create",
  },
  {
    action: "Factura generada",
    details: "FAC-2024-007 - $2,300,000",
    time: "Hace 5 minutos",
    type: "create",
  },
  {
    action: "Producto actualizado",
    details: "Corona Zirconia Premium - Precio ajustado",
    time: "Hace 15 minutos",
    type: "update",
  },
  {
    action: "Pedido completado",
    details: "ORD-2024-089 - Carillas x6",
    time: "Hace 30 minutos",
    type: "complete",
  },
  {
    action: "Cliente actualizado",
    details: "Dr. Juan García - Información de contacto",
    time: "Hace 1 hora",
    type: "update",
  },
]

const typeColors: Record<string, string> = {
  create: "bg-green-100 text-green-600",
  update: "bg-blue-100 text-blue-600",
  complete: "bg-primary/10 text-primary",
}

export default function BaseDatosPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Base de Datos General
          </h1>
          <p className="text-muted-foreground">
            Vista general del sistema y estadísticas de la base de datos
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <RefreshCw size={18} />
          Sincronizar
        </button>
      </div>

      {/* Database Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {databaseStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-xl bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.count}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {stat.lastUpdated}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Storage Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HardDrive size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Almacenamiento
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Espacio utilizado</span>
                <span className="font-medium text-foreground">
                  45.2 GB / 100 GB
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "45.2%" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">28.5 GB</p>
                <p className="text-xs text-muted-foreground">Archivos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">12.3 GB</p>
                <p className="text-xs text-muted-foreground">Imágenes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">4.4 GB</p>
                <p className="text-xs text-muted-foreground">Base de datos</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Activity size={20} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Estado del Sistema
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Servidor Principal", status: "Operativo" },
              { label: "Base de Datos", status: "Operativo" },
              { label: "API Gateway", status: "Operativo" },
              { label: "Almacenamiento", status: "Operativo" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="rounded-xl bg-card p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${typeColors[activity.type]}`}
              >
                <Database size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.details}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
