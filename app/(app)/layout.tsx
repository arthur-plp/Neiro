import type { ReactNode } from "react";

import { BottomNav } from "@/components/nav/bottom-nav";
import { requireUser } from "@/lib/auth";

/**
 * Tout l'intérieur de l'application passe par ici.
 *
 * La vérification de session est faite dans ce layout et nulle part ailleurs
 * (décision D2) : elle s'exécute avant le rendu du moindre enfant, et une
 * seule règle d'accès vaut mieux que la même règle écrite à deux endroits.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  return (
    <div className="mx-auto min-h-dvh max-w-[390px] px-5 pt-14 pb-[100px]">
      {children}
      <BottomNav />
    </div>
  );
}
