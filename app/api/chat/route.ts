import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText, stepCountIs, streamText, tool, zodSchema } from "ai";
import { z } from "zod";
import { DETERMINE_SPEC_SYSTEM_PROMPT } from "@/lib/prompts";
import { resolveSections, formatPageStructure } from "@/lib/resolveSpec";
import type { SectionInput } from "@/lib/resolveSpec";
import type { SectionRole } from "@/lib/componentManifest";

export const maxDuration = 60;

// ─── Component catalog for the system prompt ────────────────────

const WEB_CATALOG = `
AVAILABLE SECTION BLOCKS — use ONLY these types and variants:

NavbarBlock
  Variants: navbar1 (logo+menu+auth), navbar7 (centered compact), navbar8 (standard links+CTA ✓),
            navbar9 (mega-menu with icons), navbar10 (mega-menu alt), navbar11 (floating dock)
  Props: logoText?, ctaLabel?, links? [{label, url}]

HeroBlock
  Variants: hero10 (centered badge+logos), hero11 (centered image+border), hero18 (centered image grid),
            hero83 (centered dual CTAs ✓), hero111 (email capture+trust+gallery),
            hero112 (split left/right+stats), hero197 (dot pattern+badge+form)
  Props: title?, description?, primaryCta?, secondaryCta?

FeatureBlock
  Variants: feature1 (split image+text), feature6 (split+checklist), feature42 (3-col grid ✓),
            feature44 (integration cards), feature62 (alternating rows), feature70 (tabs carousel),
            feature102 (numbered steps), feature118 (bento grid), feature148 (template grid+CTA),
            feature227 (split+icon list), feature276 (hover icon grid)
  Props: title?, description?

GalleryBlock
  Variants: gallery4 (carousel+arrows), gallery6 (card grid+CTA), gallery7 (masonry+tabs),
            gallery9 (full-width carousel), gallery25 (multi-col masonry)
  Props: title?, description?

LogosBlock — "Trusted by" / company logo strips only
  Use for: any row of company logos, "Trusted by the world's best companies", or social-proof logo sections.
  Variants: logos1 (simple grid), logos3 (heading+grid), logos7 (muted bg+scrolling marquee)
  Props: heading?

PricingBlock
  Variants: pricing4 (side-by-side+toggle), pricing16 (tab-style 3 cols), pricing34 (toggle+badge features)
  Props: title?, description?

TestimonialBlock — customer quotes / review cards only (NOT logo strips)
  Use ONLY when the design has a distinct section of customer testimonials: quote cards with avatar + quote text.
  Do NOT use for "Trusted by" lines or company logo rows — those are LogosBlock.
  Variants: testimonial1 (badge+heading+cards), testimonial4 (image+quote), testimonial7 (auto-scroll dual carousel)
  No content props — uses built-in sample data

FooterBlock
  Variants: footer2 (logo+4-col links+bar ✓), footer3 (logo+social+links), footer5 (4-col simple),
            footer50 (CTA banner+nav+social)
  Props: heading?, description?
`;

function buildSystemPrompt(pageStructure: string | null): string {
  const structureSection = pageStructure
    ? `\n\n${pageStructure}\n\nWORKFLOW — always follow this order:
1. Brief 1-sentence acknowledgment of what you're building
2. Call addSection ONLY for the sections listed in PAGE STRUCTURE above, in that exact order. Do not add any section not listed.
3. After all sections are added, call applyTheme once with brand-appropriate colors and radius
4. End with a short friendly message: what was built and invite the user to customize`
    : `\n\nWORKFLOW — always follow this order:
1. Brief 1-sentence acknowledgment of what you're building
2. Call addSection once per section, top-to-bottom (navbar → hero → features → footer). Only add optional sections (logos, gallery, pricing, testimonials) if clearly needed.
3. After all sections are added, call applyTheme once with brand-appropriate colors and radius
4. End with a short friendly message: what was built and invite the user to customize`;

  return `You are a web page builder AI. You build polished landing pages by calling tools to add sections one at a time.

Always derive brand context from the user's message (and any URL or image they provide): product name, what they do, tone, and color/style preferences. Use that context when writing section copy and when calling applyTheme — do not use generic placeholder voice or palette.

Do not mention or use the brand name "Partiful" in your responses or in any generated copy; the user has requested no references to it.

${WEB_CATALOG}
${structureSection}

COPY GUIDELINES:
- Extract from the user's message: product/app name, what they do, and desired tone. Use that to write real, specific copy — not generic placeholders.
- Headlines and descriptions should reflect the user's brand and value prop.
- primaryCta and secondaryCta should be action-oriented ("Get Started Free", "See How It Works") and fit the product.

THEME GUIDELINES:
- Extract from the user's message (and any reference URL or screenshot): preferred colors, dark/light, and style. Apply that palette.
- Use oklch format: oklch(lightness chroma hue) — e.g. oklch(0.205 0 0) = near-black
- radius: "0.375rem" = tight, "0.625rem" = default, "1rem" = rounded, "1.5rem" = very round

EDITING (page already has sections):
- Use editPage with JSON Patch operations
- Paths follow the spec: /elements/<key>/props/<propName> to edit a prop
- You set the keys when you called addSection (e.g. key "nav", "hero", "features")
- Replace a section: one remove patch on /elements/page/children at the index + remove the element + add new element + add key back to children
`;
}

// ─── Determine-spec step ────────────────────────────────────────

type RawSectionInput = { key?: unknown; role?: unknown; style?: unknown };

const VALID_ROLES: SectionRole[] = [
  "navbar", "hero", "features", "gallery", "logos",
  "pricing", "testimonials", "footer",
];

function isValidRole(r: unknown): r is SectionRole {
  return typeof r === "string" && (VALID_ROLES as string[]).includes(r);
}

/**
 * Returns true when the message list has at least one assistant turn with
 * tool calls, meaning we're in an editing conversation not an initial build.
 */
function isEditingConversation(messages: unknown[]): boolean {
  return (messages as Array<{ role?: string; parts?: Array<{ type?: string }> }>).some(
    (m) =>
      m.role === "assistant" &&
      Array.isArray(m.parts) &&
      m.parts.some(
        (p) =>
          typeof p.type === "string" &&
          (p.type === "dynamic-tool" || p.type.startsWith("tool-"))
      )
  );
}

/**
 * Extract the text content of the last user message for determine-spec.
 * Also pulls any image parts so vision can be used.
 */
function extractLastUserContent(
  messages: unknown[]
): { text: string; images: string[] } {
  const msgs = messages as Array<{
    role?: string;
    parts?: Array<{ type?: string; text?: string; url?: string; mediaType?: string }>;
  }>;

  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.role !== "user" || !Array.isArray(m.parts)) continue;

    const text = m.parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join(" ");

    const images = m.parts
      .filter((p) => p.type === "file" && p.url)
      .map((p) => p.url as string);

    return { text, images };
  }
  return { text: "", images: [] };
}

async function determineSpec(userText: string, imageUrls: string[]): Promise<string | null> {
  try {
    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image"; image: string; mediaType?: string };

    const contentParts: ContentPart[] = [];

    for (const url of imageUrls) {
      contentParts.push({ type: "image", image: url });
    }
    contentParts.push({ type: "text", text: userText || "Build a landing page." });

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      system: DETERMINE_SPEC_SYSTEM_PROMPT,
      messages: [{ role: "user", content: contentParts }],
    });

    return text.trim();
  } catch {
    return null;
  }
}

function parseSections(raw: string): SectionInput[] {
  try {
    // Strip markdown code fences if model wrapped it
    const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: RawSectionInput) => isValidRole(item.role) && typeof item.key === "string")
      .map((item: RawSectionInput) => ({
        key: item.key as string,
        role: item.role as SectionRole,
        style: typeof item.style === "string" ? item.style : undefined,
      }));
  } catch {
    return [];
  }
}

// ─── API Route ───────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();

  let pageStructure: string | null = null;

  // On the first user turn (no prior assistant tool calls), run determine-spec
  if (!isEditingConversation(messages)) {
    const { text: userText, images } = extractLastUserContent(messages);
    const rawSpec = await determineSpec(userText, images);

    if (rawSpec) {
      const sections = parseSections(rawSpec);
      if (sections.length > 0) {
        const resolved = resolveSections(sections);
        pageStructure = formatPageStructure(resolved);
      }
    }
  }

  const result = streamText({
    model: openai("gpt-4.1"),
    system: buildSystemPrompt(pageStructure),
    messages: await convertToModelMessages(messages),
    tools: {
      addSection: tool({
        description:
          "Add one section block to the page. Call once per section, in top-to-bottom order.",
        inputSchema: zodSchema(
          z.object({
            key: z
              .string()
              .describe(
                "Unique element key, e.g. 'nav', 'hero', 'features', 'logos', 'pricing', 'footer'"
              ),
            type: z
              .enum([
                "NavbarBlock",
                "HeroBlock",
                "FeatureBlock",
                "GalleryBlock",
                "LogosBlock",
                "PricingBlock",
                "TestimonialBlock",
                "FooterBlock",
              ])
              .describe("Block type from the catalog"),
            variant: z
              .string()
              .describe("Variant name, e.g. 'navbar8', 'hero83', 'feature42'"),
            props: z
              .record(z.string(), z.string())
              .optional()
              .describe(
                "Content props: title, description, primaryCta, secondaryCta, logoText, ctaLabel, heading"
              ),
          })
        ),
        execute: async (input) => ({ ...input, added: true }),
      }),

      applyTheme: tool({
        description:
          "Apply a color theme and typography to the page. Call once after all sections are added.",
        inputSchema: zodSchema(
          z.object({
            primary: z
              .string()
              .describe(
                "Primary brand color in oklch, e.g. 'oklch(0.205 0 0)' for near-black"
              ),
            primaryForeground: z
              .string()
              .describe("Text color on primary backgrounds, e.g. 'oklch(0.985 0 0)'"),
            radius: z
              .string()
              .optional()
              .describe("Border radius: '0.375rem' tight, '0.625rem' default, '1rem' round"),
            fontDisplay: z
              .string()
              .optional()
              .describe("Sans-serif only for headings, e.g. 'var(--font-dm-sans), sans-serif' or 'Inter, sans-serif'. Do not use serif fonts."),
            background: z
              .string()
              .optional()
              .describe("Page background color override in oklch"),
          })
        ),
        execute: async (input) => ({ ...input, applied: true }),
      }),

      editPage: tool({
        description:
          "Edit the existing page using JSON Patch operations. Use for changes after initial build.",
        inputSchema: zodSchema(
          z.object({
            patches: z
              .array(
                z.object({
                  op: z.enum(["add", "replace", "remove"]),
                  path: z
                    .string()
                    .describe(
                      "JSON Pointer path, e.g. '/elements/hero/props/title'"
                    ),
                  value: z.unknown().optional(),
                })
              )
              .describe("RFC 6902 patch operations"),
            summary: z.string().describe("Brief description of the changes made"),
          })
        ),
        execute: async (input) => ({ ...input, applied: true }),
      }),
    },
    stopWhen: stepCountIs(12),
  });

  return result.toUIMessageStreamResponse();
}
