import { InteractivePreview } from "@/app/design-system/interactive-preview";
import { PalettePreview } from "@/app/design-system/palette-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { GenreTag } from "@/components/concert/genre-tag";
import { TicketStub } from "@/components/concert/ticket-stub";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatChip } from "@/components/ui/stat-chip";
import { ACCENTS } from "@/lib/accent";

/**
 * Page de vérification du design system.
 *
 * Elle n'appartient pas au produit et n'est volontairement liée depuis
 * aucune navigation : elle existe pour être ouverte à côté de
 * `neiro-maquette.html` et rendre tout écart immédiatement visible.
 */

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-text-muted mb-4 text-xs font-semibold tracking-[1.2px] uppercase">
        {titre}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[390px] px-5 py-12">
      <h1 className="font-display text-3xl tracking-[0.5px]">Design system</h1>
      <p className="text-text-muted mt-1 mb-10 text-xs">
        Référence de fidélité — à comparer avec neiro-maquette.html
      </p>

      <Section titre="Palette">
        <PalettePreview />
      </Section>

      <Section titre="Typographies">
        <div className="space-y-4">
          <div>
            <p className="font-display text-[30px] tracking-[0.5px]">
              NEIRO 2026
            </p>
            <p className="text-text-muted font-mono text-[10px]">
              display · Anton · titres, logo, grands chiffres
            </p>
          </div>
          <div>
            <p className="text-sm">
              Le timbre est ce qui rend chaque interprétation unique.
            </p>
            <p className="text-text-muted font-mono text-[10px]">
              corps · Space Grotesk · texte d&apos;interface
            </p>
          </div>
          <div>
            <p className="font-mono text-sm">15 MAR 2026 · 20:30</p>
            <p className="text-text-muted font-mono text-[10px]">
              mono · IBM Plex Mono · dates et données
            </p>
          </div>
        </div>
      </Section>

      <Section titre="Puces de statistique">
        <div className="flex gap-2.5">
          <StatChip value={47} label="Concerts" />
          <StatChip value={31} label="Artistes" />
          <StatChip value={12} label="Cette année" />
        </div>
      </Section>

      <Section titre="Tags de genre">
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <GenreTag key={a} genre={`Genre ${a}`} accent={a} />
          ))}
        </div>
      </Section>

      <Section titre="Éléments interactifs">
        <InteractivePreview />
      </Section>

      <Section titre="Bouton principal">
        <PrimaryButton>Enregistrer le concert</PrimaryButton>
      </Section>

      <Section titre="État vide">
        <EmptyState
          titre="Aucun concert pour l'instant"
          explication="Ton fil se remplira à mesure que tu noteras les concerts que tu vois."
          action={{ href: "/ajouter", label: "Ajouter mon premier concert" }}
        />
        <p className="text-text-muted mt-4 text-[11px]">
          Sans action, quand il n&apos;y a rien à proposer :
        </p>
        <EmptyState
          className="mt-2"
          titre="Le volet social arrive plus tard"
          explication="Amitiés et compagnons de concert font l'objet d'une étape ultérieure."
        />
      </Section>

      <Section titre="Souches de billet">
        <p className="text-text-muted mb-4 text-[11px]">
          Posées sur un fond <span className="font-mono">surface</span>, comme
          l&apos;exigent leurs encoches.
        </p>
        <div className="bg-surface border-border rounded-2xl border p-4">
          <div className="space-y-4">
            <TicketStub
              artist="NOVA WAVE"
              venue="Le Zénith · Paris"
              date="15 MAR 2026"
              genre="Électro-pop"
              accent="violet"
              rating={5}
            />
            <TicketStub
              artist="LES ARCHIVES"
              venue="La Cigale · Paris"
              date="02 FÉV 2026"
              genre="Rock indé"
              accent="hot"
              rating={4}
            />
            <TicketStub
              artist="MIRAGE SOUND"
              venue="Le Trabendo · Paris"
              date="18 JAN 2026"
              genre="Électro"
              accent="teal"
              rating={3}
            />
          </div>
        </div>

        <p className="text-text-muted mt-6 mb-4 text-[11px]">
          Même genre, deux couleurs différentes — la couleur est décorative et
          reçue en prop, jamais déduite du genre.
        </p>
        <div className="bg-surface border-border rounded-2xl border p-4">
          <div className="space-y-4">
            <TicketStub
              artist="PETRA & THE WAVES"
              venue="Le Bataclan · Paris"
              date="09 NOV 2025"
              genre="Rock"
              accent="amber"
            />
            <TicketStub
              artist="VOLT"
              venue="L'Olympia · Paris"
              date="21 SEP 2025"
              genre="Rock"
              accent="teal"
            />
          </div>
        </div>

        <p className="text-text-muted mt-6 mb-4 text-[11px]">
          Texte trop long — tronqué dans la carte, sans débordement.
        </p>
        <div className="bg-surface border-border rounded-2xl border p-4">
          <TicketStub
            artist="UN NOM D'ARTISTE VOLONTAIREMENT INTERMINABLE"
            venue="Une salle au nom tout aussi démesuré · Quelque part très loin"
            date="01 JAN 2027"
            genre="Indé"
            accent="violet"
            rating={2}
          />
        </div>
      </Section>
    </main>
  );
}
