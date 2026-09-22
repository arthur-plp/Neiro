import { ScreenHeader } from "@/components/nav/screen-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function RechercheProfilsPage() {
  return (
    <>
      <ScreenHeader
        titre="Trouver des amis"
        sousTitre="Cherche un profil pour l'ajouter"
        retour={{ href: "/profil", label: "Profil" }}
      />
      <EmptyState
        titre="La recherche de profils arrive plus tard"
        explication="Demandes d'ami, compagnons de concert et classement entre amis font l'objet d'une étape ultérieure."
      />
    </>
  );
}
