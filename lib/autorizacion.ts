import { createClient } from "@supabase/supabase-js"

/**
 * Autenticación del personal interno (admins y empleados).
 *
 * Las rutas que solo admiten personal deben validar el token de sesión que
 * envía el navegador y comprobar el rol en la base de datos. Devuelve un
 * cliente con service role ya listo para operar, porque el RLS de Supabase
 * solo contempla a los clientes finales.
 */

export type PerfilInterno = {
  tipo: "admin" | "empleado"
  id: number
  nombre: string
  email: string
}

type ResultadoOk = {
  ok: true
  userId: string
  email: string
  perfil: PerfilInterno
  /** Cliente con service role. Se tipa como `any` por el mismo motivo que el
   *  resto de rutas del proyecto: el genérico de `createClient` no es
   *  asignable entre el cliente de auth y el de service role. */
  supabase: any
}

type ResultadoError = {
  ok: false
  status: 401 | 403 | 500
  message: string
}

export async function autenticarInterno(
  request: Request
): Promise<ResultadoOk | ResultadoError> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey || !serviceKey) {
    return { ok: false, status: 500, message: "Configuración de Supabase incompleta." }
  }

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")

  if (!token) {
    return { ok: false, status: 401, message: "No autenticado." }
  }

  const supabaseAuth = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token)

  if (userError || !user) {
    return { ok: false, status: 401, message: "Sesión inválida o vencida." }
  }

  const supabase = createClient(url, serviceKey)

  const { data: admin } = await supabase
    .from("admins")
    .select("id, nombre, email")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle()

  if (admin) {
    return {
      ok: true,
      userId: user.id,
      email: user.email || admin.email,
      perfil: { tipo: "admin", id: admin.id, nombre: admin.nombre, email: admin.email },
      supabase,
    }
  }

  const { data: empleado } = await supabase
    .from("empleados")
    .select("id, nombre, email")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle()

  if (empleado) {
    return {
      ok: true,
      userId: user.id,
      email: user.email || empleado.email,
      perfil: { tipo: "empleado", id: empleado.id, nombre: empleado.nombre, email: empleado.email },
      supabase,
    }
  }

  return {
    ok: false,
    status: 403,
    message: "Tu usuario no es un administrador ni un empleado activo.",
  }
}