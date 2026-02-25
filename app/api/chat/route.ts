import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { catalog, getDimensionsRule } from "@/lib/catalog";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: Array<{ role: string; content: string }>;
    currentSpec?: { root: string; elements: Record<string, unknown> } | null;
    platform?: "mobile" | "web";
  };
  const { messages, currentSpec, platform = "mobile" } = body;

  const basePrompt = catalog.prompt({ mode: "chat" }) + getDimensionsRule(platform);
  const refinementPrompt =
    currentSpec?.root && Object.keys(currentSpec.elements ?? {}).length > 0
      ? `

When the user asks to change or edit the UI, output only RFC 6902 JSON Patch operations that modify the current spec (add, replace, remove). Do not re-output the entire UI unless they ask for a full redesign. Current UI spec:
${JSON.stringify(currentSpec, null, 2)}`
      : "";

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: basePrompt + refinementPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: typeof m.content === "string" ? m.content : String(m.content),
    })),
  });

  return result.toTextStreamResponse();
}

