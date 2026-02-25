import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { catalog, getDimensionsRule } from "@/lib/catalog";

export const maxDuration = 30;

function buildScreenshotSystem(platform: "mobile" | "web") {
  const dimensionsRule = getDimensionsRule(platform);
  const rootHint =
    platform === "web"
      ? "Prefer Page as root, then content Stack or NavigationBar."
      : "Prefer Screen as root, then NavigationBar or content Stack.";
  return `
You are a UI interpreter. The user will send a screenshot of an existing UI (e.g. mobile app, web page, settings, onboarding).

Your ONLY job is to output a SpecStream: one JSON object per line, each line is a RFC 6902 JSON Patch that builds a UI spec.
Use ONLY the components from the catalog. Output NOTHING else — no markdown, no explanation, no code fences.

${catalog.prompt()}

Rules for screenshot interpretation:
- Infer layout skeleton: use Stack (column/row), Section, Spacer.
- Map visible regions to catalog components: NavigationBar, LargeTitle, Heading, Text, Avatar, SettingsRow, FeatureRow, Button, Card, MetricGroup, Metric, TabBar, SearchBar, etc.
- ${rootHint}
- Use plausible props (title, label, text) from what you see; if unclear, use short placeholders.
- Emit patches in dependency order: root first, then elements (parents before children), so the stream renders correctly.
${dimensionsRule}
`.trim();
}

export async function POST(req: Request) {
  const body = await req.json();
  const { image, platform = "mobile" } = body as { image: string; platform?: "mobile" | "web" };

  if (!image || typeof image !== "string") {
    return Response.json(
      { error: "Missing or invalid image (expected base64 data URL or base64 string)" },
      { status: 400 }
    );
  }

  // Normalize: accept data URL or raw base64
  const imagePart =
    image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildScreenshotSystem(platform),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imagePart,
            mediaType: "image/png",
          },
          {
            type: "text",
            text: "Output only SpecStream JSONL patches (one JSON object per line) that describe this UI using the catalog components. No other text.",
          },
        ],
      },
    ],
  });

  return result.toTextStreamResponse();
}
