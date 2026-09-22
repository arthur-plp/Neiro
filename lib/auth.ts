import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * L'utilisateur connecté, ou une redirection vers la connexion.
 *
 * `getUser()` et non `getSession()` : le premier valide le jeton auprès de
 * Supabase, le second se contente de lire un cookie. Sur une décision
 * d'accès, la différence compte.
 *
 * `cache()` déduplique l'appel à l'échelle d'une requête : le layout et les
 * pages peuvent l'appeler chacun sans multiplier les allers-retours.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  return user;
});

/**
 * Le profil applicatif de l'utilisateur connecté.
 *
 * Il est lu en base et non déduit de la session : c'est ce qui vérifie au
 * passage que le trigger de création de profil a fait son travail et que la
 * politique de lecture de `profiles` fonctionne.
 */
export const getProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return data;
});

/** Initiale affichée dans la pastille d'avatar. */
export function initiale(nom: string | null | undefined) {
  const propre = nom?.trim();
  return propre ? propre.charAt(0).toUpperCase() : "?";
}
