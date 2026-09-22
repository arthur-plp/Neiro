"use client";

import { cn } from "@/lib/cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  /** Option sélectionnée — le composant ne garde aucun état, il le remonte. */
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "bg-surface-alt border-border flex rounded-[14px] border p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-[10px] py-[9px] text-xs font-semibold",
              selected ? "bg-accent-violet text-white" : "text-text-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
