import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ConcertPage({
  params,
}: PageProps<"/concert/[id]">) {
  const { id } = await params;

  return (
    <>
      <ScreenHeader
        titre="Fiche concert"
        sousTitre="Notes par critère, setlist, avant/après"
        retour={{ href: "/", label: "Accueil" }}
      />
      <EmptyState
        titre="Ce concert n'existe pas encore"
        explication="Les fiches détaillées s'ouvriront depuis ton fil, une fois que tu auras enregistré des concerts."
        action={{ href: "/ajouter", label: "Ajouter un concert" }}
      />
      <p className="text-text-muted mt-6 text-center font-mono text-[10px]">
        identifiant demandé : {id}
      </p>
    </>
  );
}
