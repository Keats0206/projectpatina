"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string }> = [
  { href: "/swapper", label: "Swap" },
  { href: "/render", label: "Render" },
  { href: "/new-test", label: "New Test" },
];

export function AppNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90",
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
          P
        </span>
        <span className="text-sm tracking-tight">Patina</span>
      </Link>

      <nav className="flex items-center gap-5 text-sm">
        {ITEMS.map((it) => {
          const isActive = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "transition-colors",
                isActive
                  ? "font-medium text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

