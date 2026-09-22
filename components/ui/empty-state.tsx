import Link from "next/link";

import { cn } from "@/lib/cn";

type EmptyStateProps = {
  /** Ce qui manque, en une phrase courte. */
  titre: string;
  /** Pourquoi c'est vide et ce que ça deviendra une fois rempli. */
  explication: string;
  /** L'action qui remédie au vide. Omise quand il n'y en a pas. */
  action?: { href: string; label: string };
  className?: string;
};

/**
 * Un état vide est un état permanent du produit, pas un échafaudage : il
 * nomme ce qui manque et porte l'action qui y remédie. C'est ce qui remplace
 * les données de démonstration, lesquelles devraient être traquées et
 * supprimées plus tard — et dont un oubli passerait pour une vraie donnée.
 */
export function EmptyState({
  titre,
  explication,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border rounded-2xl border border-dashed px-5 py-10 text-center",
        className,
      )}
    >
      <p className="font-display text-[19px] tracking-[0.3px]">{titre}</p>
      <p className="text-text-muted mx-auto mt-2 max-w-[260px] text-[12.5px] leading-relaxed">
        {explication}
      </p>
      {action && (
        <Link
          href={action.href}
          className="border-accent-violet text-accent-violet mt-5 inline-block rounded-[20px] border px-4 py-2 text-[11px] font-semibold"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
