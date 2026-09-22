import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type PrimaryButtonProps = ComponentPropsWithoutRef<"button">;

export function PrimaryButton({
  className,
  children,
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        // `/srgb` est délibéré : Tailwind v4 interpole les dégradés en oklab
        // par défaut, ce qui décale les teintes intermédiaires par rapport au
        // linear-gradient sRGB de la maquette.
        "from-accent-hot to-accent-amber font-display w-full rounded-[14px] bg-linear-to-r/srgb p-[15px] text-[15px] tracking-[0.5px]",
        // Brun très sombre repris de la maquette : c'est la seule couleur de
        // texte lisible sur le dégradé rose→ambre. Elle ne fait pas partie
        // de la palette, elle n'appartient qu'à ce bouton.
        "text-[#17101a]",
        // Le contour violet global disparaîtrait sur le dégradé.
        "focus-visible:outline-[length:3px] focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
