"use client";

import React from "react";
import { defineRegistry, type Components } from "@json-render/react";
import { webCatalog } from "./webCatalog";

import Link from "next/link";
import { cn } from "@/lib/utils";

// --- UI primitives ---
import { Button as UiButton } from "@/components/ui/button";
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input as UiInput } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch as UiSwitch } from "@/components/ui/switch";
import {
  Accordion as UiAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const webComponents: Components<typeof webCatalog> = {
  // ─── Layout primitives ────────────────────────────────────────

  PageRoot: ({ children }) => (
    <div className="flex w-full flex-col">{children}</div>
  ),

  Container: ({ props, children }) => {
    const max =
      props.maxWidth === "tight"
        ? "max-w-[52rem]"
        : props.maxWidth === "wide"
          ? "max-w-[90rem]"
          : props.maxWidth === "full"
            ? "max-w-none"
            : "max-w-[var(--container-max)]";
    const px =
      props.paddingX === "none"
        ? "px-0"
        : props.paddingX === "sm"
          ? "px-4"
          : props.paddingX === "lg"
            ? "px-8"
            : "px-6";
    return <div className={cn("mx-auto w-full", max, px)}>{children}</div>;
  },

  Section: ({ props, children }) => {
    const py =
      props.paddingY === "none"
        ? "py-0"
        : props.paddingY === "sm"
          ? "py-8"
          : props.paddingY === "lg"
            ? "py-16"
            : props.paddingY === "xl"
              ? "py-24"
              : "py-12";
    const tone =
      props.tone === "inverted"
        ? "bg-zinc-950 text-white"
        : props.tone === "muted"
          ? "bg-muted/40"
          : "bg-transparent";
    return (
      <section id={props.id} className={cn("w-full", tone, py)}>
        {children}
      </section>
    );
  },

  Stack: ({ props, children }) => {
    const dir = props.direction === "row" ? "flex-row" : "flex-col";
    const gap =
      props.gap === "none"
        ? "gap-0"
        : props.gap === "xs"
          ? "gap-2"
          : props.gap === "sm"
            ? "gap-3"
            : props.gap === "lg"
              ? "gap-8"
              : props.gap === "xl"
                ? "gap-12"
                : "gap-5";
    const align =
      props.align === "center"
        ? "items-center"
        : props.align === "end"
          ? "items-end"
          : props.align === "stretch"
            ? "items-stretch"
            : "items-start";
    const justify =
      props.justify === "center"
        ? "justify-center"
        : props.justify === "end"
          ? "justify-end"
          : props.justify === "between"
            ? "justify-between"
            : "justify-start";
    const wrap = props.wrap ? "flex-wrap" : "flex-nowrap";
    return (
      <div className={cn("flex", dir, gap, align, justify, wrap)}>{children}</div>
    );
  },

  Grid: ({ props, children }) => {
    const cols =
      props.cols === "2"
        ? "grid-cols-2"
        : props.cols === "3"
          ? "grid-cols-3"
          : props.cols === "4"
            ? "grid-cols-4"
            : props.cols === "5"
              ? "grid-cols-5"
              : props.cols === "6"
                ? "grid-cols-6"
                : "grid-cols-1";
    const gap =
      props.gap === "none"
        ? "gap-0"
        : props.gap === "xs"
          ? "gap-2"
          : props.gap === "sm"
            ? "gap-3"
            : props.gap === "lg"
              ? "gap-8"
              : props.gap === "xl"
                ? "gap-12"
                : "gap-5";
    const align =
      props.align === "center"
        ? "items-center"
        : props.align === "end"
          ? "items-end"
          : props.align === "stretch"
            ? "items-stretch"
            : "items-start";
    return <div className={cn("grid", cols, gap, align)}>{children}</div>;
  },

  Spacer: ({ props }) => {
    const h =
      props.size === "xs"
        ? "h-2"
        : props.size === "sm"
          ? "h-4"
          : props.size === "lg"
            ? "h-10"
            : props.size === "xl"
              ? "h-16"
              : "h-6";
    return <div className={h} />;
  },

  // ─── Typography ───────────────────────────────────────────────

  Heading: ({ props }) => {
    const level = props.level ?? "2";
    const align =
      props.align === "center"
        ? "text-center"
        : props.align === "right"
          ? "text-right"
          : "text-left";
    const tone =
      props.tone === "inverted"
        ? "text-white"
        : props.tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
    const cls =
      level === "1"
        ? "text-4xl md:text-5xl tracking-tight"
        : level === "2"
          ? "text-3xl md:text-4xl tracking-tight"
          : level === "3"
            ? "text-xl md:text-2xl"
            : "text-lg md:text-xl";
    const headingStyle: React.CSSProperties = {
      fontFamily: "var(--theme-font-heading, inherit)",
      fontWeight: "var(--theme-font-heading-weight, 700)" as React.CSSProperties["fontWeight"],
    };

    if (level === "1") return <h1 className={cn(cls, align, tone)} style={headingStyle}>{props.text}</h1>;
    if (level === "3") return <h3 className={cn(cls, align, tone)} style={headingStyle}>{props.text}</h3>;
    if (level === "4") return <h4 className={cn(cls, align, tone)} style={headingStyle}>{props.text}</h4>;
    return <h2 className={cn(cls, align, tone)} style={headingStyle}>{props.text}</h2>;
  },

  Text: ({ props }) => {
    const align =
      props.align === "center"
        ? "text-center"
        : props.align === "right"
          ? "text-right"
          : "text-left";
    const tone =
      props.tone === "inverted"
        ? "text-white/80"
        : props.tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground/90";
    const size =
      props.size === "xs"
        ? "text-xs"
        : props.size === "sm"
          ? "text-sm"
          : props.size === "lg"
            ? "text-lg"
            : "text-base";
    return <p className={cn(size, align, tone, "leading-relaxed")}>{props.text}</p>;
  },

  Kicker: ({ props }) => {
    const tone =
      props.tone === "inverted"
        ? "text-white/70"
        : props.tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground/70";
    return (
      <p className={cn("text-xs font-semibold uppercase tracking-wider", tone)}>
        {props.text}
      </p>
    );
  },

  // ─── UI primitives ────────────────────────────────────────────

  Button: ({ props }) => {
    const content = <>{props.label}</>;
    if (props.href) {
      return (
        <UiButton asChild variant={props.variant} size={props.size}>
          <Link href={props.href}>{content}</Link>
        </UiButton>
      );
    }
    return (
      <UiButton type="button" variant={props.variant} size={props.size}>
        {content}
      </UiButton>
    );
  },

  Badge: ({ props }) => <UiBadge variant={props.variant}>{props.text}</UiBadge>,

  Card: ({ props, children }) => (
    <UiCard>
      {(props.title || props.description) && (
        <CardHeader>
          {props.title && <CardTitle>{props.title}</CardTitle>}
          {props.description && <CardDescription>{props.description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </UiCard>
  ),

  Divider: ({ props }) => (
    <Separator orientation={props.orientation ?? "horizontal"} />
  ),

  Input: ({ props }) => (
    <div className="flex flex-col gap-1.5">
      {props.label && <UiLabel>{props.label}</UiLabel>}
      <UiInput
        name={props.name}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
      />
    </div>
  ),

  SelectField: ({ props }) => (
    <div className="flex flex-col gap-1.5">
      {props.label && <UiLabel>{props.label}</UiLabel>}
      <UiSelect>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.placeholder ?? "Select…"} />
        </SelectTrigger>
        <SelectContent>
          {(props.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </div>
  ),

  Textarea: ({ props }) => (
    <div className="flex flex-col gap-1.5">
      {props.label && <UiLabel>{props.label}</UiLabel>}
      <UiTextarea
        name={props.name}
        placeholder={props.placeholder}
        rows={props.rows ?? 4}
      />
    </div>
  ),

  Rating: ({ props }) => {
    const max = props.max ?? 5;
    return (
      <div className="flex flex-col gap-1.5">
        {props.label && <UiLabel>{props.label}</UiLabel>}
        <div className="flex gap-1 text-2xl">
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className="cursor-pointer select-none opacity-30 transition hover:opacity-100">
              ⭐
            </span>
          ))}
        </div>
      </div>
    );
  },

  Switch: ({ props }) => (
    <div className="flex items-center gap-2">
      <UiSwitch id={props.name} />
      {props.label && <UiLabel htmlFor={props.name}>{props.label}</UiLabel>}
    </div>
  ),

  Link: ({ props }) => (
    <a
      href={props.href}
      className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
    >
      {props.label}
    </a>
  ),

  Accordion: ({ props }) => {
    const items = props.items ?? [];
    return (
      <UiAccordion type="multiple" className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </UiAccordion>
    );
  },

  Separator: ({ props }) => (
    <Separator orientation={props.orientation ?? "horizontal"} />
  ),
};

const { registry: webRegistry } = defineRegistry(webCatalog, {
  components: webComponents,
});

export { webRegistry };
