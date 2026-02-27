import type { Spec } from "@json-render/core";

// ─── Navbar variants ──────────────────────────────────────────────

export const navbarVariants: { label: string; spec: Spec }[] = [
  {
    label: "Standard",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: {
            variant: "navbar8",
            logoText: "Acme Inc",
            links: [
              { label: "Products", url: "#" },
              { label: "Solutions", url: "#" },
              { label: "Pricing", url: "#" },
              { label: "Company", url: "#" },
            ],
            ctaLabel: "Get Started",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Logo + Auth",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: { variant: "navbar1" },
          children: [],
        },
      },
    },
  },
  {
    label: "Centered",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: { variant: "navbar7" },
          children: [],
        },
      },
    },
  },
  {
    label: "Mega Menu",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: { variant: "navbar9" },
          children: [],
        },
      },
    },
  },
  {
    label: "Mega Alt",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: { variant: "navbar10" },
          children: [],
        },
      },
    },
  },
  {
    label: "Floating Dock",
    spec: {
      root: "navbar",
      elements: {
        navbar: {
          type: "NavbarBlock",
          props: { variant: "navbar11" },
          children: [],
        },
      },
    },
  },
];

// ─── Hero variants ────────────────────────────────────────────────

export const heroVariants: { label: string; spec: Spec }[] = [
  {
    label: "Badge + Logos",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: { variant: "hero10" },
          children: [],
        },
      },
    },
  },
  {
    label: "Image + Border",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: { variant: "hero11" },
          children: [],
        },
      },
    },
  },
  {
    label: "Centered Grid",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: {
            variant: "hero18",
            title: "Build beautiful products, faster than ever",
            description:
              "The modern platform for building and deploying web applications. Ship with confidence using our integrated tools and workflows.",
            primaryCta: "Start Free Trial",
            secondaryCta: "Book a Demo",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Dual CTA",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: { variant: "hero83" },
          children: [],
        },
      },
    },
  },
  {
    label: "Email Capture",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: {
            variant: "hero111",
            title: "Streamline your workflow with intelligent automation",
            description:
              "Simplify complex tasks and empower your team with our solution. Easily manage projects, track progress, and more.",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Split",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: { variant: "hero112" },
          children: [],
        },
      },
    },
  },
  {
    label: "Dot Pattern",
    spec: {
      root: "hero",
      elements: {
        hero: {
          type: "HeroBlock",
          props: { variant: "hero197" },
          children: [],
        },
      },
    },
  },
];

// ─── Features variants ───────────────────────────────────────────

export const featuresVariants: { label: string; spec: Spec }[] = [
  {
    label: "Split Image",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: {
            variant: "feature1",
            title: "Blocks built with Shadcn & Tailwind",
            description:
              "Hundreds of finely crafted components built with React, Tailwind and Shadcn UI.",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Checklist",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature6" },
          children: [],
        },
      },
    },
  },
  {
    label: "Values Grid",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature42" },
          children: [],
        },
      },
    },
  },
  {
    label: "Integration Cards",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature44" },
          children: [],
        },
      },
    },
  },
  {
    label: "Alternating Rows",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature62" },
          children: [],
        },
      },
    },
  },
  {
    label: "Tabs Carousel",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature70" },
          children: [],
        },
      },
    },
  },
  {
    label: "Steps",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: {
            variant: "feature102",
            title: "How It Works",
            description:
              "Get started in three simple steps. Our streamlined process makes onboarding effortless.",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Bento Grid",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: {
            variant: "feature118",
            title: "Key Features That Save You Time",
            description:
              "Explore tools specifically built to enhance your workflow and boost efficiency.",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Template Grid",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature148" },
          children: [],
        },
      },
    },
  },
  {
    label: "Split + Icons",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature227" },
          children: [],
        },
      },
    },
  },
  {
    label: "Hover Grid",
    spec: {
      root: "features",
      elements: {
        features: {
          type: "FeatureBlock",
          props: { variant: "feature276" },
          children: [],
        },
      },
    },
  },
];

// ─── Gallery variants ────────────────────────────────────────────

export const galleryVariants: { label: string; spec: Spec }[] = [
  {
    label: "Carousel",
    spec: {
      root: "gallery",
      elements: {
        gallery: {
          type: "GalleryBlock",
          props: { variant: "gallery4", title: "Case Studies" },
          children: [],
        },
      },
    },
  },
  {
    label: "Card Grid",
    spec: {
      root: "gallery",
      elements: {
        gallery: {
          type: "GalleryBlock",
          props: { variant: "gallery6", title: "Gallery" },
          children: [],
        },
      },
    },
  },
  {
    label: "Masonry Tabs",
    spec: {
      root: "gallery",
      elements: {
        gallery: {
          type: "GalleryBlock",
          props: { variant: "gallery7" },
          children: [],
        },
      },
    },
  },
  {
    label: "Full Carousel",
    spec: {
      root: "gallery",
      elements: {
        gallery: {
          type: "GalleryBlock",
          props: { variant: "gallery9" },
          children: [],
        },
      },
    },
  },
  {
    label: "Masonry Grid",
    spec: {
      root: "gallery",
      elements: {
        gallery: {
          type: "GalleryBlock",
          props: { variant: "gallery25" },
          children: [],
        },
      },
    },
  },
];

// ─── Logos variants ──────────────────────────────────────────────

export const logosVariants: { label: string; spec: Spec }[] = [
  {
    label: "Simple Grid",
    spec: {
      root: "logos",
      elements: {
        logos: {
          type: "LogosBlock",
          props: { variant: "logos1" },
          children: [],
        },
      },
    },
  },
  {
    label: "Heading + Grid",
    spec: {
      root: "logos",
      elements: {
        logos: {
          type: "LogosBlock",
          props: { variant: "logos3", heading: "Trusted by these companies" },
          children: [],
        },
      },
    },
  },
  {
    label: "Scrolling Marquee",
    spec: {
      root: "logos",
      elements: {
        logos: {
          type: "LogosBlock",
          props: { variant: "logos7" },
          children: [],
        },
      },
    },
  },
];

// ─── Pricing variants ─────────────────────────────────────────────

export const pricingVariants: { label: string; spec: Spec }[] = [
  {
    label: "Cards",
    spec: {
      root: "pricing",
      elements: {
        pricing: {
          type: "PricingBlock",
          props: {
            variant: "pricing4",
            title: "Pricing",
            description: "Simple, transparent pricing that grows with you.",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Tabs",
    spec: {
      root: "pricing",
      elements: {
        pricing: {
          type: "PricingBlock",
          props: {
            variant: "pricing16",
            title: "Plans that scale with your business",
          },
          children: [],
        },
      },
    },
  },
  {
    label: "Toggle",
    spec: {
      root: "pricing",
      elements: {
        pricing: {
          type: "PricingBlock",
          props: { variant: "pricing34" },
          children: [],
        },
      },
    },
  },
];

// ─── Testimonial variants ─────────────────────────────────────────

export const testimonialVariants: { label: string; spec: Spec }[] = [
  {
    label: "Cards Grid",
    spec: {
      root: "testimonials",
      elements: {
        testimonials: {
          type: "TestimonialBlock",
          props: { variant: "testimonial1" },
          children: [],
        },
      },
    },
  },
  {
    label: "Large Quote",
    spec: {
      root: "testimonials",
      elements: {
        testimonials: {
          type: "TestimonialBlock",
          props: { variant: "testimonial4" },
          children: [],
        },
      },
    },
  },
  {
    label: "Dual Carousel",
    spec: {
      root: "testimonials",
      elements: {
        testimonials: {
          type: "TestimonialBlock",
          props: { variant: "testimonial7" },
          children: [],
        },
      },
    },
  },
];

// ─── Footer variants ──────────────────────────────────────────────

export const footerVariants: { label: string; spec: Spec }[] = [
  {
    label: "Multi-column",
    spec: {
      root: "footer",
      elements: {
        footer: {
          type: "FooterBlock",
          props: { variant: "footer2" },
          children: [],
        },
      },
    },
  },
  {
    label: "Social + Links",
    spec: {
      root: "footer",
      elements: {
        footer: {
          type: "FooterBlock",
          props: { variant: "footer3" },
          children: [],
        },
      },
    },
  },
  {
    label: "Simple 4-col",
    spec: {
      root: "footer",
      elements: {
        footer: {
          type: "FooterBlock",
          props: { variant: "footer5" },
          children: [],
        },
      },
    },
  },
  {
    label: "CTA + Nav",
    spec: {
      root: "footer",
      elements: {
        footer: {
          type: "FooterBlock",
          props: {
            variant: "footer50",
            heading: "Start your free trial today",
            description: "The fit-for-purpose tool for planning and building modern software products.",
          },
          children: [],
        },
      },
    },
  },
];

// ─── Slot system ──────────────────────────────────────────────────

export type SlotId = "navbar" | "hero" | "features" | "gallery" | "logos" | "pricing" | "testimonials" | "footer";

export const slotVariants: Record<SlotId, { label: string; spec: Spec }[]> = {
  navbar: navbarVariants,
  hero: heroVariants,
  features: featuresVariants,
  gallery: galleryVariants,
  logos: logosVariants,
  pricing: pricingVariants,
  testimonials: testimonialVariants,
  footer: footerVariants,
};

export const SLOT_LABELS: Record<SlotId, string> = {
  navbar: "Navbar",
  hero: "Hero",
  features: "Features",
  gallery: "Gallery",
  logos: "Logos",
  pricing: "Pricing",
  testimonials: "Testimonials",
  footer: "Footer",
};

export const SLOT_ORDER: SlotId[] = [
  "navbar",
  "hero",
  "logos",
  "features",
  "gallery",
  "pricing",
  "testimonials",
  "footer",
];
