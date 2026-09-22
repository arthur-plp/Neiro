import { ScreenHeader } from "@/components/nav/screen-header";
import { AddButton } from "@/components/nav/add-button";
import { EmptyState } from "@/components/ui/empty-state";

export default function BilletsPage() {
  return (
    <>
      <ScreenHeader
        titre="Billets"
        sousTitre="À venir et passés, consultables hors-ligne"
      />
      <EmptyState
        titre="Aucun billet enregistré"
        explication="Importe le PDF reçu à l'achat : il restera consultable ici, même sans réseau à l'entrée de la salle."
        action={{ href: "/ajouter", label: "Importer un billet" }}
      />
      <AddButton />
    </>
  );
}
