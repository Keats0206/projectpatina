'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";

export function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: "genui-chat",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="flex w-full flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Generative UI Playground
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Ask for dashboards, breakdowns, or step-by-step plans and watch
              the UI adapt.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/60">
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                <Suggestion
                  title="Product feature ideas"
                  body="Brainstorm three product features and show them as cards with pros and cons."
                  onSelect={() => sendMessage({ text: "Brainstorm three product features and show them as cards with pros and cons." })}
                  disabled={isLoading}
                />
                <Suggestion
                  title="Learning path"
                  body="Design a 4-week learning plan for TypeScript with a weekly checklist."
                  onSelect={() => sendMessage({ text: "Design a 4-week learning plan for TypeScript with a weekly checklist." })}
                  disabled={isLoading}
                />
                <Suggestion
                  title="Data breakdown"
                  body="Explain how my conversion funnel could be visualized and what metrics to track."
                  onSelect={() => sendMessage({ text: "Explain how my conversion funnel could be visualized and what metrics to track." })}
                  disabled={isLoading}
                />
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {getMessageText(message)}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a dashboard, UI idea, or step-by-step plan…"
              className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-300"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Thinking…" : "Send"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Powered by{" "}
            <a
              href="https://github.com/vercel-labs/ai-sdk-preview-rsc-genui"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              generative UI ideas
            </a>{" "}
            from the Vercel AI SDK example.
          </p>
        </form>
      </div>
    </div>
  );
}

type SuggestionProps = {
  title: string;
  body: string;
  onSelect: () => void;
  disabled?: boolean;
};

function Suggestion({ title, body, onSelect, disabled }: SuggestionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="w-full rounded-2xl border border-dashed border-zinc-200 bg-white/80 p-3 text-left text-xs shadow-sm transition hover:border-zinc-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="text-[13px] text-zinc-700 dark:text-zinc-300">{body}</p>
    </button>
  );
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}


