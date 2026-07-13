import { createClient, AuthError } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

const REFRESH_TOKEN_ERROR = /refresh token/i

// Obtiene el usuario autenticado o null. Si el refresh token ya no es válido
// en el servidor ("Invalid Refresh Token: Refresh Token Not Found" por sesión
// revocada o token ya consumido/rotado), limpia la sesión local para que el
// usuario pueda volver a iniciar sesión en lugar de quedar atrapado con un
// token muerto que dispara el error en consola.
export async function getValidUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    if (error instanceof AuthError && REFRESH_TOKEN_ERROR.test(error.message)) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => {})
    }
    return null
  }

  return data.user
}
