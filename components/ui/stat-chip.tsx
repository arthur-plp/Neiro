import { cn } from "@/lib/cn";

type StatChipProps = {
  /** Le chiffre mis en avant. */
  value: string | number;
  /** Le libellé sous le chiffre, rendu en capitales. */
  label: string;
  className?: string;
};

export function StatChip({ value, label, className }: StatChipProps) {
  return (
    <div
      className={cn(
        "bg-surface-alt border-border flex-1 rounded-2xl border px-2.5 py-3 text-center",
        className,
      )}
    >
      <div className="font-display text-accent-amber text-[22px] leading-none">
        {value}
      </div>
      <div className="text-text-muted mt-1 text-[10px] tracking-[0.5px] uppercase">
        {label}
      </div>
    </div>
  );
}
