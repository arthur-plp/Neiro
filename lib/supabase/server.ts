import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour les Server Components et les route handlers.
 *
 * Il lit la session dans les cookies et n'emploie, lui aussi, que la clé
 * publique : le serveur est donc soumis aux mêmes politiques que le
 * navigateur. La clé `service_role`, qui contourne la Row Level Security,
 * n'est utilisée nulle part dans le projet (décision D3).
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY est absente. Copie .env.example en .env.local et renseigne les valeurs de ton projet Supabase.",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Écrire un cookie depuis un Server Component lève une erreur.
          // C'est sans conséquence tant que le rafraîchissement de session
          // est assuré par un middleware — ce que l'étape 3 mettra en place.
        }
      },
    },
  });
}
