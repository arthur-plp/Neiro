import { ScreenHeader } from "@/components/nav/screen-header";
import { AddButton } from "@/components/nav/add-button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClassementPage() {
  return (
    <>
      <ScreenHeader
        titre="Classement"
        sousTitre="Tes concerts, du meilleur au reste"
      />
      <EmptyState
        titre="Rien à classer pour l'instant"
        explication="Un classement se construit à partir des concerts que tu as notés. Note-en un et il apparaîtra ici."
        action={{ href: "/ajouter", label: "Noter un concert" }}
      />
      <AddButton />
    </>
  );
}
