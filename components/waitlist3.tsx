"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Waitlist3Props {
  companyLogo?: string;
  badge?: string;
  heading?: string;
  description?: string;
  joinedPeople?: number;
  avatars?: string[];
  companyName?: string;
  companyUrl?: string;
  image?: string;
  className?: string;
}

type JoinState = "idle" | "submitting" | "joined" | "error";

export function Waitlist3({
  companyLogo = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg",
  badge = "BETA INVITE · 2026",
  heading = "Software that notices you noticing it.",
  description = "Tell it what you’re building. It will shape itself around you. Join the waitlist to get in first.",
  joinedPeople = 165,
  avatars = [
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/alexander-hipp-iEEBWgY_6lA-unsplash.jpg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/michael-dam-mEZ3PoFGs_k-unsplash.jpg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/portraits/nima-motaghian-nejad-_omdf_EgRUo-unsplash.jpg",
  ],
  companyName = "Project Patina",
  companyUrl = "https://example.com",
  image = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/Geometric Staircase and Concrete Wall.jpeg",
  className,
}: Waitlist3Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<JoinState>("idle");

  const year = useMemo(() => new Date().getFullYear(), []);

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (state === "submitting" || state === "joined") return;
    setState("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState("joined");
    } catch {
      setState("error");
    }
  }

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden py-20 lg:min-h-screen lg:py-24",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-zinc-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,.08)_1px,transparent_0)] [background-size:28px_28px] opacity-30" />
      </div>

      <div className="container">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col justify-between gap-12">
            <div className="flex items-center gap-3">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="h-10 w-auto opacity-90 invert"
                loading="lazy"
              />
              <div className="h-6 w-px bg-white/15" />
              <p className="text-xs font-medium tracking-wide text-white/70">
                a living interface experiment
              </p>
            </div>

            <div className="flex max-w-xl flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white/80"
                >
                  {badge}
                </Badge>
                {state === "joined" && (
                  <Badge className="bg-emerald-500/15 text-emerald-200">
                    You’re in
                  </Badge>
                )}
                {state === "error" && (
                  <Badge className="bg-red-500/15 text-red-200">
                    Try again
                  </Badge>
                )}
              </div>

              <h1 className="text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {heading}
              </h1>

              <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/70 md:text-base">
                {description}
              </p>

              <div className="mt-1 flex flex-col gap-4">
                <form onSubmit={onJoin} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-white/25 dark:bg-white/5"
                  />
                  <Button
                    type="submit"
                    disabled={state === "submitting" || state === "joined"}
                    className="bg-white text-zinc-950 hover:bg-white/90"
                  >
                    {state === "submitting"
                      ? "Joining…"
                      : state === "joined"
                        ? "Joined"
                        : "Join waitlist"}
                  </Button>
                </form>

                <div className="flex items-center">
                  <div className="relative flex items-center">
                    {avatars.map((avatar, index) => (
                      <img
                        key={`waitlist-avatar-${index}`}
                        src={avatar}
                        alt={`Joined person ${index + 1}`}
                        style={{ transform: `translateX(-${index * 10}px)` }}
                        className="size-8 rounded-full border border-white/15 bg-white/10 object-cover object-top p-[1px]"
                        loading="lazy"
                      />
                    ))}
                    <p
                      style={{
                        transform: `translateX(-${Math.max(0, avatars.length - 2) * 10}px)`,
                      }}
                      className="text-xs text-white/55"
                    >
                      {joinedPeople}+ people already joined
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/45">
              © {year} ·{" "}
              <a
                href={companyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                {companyName}
              </a>{" "}
              · All rights reserved.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <img
              src={image}
              alt="Waitlist Image"
              className="h-full max-h-[440px] w-full object-cover lg:max-h-none"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

