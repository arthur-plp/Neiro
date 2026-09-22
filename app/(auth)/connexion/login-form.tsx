"use client";

import { useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { createClient } from "@/lib/supabase/client";

type Etat = "saisie" | "envoi" | "envoye" | "panne";

export function LoginForm({ messageInitial }: { messageInitial?: string }) {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>("saisie");
  const [attente, setAttente] = useState<string | null>(null);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (etat === "envoi") return;
    setEtat("envoi");
    setAttente(null);

    const supabase = createClient();
    const { error } = await supabase.auth
      .signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      })
      .catch(() => ({ error: { status: 0, message: "réseau" } }));

    // Deux familles d'erreurs, à traiter différemment.
    //
    // Celles qui portent sur l'adresse — inconnue, refusée, déjà utilisée —
    // sont tues : les distinguer d'un succès transformerait cet écran en
    // outil permettant de savoir qui utilise l'application.
    //
    // Celles qui portent sur l'infrastructure — SMTP en panne, service
    // injoignable, quota dépassé — ne disent rien de l'utilisateur et tout
    // du service. Les taire laisse quelqu'un attendre un e-mail qui n'est
    // jamais parti, ce qui est exactement ce qu'il ne faut pas faire.
    const statut = error && "status" in error ? Number(error.status) : 0;

    if (error && (statut === 0 || statut >= 500)) {
      setEtat("panne");
      return;
    }
    if (error && statut === 429) {
      setAttente(
        "Trop de demandes en peu de temps. Attends une minute avant de réessayer.",
      );
      setEtat("saisie");
      return;
    }

    setEtat("envoye");
  }

  if (etat === "panne") {
    return (
      <div className="border-accent-hot rounded-2xl border bg-[color-mix(in_srgb,var(--color-accent-hot)_10%,transparent)] p-5 text-center">
        <p className="font-display text-accent-hot text-xl">
          L&apos;envoi est en panne
        </p>
        <p className="text-text-muted mt-3 text-[13px] leading-relaxed">
          Aucun e-mail n&apos;a pu partir. Ce n&apos;est pas ton adresse qui est
          en cause : le service d&apos;envoi ne répond pas. Inutile d&apos;aller
          fouiller tes indésirables.
        </p>
        <button
          type="button"
          onClick={() => setEtat("saisie")}
          className="text-accent-violet mt-4 text-[12px] font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
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
      {attente && (
        <p className="border-accent-amber text-accent-amber mb-5 rounded-xl border bg-[color-mix(in_srgb,var(--color-accent-amber)_12%,transparent)] px-4 py-3 text-[12px] leading-relaxed">
          {attente}
        </p>
      )}

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
