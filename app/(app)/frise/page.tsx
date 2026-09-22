import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function FrisePage() {
  return (
    <>
      <ScreenHeader
        titre="Frise"
        sousTitre="Tous tes concerts, année par année"
        retour={{ href: "/", label: "Accueil" }}
      />
      <EmptyState
        titre="La frise est vide"
        explication="Elle se remplira d'elle-même, groupée par année, dès que ton journal contiendra des concerts."
        action={{ href: "/ajouter", label: "Ajouter un concert" }}
      />
    </>
  );
}
