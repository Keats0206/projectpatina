// Component manifest — single source of metadata for spec resolution.
// Each entry represents one variant (one component) with tags for matching
// a section role + style description to a concrete blockType + variant.

export type BlockType =
  | "NavbarBlock"
  | "HeroBlock"
  | "FeatureBlock"
  | "GalleryBlock"
  | "LogosBlock"
  | "PricingBlock"
  | "TestimonialBlock"
  | "FooterBlock";

export type SectionRole =
  | "navbar"
  | "hero"
  | "features"
  | "gallery"
  | "logos"
  | "pricing"
  | "testimonials"
  | "footer";

export interface ManifestEntry {
  blockType: BlockType;
  role: SectionRole;
  variant: string;
  label: string;
  layout?: string;
  tags: string[];
  default?: true;
}

export const componentManifest: ManifestEntry[] = [
  // ─── Navbar ─────────────────────────────────────────────────────
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar8",
    label: "Standard",
    layout: "standard",
    tags: ["navbar", "nav", "standard", "links", "cta", "button", "logo"],
    default: true,
  },
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar1",
    label: "Logo + Auth",
    layout: "standard",
    tags: ["navbar", "nav", "auth", "login", "signup", "logo"],
  },
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar7",
    label: "Centered",
    layout: "centered",
    tags: ["navbar", "nav", "centered", "center", "compact", "minimal"],
  },
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar9",
    label: "Mega Menu",
    layout: "mega",
    tags: ["navbar", "nav", "mega", "mega-menu", "icons", "large", "dropdown"],
  },
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar10",
    label: "Mega Alt",
    layout: "mega",
    tags: ["navbar", "nav", "mega", "alternate", "dropdown", "extended"],
  },
  {
    blockType: "NavbarBlock",
    role: "navbar",
    variant: "navbar11",
    label: "Floating Dock",
    layout: "floating",
    tags: ["navbar", "nav", "floating", "dock", "fixed", "sticky"],
  },

  // ─── Hero ────────────────────────────────────────────────────────
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero83",
    label: "Dual CTA",
    layout: "centered",
    tags: ["hero", "centered", "dual-cta", "cta", "buttons", "badge", "announcement"],
    default: true,
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero10",
    label: "Badge + Logos",
    layout: "centered",
    tags: ["hero", "centered", "badge", "logos", "trusted", "social-proof"],
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero11",
    label: "Image + Border",
    layout: "centered",
    tags: ["hero", "centered", "image", "border", "screenshot", "product"],
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero18",
    label: "Centered Grid",
    layout: "centered",
    tags: ["hero", "centered", "grid", "image-grid", "gallery", "screenshots"],
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero111",
    label: "Email Capture",
    layout: "centered",
    tags: ["hero", "centered", "email", "email-capture", "form", "waitlist", "signup", "newsletter"],
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero112",
    label: "Split",
    layout: "split",
    tags: ["hero", "split", "left-right", "two-column", "stats", "metrics"],
  },
  {
    blockType: "HeroBlock",
    role: "hero",
    variant: "hero197",
    label: "Dot Pattern",
    layout: "centered",
    tags: ["hero", "centered", "dot-pattern", "background-pattern", "form", "badge"],
  },

  // ─── Features ────────────────────────────────────────────────────
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature42",
    label: "Values Grid",
    layout: "grid",
    tags: ["features", "grid", "3-col", "values", "cards", "benefits"],
    default: true,
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature1",
    label: "Split Image",
    layout: "split",
    tags: ["features", "split", "image", "left-right", "benefits", "checklist"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature6",
    label: "Checklist",
    layout: "split",
    tags: ["features", "split", "checklist", "checks", "list", "bullets"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature44",
    label: "Integration Cards",
    layout: "grid",
    tags: ["features", "grid", "integrations", "cards", "partners", "apps", "logos"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature62",
    label: "Alternating Rows",
    layout: "alternating",
    tags: ["features", "alternating", "rows", "image", "split", "details"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature70",
    label: "Tabs Carousel",
    layout: "tabs",
    tags: ["features", "tabs", "carousel", "interactive", "tabbed"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature102",
    label: "Steps",
    layout: "numbered",
    tags: ["features", "steps", "numbered", "how-it-works", "process", "onboarding"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature118",
    label: "Bento Grid",
    layout: "bento",
    tags: ["features", "bento", "grid", "masonry", "tiles", "mixed-sizes"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature148",
    label: "Template Grid",
    layout: "grid",
    tags: ["features", "grid", "templates", "cta", "browse", "gallery"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature227",
    label: "Split + Icons",
    layout: "split",
    tags: ["features", "split", "icons", "icon-list", "list"],
  },
  {
    blockType: "FeatureBlock",
    role: "features",
    variant: "feature276",
    label: "Hover Grid",
    layout: "grid",
    tags: ["features", "grid", "hover", "interactive", "icons"],
  },

  // ─── Gallery ─────────────────────────────────────────────────────
  {
    blockType: "GalleryBlock",
    role: "gallery",
    variant: "gallery4",
    label: "Carousel",
    layout: "carousel",
    tags: ["gallery", "carousel", "arrows", "slides", "case-studies"],
    default: true,
  },
  {
    blockType: "GalleryBlock",
    role: "gallery",
    variant: "gallery6",
    label: "Card Grid",
    layout: "grid",
    tags: ["gallery", "grid", "cards", "cta", "portfolio", "projects"],
  },
  {
    blockType: "GalleryBlock",
    role: "gallery",
    variant: "gallery7",
    label: "Masonry Tabs",
    layout: "masonry",
    tags: ["gallery", "masonry", "tabs", "filter", "images"],
  },
  {
    blockType: "GalleryBlock",
    role: "gallery",
    variant: "gallery9",
    label: "Full Carousel",
    layout: "carousel",
    tags: ["gallery", "carousel", "full-width", "dots", "fullscreen"],
  },
  {
    blockType: "GalleryBlock",
    role: "gallery",
    variant: "gallery25",
    label: "Masonry Grid",
    layout: "masonry",
    tags: ["gallery", "masonry", "multi-column", "images", "photos"],
  },

  // ─── Logos ───────────────────────────────────────────────────────
  {
    blockType: "LogosBlock",
    role: "logos",
    variant: "logos3",
    label: "Heading + Grid",
    layout: "grid",
    tags: ["logos", "trusted", "social-proof", "heading", "companies", "brands"],
    default: true,
  },
  {
    blockType: "LogosBlock",
    role: "logos",
    variant: "logos1",
    label: "Simple Grid",
    layout: "grid",
    tags: ["logos", "grid", "simple", "companies", "brands", "clients"],
  },
  {
    blockType: "LogosBlock",
    role: "logos",
    variant: "logos7",
    label: "Scrolling Marquee",
    layout: "marquee",
    tags: ["logos", "marquee", "scroll", "scrolling", "animated", "infinite"],
  },

  // ─── Pricing ─────────────────────────────────────────────────────
  {
    blockType: "PricingBlock",
    role: "pricing",
    variant: "pricing4",
    label: "Cards",
    layout: "cards",
    tags: ["pricing", "cards", "side-by-side", "toggle", "plans", "tiers"],
    default: true,
  },
  {
    blockType: "PricingBlock",
    role: "pricing",
    variant: "pricing16",
    label: "Tabs",
    layout: "tabs",
    tags: ["pricing", "tabs", "tab-style", "3-col", "columns", "plans"],
  },
  {
    blockType: "PricingBlock",
    role: "pricing",
    variant: "pricing34",
    label: "Toggle",
    layout: "toggle",
    tags: ["pricing", "toggle", "badge", "features", "comparison"],
  },

  // ─── Testimonials ────────────────────────────────────────────────
  {
    blockType: "TestimonialBlock",
    role: "testimonials",
    variant: "testimonial1",
    label: "Cards Grid",
    layout: "grid",
    tags: ["testimonials", "quotes", "reviews", "cards", "grid", "avatars", "customer"],
    default: true,
  },
  {
    blockType: "TestimonialBlock",
    role: "testimonials",
    variant: "testimonial4",
    label: "Large Quote",
    layout: "single",
    tags: ["testimonials", "quote", "large", "single", "image", "featured"],
  },
  {
    blockType: "TestimonialBlock",
    role: "testimonials",
    variant: "testimonial7",
    label: "Dual Carousel",
    layout: "carousel",
    tags: ["testimonials", "carousel", "dual", "scrolling", "animated", "auto-scroll"],
  },

  // ─── Footer ──────────────────────────────────────────────────────
  {
    blockType: "FooterBlock",
    role: "footer",
    variant: "footer2",
    label: "Multi-column",
    layout: "multi-column",
    tags: ["footer", "multi-column", "links", "logo", "bar", "legal", "columns"],
    default: true,
  },
  {
    blockType: "FooterBlock",
    role: "footer",
    variant: "footer3",
    label: "Social + Links",
    layout: "simple",
    tags: ["footer", "social", "links", "icons", "simple", "minimal"],
  },
  {
    blockType: "FooterBlock",
    role: "footer",
    variant: "footer5",
    label: "Simple 4-col",
    layout: "multi-column",
    tags: ["footer", "4-col", "simple", "columns", "links"],
  },
  {
    blockType: "FooterBlock",
    role: "footer",
    variant: "footer50",
    label: "CTA + Nav",
    layout: "cta",
    tags: ["footer", "cta", "banner", "nav", "social", "legal", "call-to-action"],
  },
];

/** Quick lookup: default variant for each role */
export const defaultVariants: Record<SectionRole, ManifestEntry> = Object.fromEntries(
  (["navbar", "hero", "features", "gallery", "logos", "pricing", "testimonials", "footer"] as SectionRole[]).map(
    (role) => [
      role,
      componentManifest.find((e) => e.role === role && e.default) ??
        componentManifest.find((e) => e.role === role)!,
    ]
  )
) as Record<SectionRole, ManifestEntry>;

/** All entries for a given role */
export function entriesForRole(role: SectionRole): ManifestEntry[] {
  return componentManifest.filter((e) => e.role === role);
}
