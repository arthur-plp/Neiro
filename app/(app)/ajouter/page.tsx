import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function AjouterPage() {
  return (
    <>
      <ScreenHeader
        titre="Ajouter un concert"
        sousTitre="Saisie manuelle ou import d'un billet PDF"
        retour={{ href: "/", label: "Accueil" }}
      />
      <EmptyState
        titre="Le formulaire arrive à l'étape suivante"
        explication="La saisie d'un concert — artiste, salle, notes par critère, setlist — fait l'objet de la prochaine étape de développement."
      />
    </>
  );
}
