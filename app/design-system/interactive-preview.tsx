"use client";

import { useState } from "react";

import { FilterChip } from "@/components/ui/filter-chip";
import { SegmentedControl } from "@/components/ui/segmented-control";

const FILTRES = ["Tous les temps", "Cette année", "Par genre"] as const;

const ONGLETS = [
  { value: "mes-concerts", label: "Mes concerts" },
  { value: "entre-amis", label: "Entre amis" },
] as const;

type Onglet = (typeof ONGLETS)[number]["value"];

export function InteractivePreview() {
  const [filtre, setFiltre] = useState<string>(FILTRES[0]);
  const [onglet, setOnglet] = useState<Onglet>("mes-concerts");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-text-muted mb-3 text-[11px] tracking-[1.2px] uppercase">
          Chips de filtre
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTRES.map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={f === filtre}
              onSelect={() => setFiltre(f)}
            />
          ))}
        </div>
        <p className="text-text-muted mt-2 font-mono text-[10px]">
          sélection : {filtre}
        </p>
      </div>

      <div>
        <p className="text-text-muted mb-3 text-[11px] tracking-[1.2px] uppercase">
          Contrôle segmenté
        </p>
        <SegmentedControl
          options={ONGLETS}
          value={onglet}
          onChange={setOnglet}
        />
        <p className="text-text-muted mt-2 font-mono text-[10px]">
          sélection : {onglet}
        </p>
      </div>
    </div>
  );
}
