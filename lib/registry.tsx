"use client";

import { defineRegistry, type Components } from "@json-render/react";
import { catalog } from "./catalog";

const iconMap: Record<string, string> = {
  airplane: "✈️",
  wifi: "📶",
  bluetooth: "🔵",
  bell: "🔔",
  gear: "⚙️",
  moon: "🌙",
  battery: "🔋",
  star: "⭐",
  checkmark: "✓",
  heart: "❤️",
  phone: "📱",
  lock: "🔒",
  person: "👤",
  camera: "📷",
  mail: "✉️",
  clock: "🕐",
  map: "🗺️",
  music: "🎵",
  search: "🔍",
  shield: "🛡️",
  chart: "📊",
  folder: "📁",
  paintbrush: "🖌️",
  speaker: "🔊",
  eye: "👁️",
  gamecontroller: "🎮",
  cart: "🛒",
  book: "📖",
  cloud: "☁️",
  sun: "☀️",
  "arrow.right": "→",
};

function getIcon(name: string) {
  return iconMap[name.toLowerCase()] ?? name.charAt(0).toUpperCase();
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500" },
  green: { bg: "bg-green-500", text: "text-green-500" },
  red: { bg: "bg-red-500", text: "text-red-500" },
  orange: { bg: "bg-orange-500", text: "text-orange-500" },
  purple: { bg: "bg-purple-500", text: "text-purple-500" },
  gray: { bg: "bg-gray-500", text: "text-gray-500" },
};

function iconBadge(name: string, color?: string | null) {
  const c = colorClasses[color ?? "blue"] ?? colorClasses.blue;
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm text-white ${c.bg}`}
    >
      {getIcon(name)}
    </span>
  );
}

const iosComponents: Components<typeof catalog> = {
  Page: ({ children }) => (
    <div className="flex w-full flex-col gap-0 bg-white dark:bg-zinc-950">
      {children}
    </div>
  ),
  Screen: ({ props, children }) => (
      <div className="mx-auto flex w-full flex-col overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-[#f2f2f7] shadow-2xl dark:border-zinc-700 dark:bg-[#000]">
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pb-1 pt-3">
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
            9:41
          </span>
          <div className="flex items-center gap-1 text-zinc-900 dark:text-white">
            <span className="text-xs">●●●●</span>
            <span className="text-xs">📶</span>
            <span className="text-xs">🔋</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0 px-0 pb-2">
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1">
          <div className="h-[5px] w-[134px] rounded-full bg-zinc-900 dark:bg-white" />
        </div>
      </div>
    ),

    NavigationBar: ({ props }) => (
      <div className="flex items-center justify-between px-4 py-2">
        {props.backLabel ? (
          <span className="text-[17px] text-blue-500">‹ {props.backLabel}</span>
        ) : (
          <span />
        )}
        <span className="text-[17px] font-semibold text-zinc-900 dark:text-white">
          {props.title}
        </span>
        {props.trailingLabel ? (
          <span className="text-[17px] text-blue-500">{props.trailingLabel}</span>
        ) : (
          <span />
        )}
      </div>
    ),

    Stack: ({ props, children }) => {
      const gapMap: Record<string, string> = {
        none: "0",
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
      };
      const paddingMap: Record<string, string> = {
        none: "0",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
      };
      const alignMap: Record<string, string> = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        stretch: "stretch",
      };
      return (
        <div
          className="flex"
          style={{
            flexDirection: props.direction === "row" ? "row" : "column",
            gap: gapMap[props.gap ?? "md"],
            alignItems: alignMap[props.align ?? "stretch"],
            padding: paddingMap[props.padding ?? "none"],
          }}
        >
          {children}
        </div>
      );
    },

    Spacer: ({ props }) => {
      const sizeMap: Record<string, string> = {
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      };
      return <div style={{ height: sizeMap[props.size ?? "md"] }} />;
    },

    LargeTitle: ({ props }) => (
      <h1 className="px-4 text-[34px] font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
        {props.text}
      </h1>
    ),

    Heading: ({ props }) => {
      const level = props.level ?? "2";
      const sizes: Record<string, string> = {
        "1": "text-[28px] font-bold",
        "2": "text-[22px] font-bold",
        "3": "text-[20px] font-semibold",
        "4": "text-[17px] font-semibold",
      };
      return (
        <p className={`px-4 tracking-tight text-zinc-900 dark:text-white ${sizes[level]}`}>
          {props.text}
        </p>
      );
    },

    Text: ({ props }) => {
      const variants: Record<string, string> = {
        body: "text-[17px] leading-[22px]",
        caption: "text-[13px] leading-[18px]",
        footnote: "text-[12px] leading-[16px]",
      };
      const colors: Record<string, string> = {
        primary: "text-zinc-900 dark:text-white",
        secondary: "text-zinc-500 dark:text-zinc-400",
        tertiary: "text-zinc-400 dark:text-zinc-500",
        blue: "text-blue-500",
        red: "text-red-500",
        green: "text-green-500",
      };
      const aligns: Record<string, string> = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      };
      return (
        <p
          className={`px-4 ${variants[props.variant ?? "body"]} ${colors[props.color ?? "primary"]} ${aligns[props.align ?? "left"]}`}
        >
          {props.text}
        </p>
      );
    },

    Avatar: ({ props }) => {
      const sizes: Record<string, string> = {
        sm: "h-10 w-10 text-sm",
        md: "h-14 w-14 text-lg",
        lg: "h-[60px] w-[60px] text-xl",
      };
      const initials = props.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="flex items-center gap-3 px-4">
          <div
            className={`flex items-center justify-center rounded-full bg-zinc-300 font-semibold text-white dark:bg-zinc-600 ${sizes[props.size ?? "lg"]}`}
          >
            {initials}
          </div>
          <div>
            <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
              {props.name}
            </p>
            {props.subtitle && (
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                {props.subtitle}
              </p>
            )}
          </div>
        </div>
      );
    },

    Icon: ({ props }) => iconBadge(props.name, props.color),

    Section: ({ props, children }) => (
      <div className="flex flex-col">
        {props.header && (
          <p className="px-5 pb-1 pt-2 text-[13px] uppercase text-zinc-500 dark:text-zinc-400">
            {props.header}
          </p>
        )}
        <div className="mx-4 divide-y divide-zinc-200 overflow-hidden rounded-xl bg-white dark:divide-zinc-700/60 dark:bg-zinc-800/80">
          {children}
        </div>
        {props.footer && (
          <p className="px-5 pb-1 pt-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
            {props.footer}
          </p>
        )}
      </div>
    ),

    SettingsRow: ({ props }) => (
      <div className="flex items-center gap-3 px-4 py-[10px]">
        {props.icon && iconBadge(props.icon, props.iconColor)}
        <span className="flex-1 text-[17px] text-zinc-900 dark:text-white">
          {props.label}
        </span>
        {props.showToggle ? (
          <div
            className={`h-[31px] w-[51px] rounded-full p-[2px] transition ${props.toggleOn ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <div
              className={`h-[27px] w-[27px] rounded-full bg-white shadow transition-transform ${props.toggleOn ? "translate-x-[20px]" : "translate-x-0"}`}
            />
          </div>
        ) : (
          <>
            {props.value && (
              <span className="text-[17px] text-zinc-500 dark:text-zinc-400">
                {props.value}
              </span>
            )}
            {props.showChevron !== false && !props.showToggle && (
              <span className="text-[13px] text-zinc-300 dark:text-zinc-600">›</span>
            )}
          </>
        )}
      </div>
    ),

    FeatureRow: ({ props }) => {
      const c = colorClasses[props.iconColor ?? "blue"] ?? colorClasses.blue;
      return (
        <div className="flex items-start gap-3 px-6 py-3">
          <span
            className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${c.text} border-2 border-current`}
          >
            ✓
          </span>
          <div>
            <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
              {props.heading}
            </p>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
              {props.subheading}
            </p>
          </div>
        </div>
      );
    },

    MetricGroup: ({ children }) => (
      <div className="mx-4 flex items-center divide-x divide-zinc-200 overflow-hidden rounded-xl bg-white dark:divide-zinc-700/60 dark:bg-zinc-800/80">
        {children}
      </div>
    ),

    Metric: ({ props }) => (
      <div className="flex flex-1 flex-col items-center px-3 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {props.label}
        </p>
        <p className="text-[20px] font-bold text-zinc-900 dark:text-white">
          {props.value}
        </p>
        {props.detail && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {props.detail}
          </p>
        )}
      </div>
    ),

    Button: ({ props, emit }) => {
      const variant = props.variant ?? "primary";
      const base = props.fullWidth ? "w-full" : "";
      if (variant === "text") {
        return (
          <button
            type="button"
            onClick={() => emit("press")}
            className={`px-4 py-1 text-[17px] font-medium text-blue-500 ${base}`}
          >
            {props.label}
          </button>
        );
      }
      const filled =
        variant === "primary"
          ? "bg-blue-500 text-white"
          : "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white";
      return (
        <div className="px-4">
          <button
            type="button"
            onClick={() => emit("press")}
            className={`rounded-xl py-3 text-[17px] font-semibold ${filled} ${base || "w-full"}`}
          >
            {props.label}
          </button>
        </div>
      );
    },

    SearchBar: ({ props }) => (
      <div className="px-4">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-200/70 px-3 py-2 dark:bg-zinc-800">
          <span className="text-zinc-400">🔍</span>
          <span className="text-[17px] text-zinc-400 dark:text-zinc-500">
            {props.placeholder ?? "Search"}
          </span>
        </div>
      </div>
    ),

    TabBar: ({ props }) => (
      <div className="mt-auto border-t border-zinc-200 bg-[#f9f9f9]/90 backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-900/90">
        <div className="flex justify-around px-2 pb-1 pt-1.5">
          {(props.tabs ?? []).map((tab) => (
            <div key={tab.label} className="flex flex-col items-center gap-0.5">
              <span
                className={`text-[22px] ${tab.active ? "text-blue-500" : "text-zinc-400 dark:text-zinc-500"}`}
              >
                {getIcon(tab.icon)}
              </span>
              <span
                className={`text-[10px] ${tab.active ? "font-medium text-blue-500" : "text-zinc-400 dark:text-zinc-500"}`}
              >
                {tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    Card: ({ props, children }) => (
      <div className="mx-4 overflow-hidden rounded-xl bg-white p-4 dark:bg-zinc-800/80">
        {props.title && (
          <p className="mb-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
            {props.title}
          </p>
        )}
        {props.subtitle && (
          <p className="mb-2 text-[13px] text-zinc-500 dark:text-zinc-400">
            {props.subtitle}
          </p>
        )}
        {children}
      </div>
    ),
};

// Minimal style: flatter, less rounded, simpler borders
const minimalComponents: Components<typeof catalog> = {
  ...iosComponents,
  Screen: ({ props, children }) => (
    <div className="mx-auto flex w-full flex-col overflow-hidden rounded-lg border border-zinc-300 bg-zinc-50 shadow dark:border-zinc-600 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">9:41</span>
        <div className="flex gap-1 text-zinc-600 dark:text-zinc-400">
          <span className="text-xs">●●●●</span><span className="text-xs">🔋</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0 px-0 py-2">{children}</div>
      <div className="flex justify-center border-t border-zinc-200 py-1.5 dark:border-zinc-700">
        <div className="h-1 w-24 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      </div>
    </div>
  ),
  Section: ({ props, children }) => (
    <div className="flex flex-col">
      {props.header && (
        <p className="px-4 pb-1 pt-2 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
          {props.header}
        </p>
      )}
      <div className="mx-4 border border-zinc-200 divide-y divide-zinc-200 overflow-hidden rounded-md bg-white dark:border-zinc-700 dark:divide-zinc-700 dark:bg-zinc-800/60">
        {children}
      </div>
      {props.footer && (
        <p className="px-4 pb-1 pt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          {props.footer}
        </p>
      )}
    </div>
  ),
  Button: ({ props, emit }) => {
    const variant = props.variant ?? "primary";
    const base = props.fullWidth ? "w-full" : "";
    if (variant === "text") {
      return (
        <button
          type="button"
          onClick={() => emit("press")}
          className={`px-4 py-1 text-sm font-medium text-blue-600 ${base} dark:text-blue-400`}
        >
          {props.label}
        </button>
      );
    }
    const filled =
      variant === "primary"
        ? "bg-blue-600 text-white dark:bg-blue-500"
        : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";
    return (
      <div className="px-4">
        <button
          type="button"
          onClick={() => emit("press")}
          className={`rounded-md py-2.5 text-sm font-semibold ${filled} ${base || "w-full"}`}
        >
          {props.label}
        </button>
      </div>
    );
  },
  SearchBar: ({ props }) => (
    <div className="px-4">
      <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-zinc-400">🔍</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {props.placeholder ?? "Search"}
        </span>
      </div>
    </div>
  ),
  Card: ({ props, children }) => (
    <div className="mx-4 overflow-hidden rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
      {props.title && (
        <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
          {props.title}
        </p>
      )}
      {props.subtitle && (
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          {props.subtitle}
        </p>
      )}
      {children}
    </div>
  ),
  MetricGroup: ({ children }) => (
    <div className="mx-4 flex items-center divide-x divide-zinc-200 overflow-hidden rounded-md border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60">
      {children}
    </div>
  ),
};

// Airbnb style: warm tones, Rausch red (#FF385C), pill shapes, clean dividers
const airbnbColorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-[#428BFF]", text: "text-[#428BFF]" },
  green: { bg: "bg-[#008A05]", text: "text-[#008A05]" },
  red: { bg: "bg-[#FF385C]", text: "text-[#FF385C]" },
  orange: { bg: "bg-[#E07912]", text: "text-[#E07912]" },
  purple: { bg: "bg-[#7B2CBF]", text: "text-[#7B2CBF]" },
  gray: { bg: "bg-[#717171]", text: "text-[#717171]" },
};

function airbnbIconBadge(name: string, color?: string | null) {
  const c = airbnbColorClasses[color ?? "red"] ?? airbnbColorClasses.red;
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-white ${c.bg}`}
    >
      {getIcon(name)}
    </span>
  );
}

const airbnbComponents: Components<typeof catalog> = {
  ...iosComponents,

  Page: ({ children }) => (
    <div className="flex w-full flex-col gap-0 bg-white font-[system-ui]">
      {children}
    </div>
  ),

  Screen: ({ props, children }) => (
    <div className="mx-auto flex w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl">
      <div className="flex items-center justify-between px-6 pb-0.5 pt-3">
        <span className="text-[15px] font-semibold text-zinc-900">9:41</span>
        <div className="flex items-center gap-1 text-zinc-900">
          <span className="text-xs">●●●●</span>
          <span className="text-xs">📶</span>
          <span className="text-xs">🔋</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0 px-0 pb-2">
        {children}
      </div>
      <div className="flex justify-center pb-2 pt-1">
        <div className="h-[5px] w-[134px] rounded-full bg-zinc-900" />
      </div>
    </div>
  ),

  NavigationBar: ({ props }) => (
    <div className="flex items-center justify-between px-4 py-2.5">
      {props.backLabel ? (
        <span className="text-[16px] font-medium text-zinc-900">‹ {props.backLabel}</span>
      ) : (
        <span />
      )}
      <span className="text-[16px] font-semibold text-zinc-900">
        {props.title}
      </span>
      {props.trailingLabel ? (
        <span className="text-[16px] font-semibold text-zinc-900 underline underline-offset-2">
          {props.trailingLabel}
        </span>
      ) : (
        <span />
      )}
    </div>
  ),

  LargeTitle: ({ props }) => (
    <h1 className="px-6 text-[26px] font-extrabold leading-tight tracking-tight text-zinc-900">
      {props.text}
    </h1>
  ),

  Heading: ({ props }) => {
    const level = props.level ?? "2";
    const sizes: Record<string, string> = {
      "1": "text-[24px] font-extrabold",
      "2": "text-[22px] font-bold",
      "3": "text-[18px] font-bold",
      "4": "text-[16px] font-semibold",
    };
    return (
      <p className={`px-6 tracking-tight text-zinc-900 ${sizes[level]}`}>
        {props.text}
      </p>
    );
  },

  Text: ({ props }) => {
    const variants: Record<string, string> = {
      body: "text-[16px] leading-[22px]",
      caption: "text-[14px] leading-[18px]",
      footnote: "text-[12px] leading-[16px]",
    };
    const colors: Record<string, string> = {
      primary: "text-zinc-900",
      secondary: "text-[#717171]",
      tertiary: "text-[#B0B0B0]",
      blue: "text-[#428BFF]",
      red: "text-[#FF385C]",
      green: "text-[#008A05]",
    };
    const aligns: Record<string, string> = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    return (
      <p className={`px-6 ${variants[props.variant ?? "body"]} ${colors[props.color ?? "primary"]} ${aligns[props.align ?? "left"]}`}>
        {props.text}
      </p>
    );
  },

  Avatar: ({ props }) => {
    const sizes: Record<string, string> = {
      sm: "h-10 w-10 text-sm",
      md: "h-14 w-14 text-lg",
      lg: "h-[56px] w-[56px] text-xl",
    };
    const initials = props.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <div className="flex items-center gap-4 px-6">
        <div
          className={`flex items-center justify-center rounded-full bg-zinc-900 font-bold text-white ${sizes[props.size ?? "lg"]}`}
        >
          {initials}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-zinc-900">
            {props.name}
          </p>
          {props.subtitle && (
            <p className="text-[14px] text-[#717171]">
              {props.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  },

  Icon: ({ props }) => airbnbIconBadge(props.name, props.color),

  Section: ({ props, children }) => (
    <div className="flex flex-col">
      {props.header && (
        <p className="px-6 pb-2 pt-4 text-[12px] font-bold uppercase tracking-wider text-[#717171]">
          {props.header}
        </p>
      )}
      <div className="mx-0 divide-y divide-zinc-200">
        {children}
      </div>
      {props.footer && (
        <p className="px-6 pb-2 pt-1.5 text-[12px] text-[#717171]">
          {props.footer}
        </p>
      )}
    </div>
  ),

  SettingsRow: ({ props }) => (
    <div className="flex items-center gap-3 px-6 py-[14px]">
      {props.icon && airbnbIconBadge(props.icon, props.iconColor)}
      <span className="flex-1 text-[16px] text-zinc-900">
        {props.label}
      </span>
      {props.showToggle ? (
        <div
          className={`h-[28px] w-[48px] rounded-full p-[2px] transition ${props.toggleOn ? "bg-zinc-900" : "bg-zinc-300"}`}
        >
          <div
            className={`h-[24px] w-[24px] rounded-full bg-white shadow transition-transform ${props.toggleOn ? "translate-x-[20px]" : "translate-x-0"}`}
          />
        </div>
      ) : (
        <>
          {props.value && (
            <span className="text-[14px] text-[#717171]">
              {props.value}
            </span>
          )}
          {props.showChevron !== false && !props.showToggle && (
            <span className="text-[14px] text-zinc-400">›</span>
          )}
        </>
      )}
    </div>
  ),

  FeatureRow: ({ props }) => {
    const c = airbnbColorClasses[props.iconColor ?? "red"] ?? airbnbColorClasses.red;
    return (
      <div className="flex items-start gap-4 px-6 py-4">
        <span
          className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${c.bg} text-sm text-white`}
        >
          ✓
        </span>
        <div className="flex-1">
          <p className="text-[16px] font-semibold text-zinc-900">
            {props.heading}
          </p>
          <p className="text-[14px] text-[#717171]">
            {props.subheading}
          </p>
        </div>
      </div>
    );
  },

  MetricGroup: ({ children }) => (
    <div className="mx-6 flex items-center divide-x divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {children}
    </div>
  ),

  Metric: ({ props }) => (
    <div className="flex flex-1 flex-col items-center px-3 py-4">
      <p className="text-[22px] font-extrabold text-zinc-900">
        {props.value}
      </p>
      <p className="text-[12px] font-medium text-[#717171]">
        {props.label}
      </p>
      {props.detail && (
        <p className="text-[11px] text-[#B0B0B0]">
          {props.detail}
        </p>
      )}
    </div>
  ),

  Button: ({ props, emit }) => {
    const variant = props.variant ?? "primary";
    const base = props.fullWidth ? "w-full" : "";
    if (variant === "text") {
      return (
        <button
          type="button"
          onClick={() => emit("press")}
          className={`px-6 py-1 text-[16px] font-semibold text-zinc-900 underline underline-offset-2 ${base}`}
        >
          {props.label}
        </button>
      );
    }
    const filled =
      variant === "primary"
        ? "bg-[#FF385C] text-white"
        : "border border-zinc-900 bg-white text-zinc-900";
    return (
      <div className="px-6">
        <button
          type="button"
          onClick={() => emit("press")}
          className={`rounded-lg py-3.5 text-[16px] font-semibold ${filled} ${base || "w-full"}`}
        >
          {props.label}
        </button>
      </div>
    );
  },

  SearchBar: ({ props }) => (
    <div className="px-6">
      <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 shadow-sm">
        <span className="text-[18px] text-zinc-900">🔍</span>
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-zinc-900">
            {props.placeholder ?? "Where to?"}
          </span>
          <span className="text-[12px] text-[#717171]">
            Anywhere · Any week · Add guests
          </span>
        </div>
      </div>
    </div>
  ),

  TabBar: ({ props }) => (
    <div className="mt-auto border-t border-zinc-200 bg-white">
      <div className="flex justify-around px-2 pb-1 pt-2">
        {(props.tabs ?? []).map((tab) => (
          <div key={tab.label} className="flex flex-col items-center gap-0.5">
            <span
              className={`text-[22px] ${tab.active ? "text-[#FF385C]" : "text-[#717171]"}`}
            >
              {getIcon(tab.icon)}
            </span>
            <span
              className={`text-[10px] font-medium ${tab.active ? "text-[#FF385C]" : "text-[#717171]"}`}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),

  Card: ({ props, children }) => (
    <div className="mx-6 overflow-hidden rounded-xl bg-white">
      {props.title && (
        <p className="mb-1 text-[18px] font-bold text-zinc-900">
          {props.title}
        </p>
      )}
      {props.subtitle && (
        <p className="mb-2 text-[14px] text-[#717171]">
          {props.subtitle}
        </p>
      )}
      {children}
    </div>
  ),
};

const { registry } = defineRegistry(catalog, { components: iosComponents });
const { registry: registryMinimal } = defineRegistry(catalog, { components: minimalComponents });
const { registry: registryAirbnb } = defineRegistry(catalog, { components: airbnbComponents });

export { registry };
export const registries = {
  ios: registry,
  minimal: registryMinimal,
  airbnb: registryAirbnb,
} as const;
export type StyleId = keyof typeof registries;
export const STYLE_IDS: StyleId[] = ["ios", "minimal", "airbnb"];
