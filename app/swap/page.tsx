"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ActionProvider,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import { applySpecPatch } from "@json-render/core";
import type { Spec } from "@json-render/core";
import { webRegistry } from "@/lib/webRegistry";
import { designSystems, getDesignSystem } from "@/lib/designSystems";
import { ThemeSelector } from "@/components/theme-selector";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage, FileUIPart } from "ai";
import { ArrowUp, Check, ChevronLeft, ChevronRight, Code2, ImagePlus, Loader2, Maximize2, Minimize2, Palette, Sparkles, Wrench, X } from "lucide-react";
import { slotVariants, SLOT_LABELS } from "@/lib/webVariants";
import type { SlotId } from "@/lib/webVariants";

// ─── Constants ───────────────────────────────────────────────────

const DEFAULT_CSS_VARS: Record<string, string> = {
  "--primary": "oklch(0.205 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--radius": "0.625rem",
  "--container-max": "72rem",
  "--font-sans": "var(--font-dm-sans), sans-serif",
  "--font-display": "var(--font-dm-sans), sans-serif",
  "--shadow-sm": "0 1px 3px rgb(0 0 0/.1),0 1px 2px rgb(0 0 0/.06)",
  "--shadow-md": "0 4px 6px rgb(0 0 0/.07),0 2px 4px rgb(0 0 0/.06)",
  "--shadow-lg": "0 10px 15px rgb(0 0 0/.1),0 4px 6px rgb(0 0 0/.05)",
  "--shadow-xl": "0 20px 25px rgb(0 0 0/.1),0 10px 10px rgb(0 0 0/.04)",
};

const BLANK_SPEC: Spec = {
  root: "page",
  elements: {
    page: { type: "PageRoot", props: {}, children: [] },
  },
};

// ─── Variant cycling helpers ─────────────────────────────────────

const TYPE_TO_SLOT: Record<string, SlotId> = {
  NavbarBlock: "navbar",
  HeroBlock: "hero",
  FeatureBlock: "features",
  GalleryBlock: "gallery",
  LogosBlock: "logos",
  PricingBlock: "pricing",
  TestimonialBlock: "testimonials",
  FooterBlock: "footer",
};

function findVariantIdx(slotId: SlotId, variantStr: string): number {
  const variants = slotVariants[slotId];
  const idx = variants.findIndex((v) => {
    const rootKey = v.spec.root;
    const el = v.spec.elements[rootKey] as { props?: { variant?: string } };
    return el?.props?.variant === variantStr;
  });
  return idx === -1 ? 0 : idx;
}

// ─── Helpers ─────────────────────────────────────────────────────

type ToolPart = {
  type: string;
  toolName?: string;
  state: "input-streaming" | "input-available" | "output-available" | "error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function getToolPart(part: unknown): ToolPart | null {
  const p = part as { type?: string };
  if (!p?.type) return null;
  if (p.type === "dynamic-tool" || p.type.startsWith("tool-")) {
    return part as ToolPart;
  }
  return null;
}

function toolLabel(part: ToolPart): string {
  const name = part.toolName ?? part.type.replace(/^tool-/, "");
  const isDone = part.state === "output-available";

  if (name === "addSection") {
    const out = part.output as { variant?: string; type?: string } | undefined;
    const inp = part.input as { variant?: string; type?: string } | undefined;
    const variant = (isDone ? out?.variant : inp?.variant) ?? "section";
    const type = (isDone ? out?.type : inp?.type) ?? "";
    return isDone ? `Added ${variant} (${type})` : `Adding ${variant}…`;
  }
  if (name === "applyTheme") {
    return isDone ? "Theme applied" : "Applying theme…";
  }
  if (name === "editPage") {
    const out = part.output as { summary?: string } | undefined;
    return isDone ? `Edited: ${out?.summary ?? "page"}` : "Editing page…";
  }
  return isDone ? `${name} done` : `${name}…`;
}

// ─── Derive spec + cssVars from message history ──────────────────

function deriveFromMessages(messages: UIMessage[]): {
  liveSpec: Spec;
  cssVars: Record<string, string>;
} {
  const elements: Record<string, unknown> = {
    page: { type: "PageRoot", props: {}, children: [] as string[] },
  };
  const cssVars: Record<string, string> = { ...DEFAULT_CSS_VARS };

  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const raw of msg.parts ?? []) {
      const part = getToolPart(raw);
      if (!part || part.state !== "output-available") continue;

      const name = part.toolName ?? (part.type as string).replace(/^tool-/, "");

      if (name === "addSection") {
        const { key, type, variant, props = {} } = (part.output as {
          key: string;
          type: string;
          variant: string;
          props?: Record<string, string>;
        });
        elements[key] = { type, props: { variant, ...props }, children: [] };
        (elements.page as { children: string[] }).children.push(key);
      }

      if (name === "applyTheme") {
        const t = part.output as {
          primary?: string;
          primaryForeground?: string;
          radius?: string;
          fontDisplay?: string;
          background?: string;
        };
        if (t.primary) cssVars["--primary"] = t.primary;
        if (t.primaryForeground) cssVars["--primary-foreground"] = t.primaryForeground;
        if (t.radius) cssVars["--radius"] = t.radius;
        if (t.fontDisplay) cssVars["--font-display"] = t.fontDisplay;
        if (t.background) cssVars["--background"] = t.background;
      }

      if (name === "editPage") {
        const { patches } = part.output as {
          patches: Array<{ op: "add" | "replace" | "remove"; path: string; value?: unknown }>;
        };
        const spec = { root: "page", elements } as Spec;
        for (const patch of patches) {
          try {
            applySpecPatch(spec, patch);
          } catch {
            // skip invalid patches
          }
        }
      }
    }
  }

  return { liveSpec: { root: "page", elements } as Spec, cssVars };
}

// ─── Tool step UI ────────────────────────────────────────────────

function ToolStep({ part }: { part: ToolPart }) {
  const isDone = part.state === "output-available";
  const isError = part.state === "error";

  return (
    <div className="flex items-center gap-2 rounded-md bg-zinc-800/50 px-2.5 py-1.5">
      {isError ? (
        <X className="h-3 w-3 shrink-0 text-red-400" />
      ) : isDone ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-400" />
      ) : (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-400" />
      )}
      <span className={`text-[10px] leading-snug ${isError ? "text-red-400" : isDone ? "text-zinc-400" : "text-zinc-300"}`}>
        {toolLabel(part)}
      </span>
    </div>
  );
}

// ─── Chat Panel ─────────────────────────────────────────────────

function ChatPanel({
  messages,
  isStreaming,
  onSend,
  onClear,
}: {
  messages: UIMessage[];
  isStreaming: boolean;
  onSend: (text: string, image?: FileUIPart) => void;
  onClear: () => void;
}) {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<FileUIPart | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const attachImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = await readFileAsDataUrl(file);
    setPendingImage({ type: "file", mediaType: file.type, url, filename: file.name });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await attachImage(file);
    e.target.value = "";
  };

  const onPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) await attachImage(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isStreaming) return;
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) await attachImage(file);
  };

  const canSubmit = (input.trim() || pendingImage) && !isStreaming;

  const submit = () => {
    if (!canSubmit) return;
    onSend(input.trim(), pendingImage ?? undefined);
    setInput("");
    setPendingImage(null);
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col h-full text-[11px]">
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="font-medium text-zinc-300 tracking-wide text-[11px] uppercase">Build with AI</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-zinc-600 hover:text-zinc-400 transition"
            title="Clear chat"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-zinc-400 leading-relaxed mt-2 text-[12px] max-w-[85%]">
            Describe a page, paste a URL, or attach a screenshot to clone.
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1.5">
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[90%] space-y-1.5">
                  {/* Show any image parts first */}
                  {msg.parts?.filter((p) => (p as { type: string }).type === "file").map((p, i) => {
                    const fp = p as FileUIPart;
                    return (
                      <img
                        key={i}
                        src={fp.url}
                        alt="attachment"
                        className="rounded-lg max-h-32 object-cover ml-auto border border-zinc-600"
                      />
                    );
                  })}
                  {/* Text bubble */}
                  {msg.parts?.some((p) => (p as { type: string }).type === "text" && (p as { text?: string }).text) && (
                    <div className="rounded-xl bg-zinc-800 border border-zinc-600 px-2.5 py-1.5 text-zinc-100 leading-relaxed">
                      {msg.parts
                        .filter((p) => (p as { type: string }).type === "text")
                        .map((p, i) => (
                          <p key={i} className="whitespace-pre-wrap">
                            {(p as { text: string }).text}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {msg.parts?.map((raw, i) => {
                  const p = raw as { type: string; text?: string };
                  if (p.type === "text" && p.text) {
                    return (
                      <div key={i} className="max-w-[90%] rounded-xl bg-zinc-800 border border-zinc-700/60 px-2.5 py-1.5 text-zinc-300 leading-relaxed">
                        <p className="whitespace-pre-wrap">{p.text}</p>
                      </div>
                    );
                  }
                  const toolPart = getToolPart(raw);
                  if (toolPart) {
                    return <ToolStep key={i} part={toolPart} />;
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="h-1 w-1 animate-pulse rounded-full bg-zinc-400" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-zinc-400 [animation-delay:150ms]" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-zinc-400 [animation-delay:300ms]" />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggested actions (after last reply, when not streaming) */}
      {!isStreaming &&
        messages.some((m) => m.role === "assistant") &&
        messages.length > 0 && (
          <div className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5">
            {[
              "Update the theme",
              "Add a new section",
              "Make it more minimal",
              "Change the colors",
              "Add a footer",
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onSend(label)}
                className="rounded-full border border-zinc-600 bg-zinc-800/80 px-2.5 py-1 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition text-[11px]"
              >
                {label}
              </button>
            ))}
          </div>
        )}

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-zinc-800">
        <form onSubmit={onSubmit}>
          <div
            className={`rounded-lg border bg-zinc-800 transition focus-within:border-zinc-500 ${
              isDragging ? "border-zinc-500 bg-zinc-800" : "border-zinc-700"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* Image preview strip */}
            {pendingImage && (
              <div className="relative px-2 pt-2">
                <img
                  src={pendingImage.url}
                  alt="attachment"
                  className="h-16 rounded-md object-cover border border-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                disabled={isStreaming}
                placeholder={pendingImage ? "Describe what to clone or change…" : "Describe your page, paste a URL or screenshot…"}
                className="block w-full resize-none bg-transparent px-3 pt-2.5 pb-8 leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-36 overflow-y-auto"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                {/* Image attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming}
                  className="flex h-5 w-5 items-center justify-center rounded text-zinc-600 hover:text-zinc-400 transition disabled:opacity-30"
                  title="Attach image"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-zinc-900 transition hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-zinc-700">⇧⏎ new line · paste or drag image</p>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}

// ─── Page Preview ────────────────────────────────────────────────

function PagePreview({
  spec,
  cssVars,
  onCycle,
}: {
  spec: Spec;
  cssVars: Record<string, string>;
  onCycle?: (elementKey: string, direction: "prev" | "next") => void;
}) {
  const hasThemeBackground = Boolean(cssVars["--background"]);
  const pageEl = spec.elements.page as { children?: string[] } | undefined;
  const childKeys = pageEl?.children ?? [];

  return (
    <StateProvider initialState={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{}}>
          <div
            className={`h-full overflow-y-auto p-6 ${!hasThemeBackground ? "bg-zinc-900" : ""}`}
            style={
              hasThemeBackground
                ? ({ background: cssVars["--background"] } as React.CSSProperties)
                : undefined
            }
          >
            <div
              data-theme-preview
              className={`mx-auto w-full overflow-hidden rounded-xl border shadow-xl ${
                hasThemeBackground
                  ? "border-zinc-600"
                  : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
              }`}
              style={
                {
                  transform: "translateZ(0)",
                  ...cssVars,
                  ...(hasThemeBackground ? { background: cssVars["--background"] } : {}),
                } as React.CSSProperties
              }
            >
              {cssVars["--font-sans"] && (
                <style>{`[data-theme-preview] h1,[data-theme-preview] h2,[data-theme-preview] h3,[data-theme-preview] h4{font-family:${cssVars["--font-sans"]}!important}`}</style>
              )}
              {childKeys.length > 0 ? (
                childKeys.map((key) => {
                  const element = spec.elements[key];
                  if (!element) return null;
                  const el = element as { type: string; props: { variant?: string }; children: string[] };
                  const slotId = TYPE_TO_SLOT[el.type] as SlotId | undefined;
                  const variants = slotId ? slotVariants[slotId] : null;
                  const currentVariant = el.props?.variant ?? "";
                  const currentIdx = slotId ? findVariantIdx(slotId, currentVariant) : 0;
                  const miniSpec: Spec = { root: key, elements: { [key]: element } };

                  return (
                    <div key={key} className="relative group/section">
                      <Renderer spec={miniSpec} registry={webRegistry} loading={false} />
                      {onCycle && variants && variants.length > 1 && (
                        <>
                          <button
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all opacity-0 group-hover/section:opacity-100 duration-150"
                            onClick={() => onCycle(key, "prev")}
                            title="Previous variant"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg border border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all opacity-0 group-hover/section:opacity-100 duration-150"
                            onClick={() => onCycle(key, "next")}
                            title="Next variant"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity duration-150">
                            <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/85 px-3 py-1 text-[11px] text-white backdrop-blur-sm shadow-lg">
                              <span className="font-medium">{SLOT_LABELS[slotId!]}</span>
                              <span className="text-zinc-400">·</span>
                              <span className="text-zinc-300">{variants[currentIdx].label}</span>
                              <span className="text-zinc-500">{currentIdx + 1}/{variants.length}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <Renderer spec={spec} registry={webRegistry} loading={false} />
              )}
            </div>
          </div>
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}

// ─── Tech Panel (spec, theme, tool calls) ─────────────────────────

function collectToolCalls(messages: UIMessage[]): Array<{ name: string; input: unknown; output?: unknown; state: string }> {
  const out: Array<{ name: string; input: unknown; output?: unknown; state: string }> = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const raw of msg.parts ?? []) {
      const part = getToolPart(raw);
      if (!part) continue;
      const name = part.toolName ?? (part.type as string).replace(/^tool-/, "");
      out.push({
        name,
        input: part.input,
        output: part.state === "output-available" ? part.output : undefined,
        state: part.state,
      });
    }
  }
  return out;
}

function TechPanel({
  spec,
  cssVars,
  messages,
  selectedDesignSystemId,
  onSelectDesignSystem,
}: {
  spec: Spec;
  cssVars: Record<string, string>;
  messages: UIMessage[];
  selectedDesignSystemId: string | null;
  onSelectDesignSystem: (id: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<"spec" | "theme" | "tools">("spec");
  const toolCalls = useMemo(() => collectToolCalls(messages), [messages]);

  const specJson = useMemo(() => JSON.stringify(spec, null, 2), [spec]);

  const tabs = [
    { id: "spec" as const, label: "Spec", icon: Code2 },
    { id: "theme" as const, label: "Theme", icon: Palette },
    { id: "tools" as const, label: "Tools", icon: Wrench },
  ];

  return (
    <div className="flex h-full flex-col border-l border-zinc-800 bg-zinc-900/80 text-[11px]">
      <div className="shrink-0 flex border-b border-zinc-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2 font-medium transition ${
              activeTab === id
                ? "border-b-2 border-white text-white bg-zinc-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {activeTab === "spec" && (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-300">
            {specJson}
          </pre>
        )}
        {activeTab === "theme" && (
          <ThemeSelector
            designSystems={designSystems}
            selectedId={selectedDesignSystemId}
            onSelect={onSelectDesignSystem}
            currentCssVars={cssVars}
          />
        )}
        {activeTab === "tools" && (
          <div className="space-y-2">
            {toolCalls.length === 0 ? (
              <p className="text-zinc-600">No tool calls yet.</p>
            ) : (
              toolCalls.map((call, i) => (
                <details
                  key={i}
                  className="rounded-md border border-zinc-700/60 bg-zinc-800/40 overflow-hidden"
                >
                  <summary className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer list-none text-zinc-300 hover:bg-zinc-800/60">
                    <span className={`shrink-0 ${call.state === "output-available" ? "text-emerald-400" : call.state === "error" ? "text-red-400" : "text-amber-400"}`}>
                      {call.state === "output-available" ? "✓" : call.state === "error" ? "✗" : "…"}
                    </span>
                    <span className="font-medium">{call.name}</span>
                  </summary>
                  <div className="px-2.5 pb-2 space-y-1.5 border-t border-zinc-700/60">
                    <div>
                      <span className="text-zinc-600 uppercase tracking-wider">Input</span>
                      <pre className="mt-0.5 whitespace-pre-wrap break-all font-mono text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded">
                        {JSON.stringify(call.input, null, 2)}
                      </pre>
                    </div>
                    {call.output !== undefined && (
                      <div>
                        <span className="text-zinc-600 uppercase tracking-wider">Output</span>
                        <pre className="mt-0.5 whitespace-pre-wrap break-all font-mono text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded">
                          {JSON.stringify(call.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inner component (remountable for clear) ─────────────────────

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

function SwapperContent({ onClear }: { onClear: () => void }) {
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const [selectedDesignSystemId, setSelectedDesignSystemId] = useState<string | null>(null);
  const [variantOverrides, setVariantOverrides] = useState<Record<string, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { liveSpec, cssVars } = useMemo(
    () => deriveFromMessages(messages),
    [messages]
  );

  // Apply manual variant overrides on top of AI-derived spec
  const effectiveSpec = useMemo((): Spec => {
    if (Object.keys(variantOverrides).length === 0) return liveSpec;
    const elements = { ...liveSpec.elements };
    for (const [key, variant] of Object.entries(variantOverrides)) {
      if (elements[key]) {
        const el = elements[key] as { type: string; props: Record<string, unknown>; children: string[] };
        elements[key] = { ...el, props: { ...el.props, variant } };
      }
    }
    return { ...liveSpec, elements } as Spec;
  }, [liveSpec, variantOverrides]);

  const handleCycle = React.useCallback(
    (elementKey: string, direction: "prev" | "next") => {
      setVariantOverrides((prev) => {
        const baseEl = liveSpec.elements[elementKey] as { type?: string; props?: { variant?: string } } | undefined;
        if (!baseEl?.type) return prev;
        const slotId = TYPE_TO_SLOT[baseEl.type];
        if (!slotId) return prev;
        const variants = slotVariants[slotId];
        const currentVariant = prev[elementKey] ?? (baseEl.props?.variant ?? "");
        const currentIdx = findVariantIdx(slotId, currentVariant);
        const nextIdx =
          direction === "next"
            ? (currentIdx + 1) % variants.length
            : (currentIdx - 1 + variants.length) % variants.length;
        const nextEntry = variants[nextIdx];
        const rootKey = nextEntry.spec.root;
        const nextEl = nextEntry.spec.elements[rootKey] as { props?: { variant?: string } };
        const nextVariant = nextEl?.props?.variant;
        if (!nextVariant) return prev;
        return { ...prev, [elementKey]: nextVariant };
      });
    },
    [liveSpec]
  );

  // Merge: AI-derived vars + selected prebuilt design system on top
  const effectiveCssVars = useMemo(() => {
    const prebuilt = selectedDesignSystemId ? getDesignSystem(selectedDesignSystemId) : null;
    if (!prebuilt) return cssVars;
    return { ...cssVars, ...prebuilt.variables };
  }, [cssVars, selectedDesignSystemId]);

  const handleSend = (text: string, image?: FileUIPart) => {
    if (image) {
      sendMessage({
        parts: [
          ...(text ? [{ type: "text" as const, text }] : []),
          image,
        ],
      });
    } else {
      sendMessage({ text });
    }
  };

  const isEmpty =
    effectiveSpec.elements.page &&
    (effectiveSpec.elements.page as { children: string[] }).children.length === 0;

  const canvasContent = isEmpty ? (
    <div className="flex h-full items-center justify-center bg-zinc-900">
      <div className="text-center max-w-sm px-6 space-y-4">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-zinc-800/80 p-4">
            <Sparkles className="h-10 w-10 text-zinc-400" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-zinc-200">
            Describe a site to start building
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Use the chat to describe a page, paste a URL, or attach a screenshot to clone.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <PagePreview spec={effectiveSpec} cssVars={effectiveCssVars} onCycle={handleCycle} />
  );

  return (
    <main className="flex h-screen bg-zinc-950">
      {/* Canvas — left (or fullscreen overlay) */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col bg-zinc-900"
            : "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-900"
        }
      >
        {canvasContent}
        <button
          onClick={() => setIsFullscreen((f) => !f)}
          className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition border border-zinc-700/60 backdrop-blur-sm"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Chat — middle */}
      {!isFullscreen && (
        <div className="flex w-[520px] shrink-0 flex-col border-l border-zinc-800 bg-zinc-900">
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            onSend={handleSend}
            onClear={onClear}
          />
        </div>
      )}

      {/* Tech panel — right: spec, theme, tool calls */}
      {!isFullscreen && (
        <div className="flex w-[380px] shrink-0 flex-col min-h-0">
          <TechPanel
            spec={effectiveSpec}
            cssVars={cssVars}
            messages={messages}
            selectedDesignSystemId={selectedDesignSystemId}
            onSelectDesignSystem={setSelectedDesignSystemId}
          />
        </div>
      )}
    </main>
  );
}

// ─── Main Swapper Page ───────────────────────────────────────────

export default function SwapperPage() {
  const [chatKey, setChatKey] = useState(0);
  return (
    <SwapperContent key={chatKey} onClear={() => setChatKey((k) => k + 1)} />
  );
}
