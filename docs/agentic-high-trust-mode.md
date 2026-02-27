# Agentic / High-Trust Mode: Letting the Model Plan and Act

This doc describes how the app is set up to "trust" the model more: fewer guardrails, more tools, and multi-step generation driven by the model.

## Current vs high-trust

| Aspect | Current | High-trust |
|--------|--------|------------|
| **Section planning** | Pre-step: `determineSpec()` returns a fixed list; system prompt says "call addSection ONLY for these, in this order". | No pre-step (or use it only as a suggestion). Model chooses sections and order from the catalog. |
| **Workflow** | Strict: 1) acknowledge, 2) addSection in order, 3) applyTheme once, 4) friendly message. | Softer: "Plan the page; add sections in a logical order; apply theme when ready; use editPage to refine." |
| **Step limit** | `stepCountIs(12)` — caps tool rounds. | Higher (e.g. 24–30) so the model can add more sections and do multiple edit rounds. |
| **Tool feedback** | Tools return `{ ...input, added: true }` — no view of accumulated state. | Optional: pass `currentSpec` from client to API so tools can return "current sections: ..." and model can self-correct. |

## Implementation choices

1. **Optional determine-spec**  
   - **Off**: Skip the pre-step entirely. System prompt includes the full catalog and says "decide which sections the page needs and add them in a sensible order."  
   - **Hint only**: Run determine-spec but inject result as "Suggested structure (you may follow or change): …" so the model can deviate.

2. **Softer system prompt**  
   - Remove "Do not add any section not listed" and "in that exact order."  
   - Add: "You may add, skip, or reorder sections. Use editPage after the initial build to refine copy or layout if needed."

3. **Higher step limit**  
   - e.g. `stepCountIs(24)` or `stepCountIs(30)` with a comment that it allows multi-step generation and more edit rounds.

4. **Optional: stateful tool feedback**  
   - Client sends `currentSpec` (and maybe `currentCssVars`) with each request.  
   - Server keeps an in-memory spec for the duration of the request and passes it into tool `execute`.  
   - Tools return e.g. `{ ...input, added: true, currentSectionKeys: ['nav','hero',...] }` so the model sees what’s on the page and can plan next steps (e.g. "add one more section" or "edit hero title").

5. **New tools (optional)**  
   - `getCatalog()` — returns block types and variants (redundant if catalog is in system prompt, but useful if you later want to fetch dynamic catalog).  
   - `getPageState()` — returns current section keys and theme summary; only useful if server has access to current spec (see above).

## Generate route (multi-step generation)

The `/api/generate` route currently does:

1. Meta-prompt → generation brief  
2. Single `streamText` that streams JSONL patches (no tools).

To make generation more agentic:

- **Option A**: Give the generator **tools** (e.g. `emitPatch`) and let it call them many times; server streams tool calls as they happen.  
- **Option B**: Keep streaming JSONL but add a **planning** phase: model outputs a plan (e.g. as structured output or a tool call), then a second call executes the plan.  
- **Option C**: Single model with higher `maxSteps`, using tools like `addElement`, `addState`, `addPatch` so the model builds the spec incrementally with feedback.

Option C is the most "agentic": one model, multiple tool rounds, each round can depend on previous results.

## Files to change for chat high-trust

- `app/api/chat/route.ts`  
  - Make determine-spec optional or hint-only.  
  - Soften `buildSystemPrompt()` (no strict "only these sections in this order").  
  - Increase `stepCountIs` to 24 or 30.  
  - Optionally: accept `currentSpec` in the request body and pass it into tool execute so tools can return current state.

- `lib/prompts.ts`  
  - No change required; optional: add an "agentic" variant of the workflow paragraph.

- Client (`app/swap/page.tsx`)  
  - If you add stateful tool feedback: when calling `/api/chat`, send `currentSpec` and `currentCssVars` derived from `deriveFromMessages(messages)` so the server can return them in tool results.

## Risk and safety

- **Cost**: More steps → more tokens. Cap with a hard `maxSteps` (e.g. 30).  
- **Quality**: Softer prompts can produce odd section orders or too many/few sections. Optional determine-spec as a "hint" balances autonomy and consistency.  
- **Abuse**: If the API is public, consider rate limits or user-level step caps.
