import {
  componentManifest,
  defaultVariants,
  entriesForRole,
  type BlockType,
  type ManifestEntry,
  type SectionRole,
} from "./componentManifest";

export interface SectionInput {
  key: string;
  role: SectionRole;
  style?: string;
}

export interface ResolvedSection {
  key: string;
  type: BlockType;
  variant: string;
  label: string;
}

/**
 * Tokenize a style description into lowercase words for tag matching.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Score a manifest entry against a list of query tokens.
 * Returns the count of matched tags.
 */
function scoreEntry(entry: ManifestEntry, queryTokens: string[]): number {
  let score = 0;
  for (const token of queryTokens) {
    if (entry.tags.includes(token)) score += 2;
    if (entry.layout && entry.layout.includes(token)) score += 1;
    if (entry.label.toLowerCase().includes(token)) score += 1;
  }
  return score;
}

/**
 * Given a section role + optional style description, resolve to the best-matching
 * manifest entry. Falls back to the role's default entry when no style given or
 * no match found.
 */
export function resolveSection(role: SectionRole, style?: string): ManifestEntry {
  if (!style || style.trim() === "") {
    return defaultVariants[role] ?? componentManifest.find((e) => e.role === role)!;
  }

  const tokens = tokenize(style);
  const candidates = entriesForRole(role);

  let best: ManifestEntry | null = null;
  let bestScore = -1;

  for (const entry of candidates) {
    const score = scoreEntry(entry, tokens);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // If no positive match, use default
  if (!best || bestScore === 0) {
    return defaultVariants[role] ?? candidates[0];
  }

  return best;
}

/**
 * Resolve a list of section inputs (key, role, style?) into concrete
 * block types and variants using the component manifest.
 *
 * Returns an array ready to be used as addSection arguments.
 */
export function resolveSections(sections: SectionInput[]): ResolvedSection[] {
  return sections.map(({ key, role, style }) => {
    const entry = resolveSection(role, style);
    return {
      key,
      type: entry.blockType,
      variant: entry.variant,
      label: entry.label,
    };
  });
}

/**
 * Format resolved sections as a PAGE STRUCTURE string for injection into
 * the builder system prompt.
 */
export function formatPageStructure(resolved: ResolvedSection[]): string {
  const lines = resolved
    .map((s) => `  - key="${s.key}", type=${s.type}, variant=${s.variant}`)
    .join("\n");
  return `PAGE STRUCTURE (add ONLY these sections, in this order — do not add any others):\n${lines}`;
}
