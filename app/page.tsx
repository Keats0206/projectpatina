"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormEvent } from "react";
import {
  ActionProvider,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import { applySpecPatch, createMixedStreamParser } from "@json-render/core";
import type { Spec } from "@json-render/core";
import { registries, type StyleId } from "@/lib/registry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Chat message shape (matches useChatUI)
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  spec: Spec | null;
}

let chatIdCounter = 0;
function generateChatId() {
  chatIdCounter += 1;
  return `msg-${Date.now()}-${chatIdCounter}`;
}

/**
 * Chat + incremental UI: sends currentSpec so the model can output only patches.
 * Patches are applied on top of the previous spec → no full re-render from scratch.
 */
type Platform = "mobile" | "web";

function useChatUIWithEdits(api: string, platform: Platform) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [liveSpec, setLiveSpec] = useState<Spec | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const clear = useCallback(() => {
    setMessages([]);
    setLiveSpec(null);
    setError(null);
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: generateChatId(),
        role: "user",
        text: text.trim(),
        spec: null,
      };
      const assistantId = generateChatId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        spec: null,
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      const historyForApi = [
        ...messagesRef.current.map((m) => ({ role: m.role, content: m.text })),
        { role: "user" as const, content: text.trim() },
      ];

      // Start from a copy of current spec so model can output incremental patches
      const baseSpec: Spec = liveSpec?.root
        ? {
            root: liveSpec.root,
            elements: JSON.parse(JSON.stringify(liveSpec.elements ?? {})),
            ...(liveSpec.state && { state: JSON.parse(JSON.stringify(liveSpec.state)) }),
          }
        : { root: "", elements: {} };

      let currentSpec: Spec = {
        root: baseSpec.root,
        elements: { ...baseSpec.elements },
        ...(baseSpec.state && { state: { ...baseSpec.state } }),
      };
      let accumulatedText = "";
      let hasSpec = false;

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            currentSpec: liveSpec?.root ? liveSpec : undefined,
            platform,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        const parser = createMixedStreamParser({
          onPatch(patch) {
            hasSpec = true;
            applySpecPatch(currentSpec, patch);
            const next = JSON.parse(JSON.stringify(currentSpec)) as Spec;
            setLiveSpec(next);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, spec: next } : m
              )
            );
          },
          onText(line) {
            accumulatedText += (accumulatedText ? "\n" : "") + line;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: accumulatedText } : m
              )
            );
          },
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.push(decoder.decode(value, { stream: true }));
        }
        parser.flush();

        if (hasSpec) setLiveSpec(JSON.parse(JSON.stringify(currentSpec)) as Spec);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") setError(err);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [api, liveSpec, platform]
  );

  const sendImage = useCallback(
    async (imageBase64: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: generateChatId(),
        role: "user",
        text: "Refining UI from image",
        spec: null,
      };
      const assistantId = generateChatId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        spec: null,
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      let currentSpec: Spec = { root: "", elements: {} };
      let hasSpec = false;

      try {
        const response = await fetch("/api/screenshot-to-ui", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageBase64, platform }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        const parser = createMixedStreamParser({
          onPatch(patch) {
            hasSpec = true;
            applySpecPatch(currentSpec, patch);
            const next = JSON.parse(JSON.stringify(currentSpec)) as Spec;
            setLiveSpec(next);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, spec: next } : m
              )
            );
          },
          onText() {},
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.push(decoder.decode(value, { stream: true }));
        }
        parser.flush();

        if (hasSpec) setLiveSpec(JSON.parse(JSON.stringify(currentSpec)) as Spec);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") setError(err);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [platform]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { messages, isStreaming, error, send, sendImage, clear, liveSpec, setLiveSpec };
}

const STYLE_LABELS: Record<StyleId, string> = {
  ios: "iOS",
  minimal: "Minimal",
  airbnb: "Airbnb",
};

function ChatPanel({
  messages,
  isStreaming,
  error,
  send,
  sendImage,
  clear,
  platform,
  onPlatformChange,
  style,
  onStyleChange,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: Error | null;
  send: (text: string) => Promise<void>;
  sendImage: (imageBase64: string) => Promise<void>;
  clear: () => void;
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
  style: StyleId;
  onStyleChange: (style: StyleId) => void;
}) {
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const readImageAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Not an image file"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix if present so we send raw base64 or full data URL
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isStreaming) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      try {
        const base64 = await readImageAsBase64(file);
        await sendImage(base64);
      } catch (err) {
        console.error("Failed to process dropped image", err);
      }
    },
    [isStreaming, readImageAsBase64, sendImage]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const file = e.clipboardData.files?.[0];
      if (!file?.type.startsWith("image/") || isStreaming) return;
      e.preventDefault();
      try {
        const base64 = await readImageAsBase64(file);
        await sendImage(base64);
      } catch (err) {
        console.error("Failed to process pasted image", err);
      }
    },
    [isStreaming, readImageAsBase64, sendImage]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    send(input.trim());
    setInput("");
  };

  const suggestions = [
    {
      title: "Settings screen",
      body: "Build an iOS Settings screen with profile avatar, Airplane Mode toggle, Wi-Fi and Bluetooth rows with values, and a section for Notifications, Sounds, Focus, and Screen Time.",
    },
    {
      title: "What's New",
      body: "Create an iOS 'What's New' onboarding screen with a large title, three feature rows with checkmarks, and a Continue button at the bottom.",
    },
    {
      title: "App Store detail",
      body: "Show an App Store app detail page with a navigation bar, app title and subtitle, a metrics row for ratings/age/chart position, a description, and a bottom tab bar.",
    },
  ];

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Chat
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/60">
              <button
                type="button"
                onClick={() => onPlatformChange("mobile")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${platform === "mobile" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => onPlatformChange("web")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${platform === "web" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
              >
                Web
              </button>
            </div>
            <Select value={style} onValueChange={(v) => onStyleChange(v as StyleId)}>
              <SelectTrigger className="h-8 min-w-[90px] border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {(["ios", "minimal", "airbnb"] as const).map((id) => (
                  <SelectItem key={id} value={id}>
                    {STYLE_LABELS[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Describe or modify the UI. The panel on the right updates as we go.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="grid gap-2 text-sm">
            {suggestions.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => send(s.body)}
                disabled={isStreaming}
                className="rounded-xl border border-dashed border-zinc-200 bg-white/80 p-3 text-left text-xs shadow-sm transition hover:border-zinc-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {s.title}
                </p>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300">{s.body}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text || "\u00a0"}</p>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:240ms]" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {error && (
        <div className="shrink-0 px-4 pb-2">
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error.message}
          </p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`shrink-0 gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800 ${isDragging ? "bg-zinc-100 dark:bg-zinc-800/50" : ""}`}
      >
        {isDragging && (
          <p className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Drop image to refine into UI
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the UI, paste or drop an image…"
            className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-offset-2 focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-300"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isStreaming ? "…" : "Send"}
          </button>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="mt-1 text-xs text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Clear chat
          </button>
        )}
      </form>
    </div>
  );
}

function LiveRenderPanel({
  spec,
  onSpecChange,
  loading,
  platform,
  style,
}: {
  spec: Spec | null;
  onSpecChange: (spec: Spec | null) => void;
  loading: boolean;
  platform: Platform;
  style: StyleId;
}) {
  const currentRegistry = registries[style];
  const [view, setView] = useState<"preview" | "code">("preview");
  const [codeText, setCodeText] = useState(() =>
    spec ? JSON.stringify(spec, null, 2) : "{\n  \"root\": \"\",\n  \"elements\": {}\n}"
  );
  const [codeError, setCodeError] = useState<string | null>(null);
  const codeTextRef = useRef(codeText);
  codeTextRef.current = codeText;

  // Sync code text when spec changes from chat/streaming (so code view stays in sync)
  useEffect(() => {
    const next = spec ? JSON.stringify(spec, null, 2) : "{\n  \"root\": \"\",\n  \"elements\": {}\n}";
    setCodeText(next);
    setCodeError(null);
  }, [spec]);

  const applyCodeEdit = useCallback(() => {
    const raw = codeTextRef.current.trim();
    if (!raw) {
      onSpecChange(null);
      setCodeError(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Spec;
      if (typeof parsed !== "object" || parsed === null) {
        setCodeError("Spec must be an object");
        return;
      }
      const next: Spec = {
        root: typeof parsed.root === "string" ? parsed.root : "",
        elements: parsed.elements && typeof parsed.elements === "object" ? parsed.elements : {},
      };
      if (parsed.state && typeof parsed.state === "object") next.state = parsed.state;
      onSpecChange(next);
      setCodeError(null);
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [onSpecChange]);

  useEffect(() => {
    if (view !== "code") return;
    const t = setTimeout(applyCodeEdit, 600);
    return () => clearTimeout(t);
  }, [view, codeText, applyCodeEdit]);

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Live UI
          </h2>
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/60">
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${view === "preview" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setView("code")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${view === "code" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"}`}
            >
              Code
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {view === "preview"
            ? "Edits are incremental: only patches stream in."
            : "Edit the spec JSON; preview updates when valid."}
        </p>
      </div>
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {view === "preview" ? (
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-4">
            <div
              className={`w-full min-h-[280px] rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900/60 ${platform === "web" ? "max-w-[800px]" : "max-w-[390px]"}`}
            >
              <Renderer spec={spec} registry={currentRegistry} loading={loading} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden p-2">
            {codeError && (
              <p className="mb-1 text-xs text-red-600 dark:text-red-400">{codeError}</p>
            )}
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              onBlur={applyCodeEdit}
              spellCheck={false}
              className="flex-1 min-h-[200px] w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300"
              placeholder='{"root":"","elements":{}}'
            />
          </div>
        )}
      </div>
    </div>
  );
}

function GenerativeUI() {
  const [platform, setPlatform] = useState<Platform>("mobile");
  const [style, setStyle] = useState<StyleId>("ios");
  const chat = useChatUIWithEdits("/api/chat", platform);

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-zinc-50 dark:bg-black">
      <div className="flex w-full flex-1 flex-col min-h-0 sm:flex-row">
        <div className="flex w-full flex-col sm:w-[380px] sm:min-w-[320px]">
          <ChatPanel
            messages={chat.messages}
            isStreaming={chat.isStreaming}
            error={chat.error}
            send={chat.send}
            sendImage={chat.sendImage}
            clear={chat.clear}
            platform={platform}
            onPlatformChange={setPlatform}
            style={style}
            onStyleChange={setStyle}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <LiveRenderPanel
            spec={chat.liveSpec}
            onSpecChange={chat.setLiveSpec}
            loading={chat.isStreaming}
            platform={platform}
            style={style}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <StateProvider initialState={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{}}>
          <main className="flex h-screen flex-col">
            <div className="shrink-0 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                json-render · Generative UI
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Chat on the left; the UI on the right updates as you describe or modify it.
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <GenerativeUI />
            </div>
          </main>
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
