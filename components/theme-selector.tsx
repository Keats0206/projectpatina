"use client";

import { cn } from "@/lib/utils";
import type { DesignSystem } from "@/lib/designSystems";

// ─── Mini preview ────────────────────────────────────────────────

function MiniPreview({ variables }: { variables: Record<string, string> }) {
  return (
    <div
      className="h-full w-full overflow-hidden"
      style={variables as React.CSSProperties}
    >
      {/* Page bg */}
      <div
        className="h-full w-full flex flex-col"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Navbar strip */}
        <div
          className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="h-2 w-12 rounded-full"
            style={{ background: "var(--primary)" }}
          />
          <div className="flex gap-1.5">
            <div
              className="h-1.5 w-6 rounded-full"
              style={{ background: "var(--muted-foreground)", opacity: 0.5 }}
            />
            <div
              className="h-1.5 w-6 rounded-full"
              style={{ background: "var(--muted-foreground)", opacity: 0.5 }}
            />
          </div>
          <div
            className="h-5 w-10 rounded"
            style={{
              background: "var(--primary)",
              borderRadius: "var(--radius)",
            }}
          />
        </div>

        {/* Hero area */}
        <div className="flex flex-col items-center justify-center gap-2.5 flex-1 px-4 py-4">
          <div
            className="h-2 w-[70%] rounded-full"
            style={{ background: "var(--foreground)", opacity: 0.85 }}
          />
          <div
            className="h-1.5 w-[55%] rounded-full"
            style={{ background: "var(--foreground)", opacity: 0.85 }}
          />
          <div
            className="h-1.5 w-[45%] rounded-full"
            style={{ background: "var(--muted-foreground)", opacity: 0.6 }}
          />
          <div
            className="mt-1 h-6 w-20 rounded"
            style={{
              background: "var(--primary)",
              borderRadius: "var(--radius)",
            }}
          />
        </div>

        {/* Section area */}
        <div
          className="px-3 py-3 shrink-0"
          style={{ background: "var(--muted)" }}
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 rounded p-1.5 flex flex-col gap-1"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "calc(var(--radius) - 2px)",
                }}
              >
                <div
                  className="h-1.5 w-[70%] rounded-full"
                  style={{
                    background: "var(--foreground)",
                    opacity: 0.7,
                  }}
                />
                <div
                  className="h-1 w-full rounded-full"
                  style={{
                    background: "var(--muted-foreground)",
                    opacity: 0.4,
                  }}
                />
                <div
                  className="h-1 w-[80%] rounded-full"
                  style={{
                    background: "var(--muted-foreground)",
                    opacity: 0.4,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Swatch dot ──────────────────────────────────────────────────

function Swatch({ color }: { color: string }) {
  return (
    <div
      className="h-3.5 w-3.5 rounded-full border border-white/10 shrink-0"
      style={{ background: color }}
    />
  );
}

// ─── Theme card ──────────────────────────────────────────────────

interface ThemeCardProps {
  ds: DesignSystem;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ ds, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-xl border p-2 text-left transition-all hover:border-zinc-500",
        isSelected
          ? "border-white bg-zinc-800/80 ring-1 ring-white/20"
          : "border-zinc-700/60 bg-zinc-900/60"
      )}
    >
      {/* Mini preview */}
      <div className="relative h-[130px] w-full overflow-hidden rounded-lg border border-zinc-700/50">
        <MiniPreview variables={ds.variables} />
      </div>

      {/* Label + description */}
      <div className="px-0.5">
        <p className="text-[11px] font-semibold text-zinc-200 leading-none">
          {ds.label}
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-500 leading-snug">
          {ds.description}
        </p>
      </div>

      {/* Swatches */}
      <div className="flex items-center gap-1 px-0.5">
        {ds.swatches.map((color, i) => (
          <Swatch key={i} color={color} />
        ))}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-white flex items-center justify-center">
          <svg
            className="h-2.5 w-2.5 text-zinc-900"
            fill="none"
            viewBox="0 0 12 12"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 6l3 3 5-5"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── ThemeSelector ───────────────────────────────────────────────

interface ThemeSelectorProps {
  designSystems: DesignSystem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  currentCssVars?: Record<string, string>;
}

export function ThemeSelector({
  designSystems,
  selectedId,
  onSelect,
  currentCssVars,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      {/* AI-generated theme preview */}
      {currentCssVars && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            AI Generated
          </p>
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "group relative flex w-full flex-col gap-2.5 rounded-xl border p-2 text-left transition-all hover:border-zinc-500",
              selectedId === null
                ? "border-white bg-zinc-800/80 ring-1 ring-white/20"
                : "border-zinc-700/60 bg-zinc-900/60"
            )}
          >
            <div className="relative h-[100px] w-full overflow-hidden rounded-lg border border-zinc-700/50">
              <MiniPreview variables={currentCssVars} />
            </div>
            <div className="px-0.5">
              <p className="text-[11px] font-semibold text-zinc-200 leading-none">
                Default
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500 leading-snug">
                Theme applied by AI
              </p>
            </div>
            {selectedId === null && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                <svg
                  className="h-2.5 w-2.5 text-zinc-900"
                  fill="none"
                  viewBox="0 0 12 12"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 6l3 3 5-5"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Prebuilt systems */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Design Systems
        </p>
        <div className="grid grid-cols-2 gap-2">
          {designSystems.map((ds) => (
            <ThemeCard
              key={ds.id}
              ds={ds}
              isSelected={selectedId === ds.id}
              onSelect={() => onSelect(ds.id === selectedId ? null : ds.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
