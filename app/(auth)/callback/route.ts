import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Ouvre la session à partir du lien reçu par e-mail, puis redirige.
 *
 * Un route handler et non une page (décision D4) : il n'y a rien à afficher,
 * et une page ferait clignoter un écran intermédiaire entre l'e-mail et
 * l'accueil.
 *
 * Deux formes de lien sont acceptées, parce que Supabase en produit deux
 * selon qui a initié la demande :
 *
 * - `?code=` — flux PKCE, quand c'est le navigateur qui a demandé le lien.
 *   C'est le cas nominal de l'écran de connexion.
 * - `?token_hash=&type=` — vérification côté serveur, la forme que produisent
 *   les liens émis hors navigateur et les gabarits d'e-mail utilisant
 *   `{{ .TokenHash }}`.
 *
 * Ne traiter que la première laisserait une panne silencieuse : le lien
 * atterrirait sur la connexion avec un message d'expiration, alors qu'il
 * était parfaitement valide.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const suite = searchParams.get("next") ?? "/";
  const echec = `${origin}/connexion?erreur=lien`;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(error ? echec : `${origin}${suite}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    return NextResponse.redirect(error ? echec : `${origin}${suite}`);
  }

  // Lien altéré, tronqué, ou déjà consommé : l'écran de connexion propose
  // d'en redemander un.
  return NextResponse.redirect(echec);
}
