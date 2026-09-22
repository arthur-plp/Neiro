import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProfilAmiPage({
  params,
}: PageProps<"/amis/[id]">) {
  const { id } = await params;

  return (
    <>
      <ScreenHeader
        titre="Profil d'un ami"
        sousTitre="Les concerts que vous avez vécus ensemble"
        retour={{ href: "/profil", label: "Profil" }}
      />
      <EmptyState
        titre="Le volet social arrive plus tard"
        explication="Consulter le profil d'un ami et les concerts partagés suppose des amitiés et des compagnons, qui font l'objet d'une étape ultérieure."
      />
      <p className="text-text-muted mt-6 text-center font-mono text-[10px]">
        identifiant demandé : {id}
      </p>
    </>
  );
}
