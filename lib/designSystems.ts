export interface DesignSystem {
  id: string;
  label: string;
  description: string;
  swatches: string[];
  variables: Record<string, string>;
}

export const designSystems: DesignSystem[] = [
  // ─── Midnight ────────────────────────────────────────────────────
  {
    id: "midnight",
    label: "Midnight",
    description: "Deep blue-black, subtle glow",
    swatches: [
      "oklch(0.13 0.02 265)",
      "oklch(0.65 0.2 260)",
      "oklch(0.35 0.06 265)",
      "oklch(0.94 0.01 265)",
    ],
    variables: {
      "--background": "oklch(0.13 0.02 265)",
      "--foreground": "oklch(0.94 0.01 265)",
      "--card": "oklch(0.17 0.025 265)",
      "--card-foreground": "oklch(0.94 0.01 265)",
      "--popover": "oklch(0.17 0.025 265)",
      "--popover-foreground": "oklch(0.94 0.01 265)",
      "--primary": "oklch(0.65 0.2 260)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--secondary": "oklch(0.22 0.03 265)",
      "--secondary-foreground": "oklch(0.94 0.01 265)",
      "--muted": "oklch(0.22 0.03 265)",
      "--muted-foreground": "oklch(0.62 0.02 265)",
      "--accent": "oklch(0.25 0.04 265)",
      "--accent-foreground": "oklch(0.94 0.01 265)",
      "--destructive": "oklch(0.65 0.25 27)",
      "--border": "oklch(0.28 0.03 265)",
      "--input": "oklch(0.24 0.03 265)",
      "--ring": "oklch(0.65 0.2 260)",
      "--radius": "0.5rem",
    },
  },

  // ─── Sunrise ─────────────────────────────────────────────────────
  {
    id: "sunrise",
    label: "Sunrise",
    description: "Warm oranges and soft pinks",
    swatches: [
      "oklch(0.98 0.01 55)",
      "oklch(0.68 0.19 45)",
      "oklch(0.82 0.1 10)",
      "oklch(0.22 0.03 30)",
    ],
    variables: {
      "--background": "oklch(0.98 0.01 55)",
      "--foreground": "oklch(0.22 0.03 30)",
      "--card": "oklch(1 0.005 50)",
      "--card-foreground": "oklch(0.22 0.03 30)",
      "--popover": "oklch(1 0.005 50)",
      "--popover-foreground": "oklch(0.22 0.03 30)",
      "--primary": "oklch(0.68 0.19 45)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--secondary": "oklch(0.94 0.04 50)",
      "--secondary-foreground": "oklch(0.3 0.04 30)",
      "--muted": "oklch(0.94 0.04 50)",
      "--muted-foreground": "oklch(0.52 0.04 40)",
      "--accent": "oklch(0.88 0.08 10)",
      "--accent-foreground": "oklch(0.3 0.04 30)",
      "--destructive": "oklch(0.65 0.25 27)",
      "--border": "oklch(0.88 0.04 50)",
      "--input": "oklch(0.92 0.03 50)",
      "--ring": "oklch(0.68 0.19 45)",
      "--radius": "0.75rem",
    },
  },

  // ─── Arctic ──────────────────────────────────────────────────────
  {
    id: "arctic",
    label: "Arctic",
    description: "Cool whites, icy blues",
    swatches: [
      "oklch(0.97 0.01 215)",
      "oklch(0.62 0.18 225)",
      "oklch(0.78 0.08 210)",
      "oklch(0.22 0.03 225)",
    ],
    variables: {
      "--background": "oklch(0.97 0.01 215)",
      "--foreground": "oklch(0.22 0.03 225)",
      "--card": "oklch(0.99 0.005 210)",
      "--card-foreground": "oklch(0.22 0.03 225)",
      "--popover": "oklch(0.99 0.005 210)",
      "--popover-foreground": "oklch(0.22 0.03 225)",
      "--primary": "oklch(0.62 0.18 225)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--secondary": "oklch(0.92 0.03 215)",
      "--secondary-foreground": "oklch(0.25 0.03 225)",
      "--muted": "oklch(0.92 0.03 215)",
      "--muted-foreground": "oklch(0.5 0.04 225)",
      "--accent": "oklch(0.88 0.05 210)",
      "--accent-foreground": "oklch(0.25 0.03 225)",
      "--destructive": "oklch(0.65 0.25 27)",
      "--border": "oklch(0.87 0.04 215)",
      "--input": "oklch(0.9 0.03 215)",
      "--ring": "oklch(0.62 0.18 225)",
      "--radius": "0.5rem",
    },
  },

  // ─── Forest ──────────────────────────────────────────────────────
  {
    id: "forest",
    label: "Forest",
    description: "Deep greens, earth tones",
    swatches: [
      "oklch(0.12 0.025 145)",
      "oklch(0.7 0.22 145)",
      "oklch(0.35 0.06 120)",
      "oklch(0.92 0.03 145)",
    ],
    variables: {
      "--background": "oklch(0.12 0.025 145)",
      "--foreground": "oklch(0.92 0.03 145)",
      "--card": "oklch(0.16 0.03 145)",
      "--card-foreground": "oklch(0.92 0.03 145)",
      "--popover": "oklch(0.16 0.03 145)",
      "--popover-foreground": "oklch(0.92 0.03 145)",
      "--primary": "oklch(0.7 0.22 145)",
      "--primary-foreground": "oklch(0.1 0.02 145)",
      "--secondary": "oklch(0.2 0.03 145)",
      "--secondary-foreground": "oklch(0.92 0.03 145)",
      "--muted": "oklch(0.2 0.03 145)",
      "--muted-foreground": "oklch(0.6 0.05 145)",
      "--accent": "oklch(0.2 0.03 145)",
      "--accent-foreground": "oklch(0.92 0.03 145)",
      "--destructive": "oklch(0.65 0.25 27)",
      "--border": "oklch(0.28 0.04 145)",
      "--input": "oklch(0.22 0.03 145)",
      "--ring": "oklch(0.7 0.22 145)",
      "--radius": "0.375rem",
    },
  },

  // ─── Lavender ────────────────────────────────────────────────────
  {
    id: "lavender",
    label: "Lavender",
    description: "Soft purples, dreamy",
    swatches: [
      "oklch(0.97 0.02 295)",
      "oklch(0.58 0.2 295)",
      "oklch(0.82 0.1 310)",
      "oklch(0.28 0.05 295)",
    ],
    variables: {
      "--background": "oklch(0.97 0.02 295)",
      "--foreground": "oklch(0.25 0.05 295)",
      "--card": "oklch(0.99 0.01 295)",
      "--card-foreground": "oklch(0.25 0.05 295)",
      "--popover": "oklch(0.99 0.01 295)",
      "--popover-foreground": "oklch(0.25 0.05 295)",
      "--primary": "oklch(0.58 0.2 295)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--secondary": "oklch(0.91 0.05 295)",
      "--secondary-foreground": "oklch(0.3 0.05 295)",
      "--muted": "oklch(0.91 0.05 295)",
      "--muted-foreground": "oklch(0.52 0.05 295)",
      "--accent": "oklch(0.85 0.08 310)",
      "--accent-foreground": "oklch(0.3 0.05 295)",
      "--destructive": "oklch(0.65 0.25 27)",
      "--border": "oklch(0.86 0.05 295)",
      "--input": "oklch(0.9 0.04 295)",
      "--ring": "oklch(0.58 0.2 295)",
      "--radius": "1rem",
    },
  },

  // ─── Monochrome ──────────────────────────────────────────────────
  {
    id: "monochrome",
    label: "Monochrome",
    description: "Pure black and white",
    swatches: [
      "oklch(0.1 0 0)",
      "oklch(0.4 0 0)",
      "oklch(0.75 0 0)",
      "oklch(0.98 0 0)",
    ],
    variables: {
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.1 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.1 0 0)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.1 0 0)",
      "--primary": "oklch(0.1 0 0)",
      "--primary-foreground": "oklch(0.98 0 0)",
      "--secondary": "oklch(0.94 0 0)",
      "--secondary-foreground": "oklch(0.15 0 0)",
      "--muted": "oklch(0.94 0 0)",
      "--muted-foreground": "oklch(0.45 0 0)",
      "--accent": "oklch(0.94 0 0)",
      "--accent-foreground": "oklch(0.15 0 0)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.88 0 0)",
      "--input": "oklch(0.88 0 0)",
      "--ring": "oklch(0.4 0 0)",
      "--radius": "0.375rem",
    },
  },
];

export function getDesignSystem(id: string): DesignSystem | undefined {
  return designSystems.find((ds) => ds.id === id);
}
