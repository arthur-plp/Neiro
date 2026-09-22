import type { Metadata } from "next";
import { Anton, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

/* next/font télécharge ces fichiers au build et les sert depuis l'origine
   de l'application : aucune requête vers Google Fonts à l'exécution, ce
   qui est une condition de l'exigence hors-ligne. */

// Anton n'existe qu'en graisse 400 — ses titres tirent leur présence de la
// taille et du condensé, pas d'une graisse élevée.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

// Police variable : next/font refuse un `weight` explicite, la plage
// 400–700 est couverte nativement.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neiro",
  description: "Journal personnel de concerts",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${anton.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
