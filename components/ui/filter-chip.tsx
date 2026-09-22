"use client";

import { cn } from "@/lib/cn";

type FilterChipProps = {
  label: string;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function FilterChip({
  label,
  active = false,
  onSelect,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "rounded-[20px] border px-[13px] py-[7px] text-[11px]",
        active
          ? "bg-accent-violet border-accent-violet text-white"
          : "bg-surface-alt border-border text-text-muted",
        className,
      )}
    >
      {label}
    </button>
  );
}
