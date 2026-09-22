import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function RecapPage() {
  return (
    <>
      <ScreenHeader
        titre="Ton année en concerts"
        sousTitre="Le récap de l'année écoulée"
        retour={{ href: "/profil", label: "Profil" }}
      />
      <EmptyState
        titre="Pas encore de quoi faire un récap"
        explication="Le récap annuel se compose de tes concerts de l'année. Reviens quand tu en auras quelques-uns."
        action={{ href: "/ajouter", label: "Ajouter un concert" }}
      />
    </>
  );
}
