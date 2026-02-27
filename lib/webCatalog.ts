import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const webCatalog = defineCatalog(schema, {
  components: {
    // --- Layout ---
    PageRoot: {
      props: z.object({}),
      slots: ["default"],
      description: "Top-level page wrapper. Use as the root for all web page compositions.",
    },

    Container: {
      props: z.object({
        maxWidth: z.enum(["tight", "default", "wide", "full"]).optional(),
        paddingX: z.enum(["none", "sm", "md", "lg"]).optional(),
      }),
      slots: ["default"],
      description:
        "Centered max-width container with horizontal padding. Use inside sections for consistent layout.",
    },

    Section: {
      props: z.object({
        id: z.string().optional(),
        paddingY: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
        tone: z.enum(["default", "muted", "inverted"]).optional(),
      }),
      slots: ["default"],
      description:
        "Semantic page section with optional background tone and vertical padding.",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["row", "column"]).optional(),
        gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
        align: z.enum(["start", "center", "end", "stretch"]).optional(),
        justify: z.enum(["start", "center", "end", "between"]).optional(),
        wrap: z.boolean().optional(),
      }),
      slots: ["default"],
      description:
        "Flexbox layout helper. Use for most vertical/horizontal layout composition.",
    },

    Grid: {
      props: z.object({
        cols: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
        gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
        align: z.enum(["start", "center", "end", "stretch"]).optional(),
      }),
      slots: ["default"],
      description:
        "CSS grid layout helper for cards, galleries, and responsive blocks.",
    },

    Spacer: {
      props: z.object({
        size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
      }),
      description: "Vertical spacer for rhythm between blocks.",
    },

    // --- Typography ---
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["1", "2", "3", "4"]).optional(),
        align: z.enum(["left", "center", "right"]).optional(),
        tone: z.enum(["default", "muted", "inverted"]).optional(),
      }),
      description: "Heading text (h1-h4) with simple alignment + tone variants.",
    },
    Text: {
      props: z.object({
        text: z.string(),
        size: z.enum(["xs", "sm", "md", "lg"]).optional(),
        align: z.enum(["left", "center", "right"]).optional(),
        tone: z.enum(["default", "muted", "inverted"]).optional(),
      }),
      description: "Body text with size + alignment + tone variants.",
    },
    Kicker: {
      props: z.object({
        text: z.string(),
        tone: z.enum(["default", "muted", "inverted"]).optional(),
      }),
      description: "Small uppercase label for section intros (eyebrow/kicker).",
    },

    // --- UI primitives ---
    Button: {
      props: z.object({
        label: z.string(),
        href: z.string().optional(),
        variant: z
          .enum(["default", "secondary", "outline", "ghost", "link", "destructive"])
          .optional(),
        size: z
          .enum(["xs", "sm", "default", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"])
          .optional(),
      }),
      description: "Button or link button. Use for CTAs and primary actions.",
    },
    Badge: {
      props: z.object({
        text: z.string(),
        variant: z
          .enum(["default", "secondary", "outline", "ghost", "link", "destructive"])
          .optional(),
      }),
      description: "Small badge/pill for labels like 'New', 'Popular', etc.",
    },
    Card: {
      props: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
      slots: ["default"],
      description:
        "Card container with optional title/description header. Put content in the default slot.",
    },
    Divider: {
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).optional(),
      }),
      description: "Visual divider line. Use to separate sections or columns.",
    },

    // --- Form primitives ---
    Input: {
      props: z.object({
        label: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        type: z.enum(["text", "email", "password", "number", "tel", "url"]).optional(),
      }),
      description: "Text input with optional label. Supports common HTML input types.",
    },
    SelectField: {
      props: z.object({
        label: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        options: z.array(z.string()),
      }),
      description: "Dropdown select with label and list of string options.",
    },
    Textarea: {
      props: z.object({
        label: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        rows: z.number().optional(),
      }),
      description: "Multi-line text area with optional label.",
    },
    Rating: {
      props: z.object({
        max: z.number().optional(),
        label: z.string().optional(),
      }),
      description: "Star rating display (1-5 stars). Read-only visual indicator.",
    },

    // --- Interactive ---
    Switch: {
      props: z.object({
        label: z.string().optional(),
        name: z.string().optional(),
      }),
      description: "Toggle switch. Use for boolean settings like billing toggles.",
    },
    Link: {
      props: z.object({
        label: z.string(),
        href: z.string(),
      }),
      description: "Simple text link for navigation.",
    },
    Accordion: {
      props: z.object({
        items: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
          })
        ).optional(),
      }),
      description: "Collapsible accordion for FAQs and expandable content.",
    },
    Separator: {
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).optional(),
      }),
      description: "Visual separator line (alias for Divider).",
    },
  },
  actions: {},
});
