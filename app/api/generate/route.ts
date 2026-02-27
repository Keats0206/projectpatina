import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { META_SYSTEM_PROMPT, SPECSTREAM_FORMAT } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, currentSpec } = await req.json();
  const userPrompt = typeof prompt === "string" ? prompt : "";

  // Step 1: meta-prompt — a fast model writes a tailored generation brief
  const { text: generationBrief } = await generateText({
    model: openai("gpt-4.1-mini"),
    system: META_SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  // Step 2: generation — stream JSONL patches using the tailored brief
  const contextPrompt =
    currentSpec?.root && Object.keys(currentSpec.elements ?? {}).length > 0
      ? `\n\nCurrent UI spec (refine or replace):\n${JSON.stringify(currentSpec, null, 2)}`
      : "";

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: SPECSTREAM_FORMAT + "\n\n" + generationBrief + contextPrompt,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse();
}
