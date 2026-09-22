import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(auth)/connexion/login-form";
import { createClient } from "@/lib/supabase/server";

const MESSAGES: Record<string, string> = {
  lien: "Ce lien n'est plus valable — il a déjà servi, ou il a expiré. Demande-en un nouveau, c'est immédiat.",
  session:
    "La connexion n'a pas pu aboutir. Demande un nouveau lien et réessaie.",
};

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Un utilisateur déjà connecté n'a rien à faire ici.
  if (user) redirect("/");

  const params = await searchParams;
  const erreur = typeof params.erreur === "string" ? params.erreur : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[390px] flex-col justify-center px-5 py-12">
      <div className="mb-10 text-center">
        <p className="font-display from-accent-hot to-accent-amber bg-linear-to-r/srgb bg-clip-text text-[34px] tracking-[1px] text-transparent">
          NEIRO
        </p>
        <p className="text-text-muted -mt-1 text-[11px]">
          Ton journal de concerts
        </p>
      </div>

      <LoginForm messageInitial={erreur ? MESSAGES[erreur] : undefined} />
    </main>
  );
}
