import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { catalog, IOS_DIMENSIONS_RULE } from "@/lib/catalog";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, currentSpec } = await req.json();

  const systemPrompt = catalog.prompt() + IOS_DIMENSIONS_RULE;
  const contextPrompt =
    currentSpec?.root && Object.keys(currentSpec.elements ?? {}).length > 0
      ? `\n\nCurrent UI spec (refine or replace):\n${JSON.stringify(currentSpec, null, 2)}`
      : "";

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: systemPrompt + contextPrompt,
    prompt: typeof prompt === "string" ? prompt : "",
  });

  return result.toTextStreamResponse();
}
