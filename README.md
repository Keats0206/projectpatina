This is a [Next.js](https://nextjs.org) project with a **generative UI playground** built on top of the [Vercel AI SDK](https://ai-sdk.dev/).

The experience is visually and interaction-wise inspired by the official example [`vercel-labs/ai-sdk-preview-rsc-genui`](https://github.com/vercel-labs/ai-sdk-preview-rsc-genui), but implemented using the **current AI SDK HTTP + `useChat` pattern** instead of the deprecated RSC preview APIs.

## Getting Started

### 1. Set your API key

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-...
```

You can obtain an API key from your OpenAI dashboard.

### 2. Install dependencies

Dependencies are already added to `package.json`, but if you need to re-install:

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to see the generative UI chat.

## How it works

- `app/api/chat/route.ts` exposes a streaming chat endpoint using `streamText` and `@ai-sdk/openai`.
- `components/Chat.tsx` is a client component that uses `useChat` from `@ai-sdk/react` to:
  - manage chat state,
  - stream responses,
  - render a modern, centered chat layout with suggestions.
- `app/page.tsx` mounts the `Chat` component as the main experience.

From here you can extend the UI to render richer, more “generative” layouts (dashboards, cards, timelines, etc.) based on the model output, similar to [`ai-sdk-preview-rsc-genui`](https://github.com/vercel-labs/ai-sdk-preview-rsc-genui).

# projectpatina
