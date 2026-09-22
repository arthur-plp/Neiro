import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit le jeton de session et réécrit les cookies.
 *
 * C'est tout ce que fait le middleware (décision D2) : il ne décide jamais
 * d'un accès. La protection des routes vit dans le layout du groupe `(app)`,
 * où `getUser()` valide le jeton auprès de Supabase au lieu de faire
 * confiance au contenu d'un cookie.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Cet appel est ce qui déclenche le rafraîchissement : ne pas le retirer
  // sous prétexte que son résultat n'est pas utilisé ici.
  await supabase.auth.getUser();

  return response;
}
