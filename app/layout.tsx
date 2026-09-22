import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neiro",
  description: "Journal personnel de concerts",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
