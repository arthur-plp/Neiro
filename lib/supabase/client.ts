import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur.
 *
 * Il porte la session de l'utilisateur et n'emploie que la clé publique : ses
 * requêtes sont donc soumises à la Row Level Security, ce qui est exactement
 * le rôle de cette clé. C'est ce client que TanStack Query utilisera à partir
 * de l'étape 4 (décision D3).
 */
export function createClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  // Les variables NEXT_PUBLIC_ sont remplacées à la compilation : on les lit
  // nommément plutôt que par index, sans quoi le remplacement n'a pas lieu.
  const value =
    name === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      `${name} est absente. Copie .env.example en .env.local et renseigne les valeurs de ton projet Supabase.`,
    );
  }
  return value;
}
