"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/navbar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/admin/login")
        return
      }

      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .eq("activo", true)
        .single()

      if (error || !data) {
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }

      setAuthorized(true)
    }

    checkAdmin()
  }, [router])

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar showClientButtons />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="ml-4 font-semibold text-foreground">Admin Panel</span>
        </div>
                <main className="flex-1 p-4 lg:p-6 lg:max-w-7xl lg:mx-auto pt-24">{children}</main>
       </div>
    </div>
  )
}
