import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/** Appended to generator prompts so all output is designed for iOS iPhone viewport. */
export const IOS_DIMENSIONS_RULE = `

Design constraints (always follow):
- Target iOS iPhone viewport only: logical width 390pt, single-column layout.
- Always use Screen as the root component (it provides the phone frame, status bar, and home indicator).
- Keep layouts vertical and touch-friendly; avoid multi-column or desktop-style layouts.`;

/** Appended to generator prompts for web viewport (no phone frame). */
export const WEB_DIMENSIONS_RULE = `

Design constraints (always follow):
- Target web viewport: max width 800px, centered. Use Page as the root component (simple container, no phone frame).
- Multi-column and desktop-style layouts are allowed. Prefer Stack with direction row for side-by-side content where appropriate.
- Keep touch targets and spacing readable on both desktop and mobile web.`;

export type Platform = "mobile" | "web";

export function getDimensionsRule(platform: Platform): string {
  return platform === "web" ? WEB_DIMENSIONS_RULE : IOS_DIMENSIONS_RULE;
}

export const catalog = defineCatalog(schema, {
  components: {
    // --- Layout ---
    Page: {
      props: z.object({
        title: z.string().optional(),
      }),
      slots: ["default"],
      description:
        "Top-level web page container. Renders a simple full-width wrapper. Use as root for web layouts (not Screen).",
    },
    Screen: {
      props: z.object({
        title: z.string().optional(),
      }),
      slots: ["default"],
      description:
        "Top-level iOS screen container. Renders a rounded phone-frame with padding. Use as root.",
    },
    NavigationBar: {
      props: z.object({
        title: z.string(),
        backLabel: z.string().optional(),
        trailingLabel: z.string().optional(),
      }),
      description:
        "iOS-style navigation bar with centered title, optional leading back text, and optional trailing action text.",
    },
    Stack: {
      props: z.object({
        direction: z.enum(["row", "column"]).optional(),
        gap: z.enum(["none", "xs", "sm", "md", "lg"]).optional(),
        align: z.enum(["start", "center", "end", "stretch"]).optional(),
        padding: z.enum(["none", "sm", "md", "lg"]).optional(),
      }),
      slots: ["default"],
      description: "Flexbox container for vertical or horizontal layout.",
    },
    Spacer: {
      props: z.object({
        size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
      }),
      description: "Vertical spacer to add breathing room between sections.",
    },

    // --- Content ---
    LargeTitle: {
      props: z.object({ text: z.string() }),
      description:
        "iOS large title style (bold, 34pt-equivalent). Use at the top of a screen.",
    },
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["1", "2", "3", "4"]).optional(),
      }),
      description: "Section heading (h1–h4). Level 2 is the default.",
    },
    Text: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["body", "caption", "footnote"]).optional(),
        color: z.enum(["primary", "secondary", "tertiary", "blue", "red", "green"]).optional(),
        align: z.enum(["left", "center", "right"]).optional(),
      }),
      description: "Paragraph or label text in various iOS type styles.",
    },
    Avatar: {
      props: z.object({
        name: z.string(),
        subtitle: z.string().optional(),
        size: z.enum(["sm", "md", "lg"]).optional(),
      }),
      description:
        "Circular avatar with initials, name, and optional subtitle. Like the Settings profile row.",
    },
    Icon: {
      props: z.object({
        name: z.string(),
        color: z.enum(["blue", "green", "red", "orange", "purple", "gray"]).optional(),
      }),
      description:
        "Symbolic icon rendered as a colored rounded-square badge (iOS SF Symbol style). Use descriptive names like 'airplane', 'wifi', 'bluetooth', 'bell', 'gear', 'moon', 'battery', 'star', 'checkmark', 'heart'.",
    },

    // --- Grouped list / Settings ---
    Section: {
      props: z.object({
        header: z.string().optional(),
        footer: z.string().optional(),
      }),
      slots: ["default"],
      description:
        "iOS grouped section with optional header and footer text. Children are SettingsRow or other rows.",
    },
    SettingsRow: {
      props: z.object({
        label: z.string(),
        value: z.string().optional(),
        icon: z.string().optional(),
        iconColor: z.enum(["blue", "green", "red", "orange", "purple", "gray"]).optional(),
        showChevron: z.boolean().optional(),
        showToggle: z.boolean().optional(),
        toggleOn: z.boolean().optional(),
      }),
      description:
        "A single row in a grouped list. Supports icon badge, label, trailing value text, chevron indicator, or toggle switch. Like rows in iOS Settings.",
    },
    FeatureRow: {
      props: z.object({
        heading: z.string(),
        subheading: z.string(),
        iconColor: z.enum(["blue", "green", "red", "orange", "purple"]).optional(),
      }),
      description:
        "Feature list item with a checkmark circle, heading, and subheading. Like the iOS 'What's New' screen.",
    },

    // --- Metrics ---
    MetricGroup: {
      props: z.object({}),
      slots: ["default"],
      description:
        "Horizontal row of Metric items separated by dividers. Like the App Store ratings bar.",
    },
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string().optional(),
      }),
      description:
        "Single metric display with uppercase label, large value, and optional detail text.",
    },

    // --- Interactive ---
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "text"]).optional(),
        fullWidth: z.boolean().optional(),
      }),
      description:
        "iOS-style button. 'primary' is a filled blue rounded-rect. 'secondary' is gray. 'text' is plain blue text link.",
    },
    SearchBar: {
      props: z.object({
        placeholder: z.string().optional(),
      }),
      description: "iOS-style search bar with magnifying glass icon and rounded-rect field.",
    },
    TabBar: {
      props: z.object({
        tabs: z.array(
          z.object({
            label: z.string(),
            icon: z.string(),
            active: z.boolean().optional(),
          }),
        ),
      }),
      description:
        "iOS bottom tab bar with icon + label items. One tab should be marked active.",
    },

    // --- Cards ---
    Card: {
      props: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
      }),
      slots: ["default"],
      description: "Rounded card container with optional title and subtitle.",
    },
  },
  actions: {},
});
