import { redirect } from "next/navigation";

import { ScreenHeader } from "@/components/nav/screen-header";
import { AddButton } from "@/components/nav/add-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProfile, initiale, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilPage() {
  const user = await requireUser();
  const profil = await getProfile();

  async function seDeconnecter() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/connexion");
  }

  return (
    <>
      <ScreenHeader titre="Profil" />

      <div className="mt-2 mb-6 flex items-center gap-3.5">
        <div className="font-display from-accent-violet to-accent-hot flex size-[60px] items-center justify-center rounded-full bg-linear-to-br/srgb text-xl">
          {initiale(profil?.display_name)}
        </div>
        <div className="min-w-0">
          <p className="font-display truncate text-[19px]">
            {profil?.display_name ?? "Profil"}
          </p>
          <p className="text-text-muted truncate text-xs">{user.email}</p>
        </div>
      </div>

      <EmptyState
        titre="Tes statistiques arrivent"
        explication="Concerts vus, artistes, records et badges se calculeront à partir de ton journal, dès qu'il contiendra quelque chose."
        action={{ href: "/ajouter", label: "Ajouter un concert" }}
      />

      <form action={seDeconnecter} className="mt-8">
        <button
          type="submit"
          className="border-border text-text-muted w-full rounded-xl border py-3.5 text-[13px]"
        >
          Se déconnecter
        </button>
      </form>
      <AddButton />
    </>
  );
}
