"use client";

import { useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { createClient } from "@/lib/supabase/client";

type Etat = "saisie" | "envoi" | "envoye";

export function LoginForm({ messageInitial }: { messageInitial?: string }) {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>("saisie");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (etat === "envoi") return;
    setEtat("envoi");

    const supabase = createClient();
    // La réponse est volontairement ignorée : le message affiché est le même
    // que l'adresse soit connue ou non, et que l'envoi aboutisse ou non.
    // Sans cela, l'écran de connexion dirait qui utilise l'application.
    await supabase.auth
      .signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      })
      .catch(() => undefined);

    setEtat("envoye");
  }

  if (etat === "envoye") {
    return (
      <div className="bg-surface-alt border-border rounded-2xl border p-5 text-center">
        <p className="font-display text-accent-amber text-xl">Regarde tes mails</p>
        <p className="text-text-muted mt-3 text-[13px] leading-relaxed">
          Si un compte peut être ouvert avec cette adresse, un lien de connexion
          vient d&apos;y être envoyé. Il est valable une seule fois.
        </p>
        <p className="text-text-muted mt-3 text-[11px]">
          Rien reçu ? Pense à regarder dans les indésirables.
        </p>
        <button
          type="button"
          onClick={() => setEtat("saisie")}
          className="text-accent-violet mt-4 text-[12px] font-semibold"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer}>
      {messageInitial && (
        <p className="border-accent-hot text-accent-hot mb-5 rounded-xl border bg-[color-mix(in_srgb,var(--color-accent-hot)_12%,transparent)] px-4 py-3 text-[12px] leading-relaxed">
          {messageInitial}
        </p>
      )}

      <label
        htmlFor="email"
        className="text-text-muted mb-1.5 block text-[11px] tracking-[0.6px] uppercase"
      >
        Ton adresse e-mail
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="toi@exemple.fr"
        className="bg-surface-alt border-border text-text placeholder:text-text-muted/60 mb-5 w-full rounded-xl border px-3.5 py-3 text-sm"
      />

      <PrimaryButton type="submit" disabled={etat === "envoi"}>
        {etat === "envoi" ? "Envoi…" : "Recevoir mon lien"}
      </PrimaryButton>

      <p className="text-text-muted mt-5 text-center text-[11px] leading-relaxed">
        Pas de mot de passe à retenir. Tu reçois un lien, tu le suis, tu es
        connecté.
      </p>
    </form>
  );
}
