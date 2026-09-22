"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type Destination = {
  href: string;
  label: string;
  icone: React.ReactNode;
};

const DESTINATIONS: Destination[] = [
  {
    href: "/",
    label: "Accueil",
    icone: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    href: "/classement",
    label: "Classement",
    icone: (
      <>
        <path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 01-12 0V4z" />
        <path d="M6 6H3v2a4 4 0 004 4M18 6h3v2a4 4 0 01-4 4" />
      </>
    ),
  },
  {
    href: "/billets",
    label: "Billets",
    icone: (
      <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z" />
    ),
  },
  {
    href: "/profil",
    label: "Profil",
    icone: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
];

export function BottomNav() {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="border-border fixed inset-x-0 bottom-0 z-10 mx-auto flex h-[78px] max-w-[390px] border-t bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] pb-3.5 backdrop-blur-xl"
    >
      {DESTINATIONS.map((d) => {
        // L'accueil ne doit pas rester actif sur toutes les sous-routes.
        const actif = d.href === "/" ? chemin === "/" : chemin.startsWith(d.href);
        return (
          <Link
            key={d.href}
            href={d.href}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 text-[10px]",
              actif ? "text-accent-amber" : "text-text-muted",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="size-5"
              aria-hidden
            >
              {d.icone}
            </svg>
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}
