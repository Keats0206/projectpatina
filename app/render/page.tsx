"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionProvider,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import type { Spec } from "@json-render/core";
import { webRegistry } from "@/lib/webRegistry";
import { cn } from "@/lib/utils";
import defaultTheme from "@/lib/defaultTheme.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type Theme = typeof defaultTheme;
type ThemeColors = Theme["colors"];

// ─── Spec normaliser ─────────────────────────────────────────────────────────

type RawElement = Record<string, unknown>;

function normalizeElements(
  elements: Record<string, RawElement>
): Record<string, RawElement> {
  const out: Record<string, RawElement> = {};
  for (const [id, el] of Object.entries(elements)) {
    const norm: RawElement = { ...el };
    if (!norm.props) norm.props = {};
    out[id] = norm;
  }
  return out;
}

function normalizeSpec(raw: Record<string, unknown>): Spec {
  const r = raw as { root?: string; elements?: Record<string, RawElement>; state?: Record<string, unknown> };
  return {
    root: typeof r.root === "string" ? r.root : "",
    elements: normalizeElements(r.elements ?? {}) as unknown as Spec["elements"],
    ...(r.state ? { state: r.state } : {}),
  };
}

// ─── Theme → CSS variables ──────────────────────────────────────────────────

function themeToCssVars(theme: Theme, isDark?: boolean): Record<string, string> {
  const vars: Record<string, string> = {};

  // Pick the active color palette based on mode
  const activeColors: Record<string, string> = isDark && theme.colorsDark
    ? (theme.colorsDark as Record<string, string>)
    : (theme.colors as Record<string, string>);

  // Map theme colors → shadcn CSS variables so components pick them up
  const colorMap: Record<string, string> = {
    background: "--background",
    primary: "--primary",
    primaryForeground: "--primary-foreground",
    secondary: "--secondary",
    secondaryForeground: "--secondary-foreground",
    muted: "--muted",
    mutedForeground: "--muted-foreground",
    border: "--border",
    ring: "--ring",
    destructive: "--destructive",
    card: "--card",
    cardForeground: "--card-foreground",
    accent: "--accent",
    surface: "--popover",
    inputBackground: "--input",
  };

  for (const [key, cssVar] of Object.entries(colorMap)) {
    const val = activeColors[key];
    if (val) vars[cssVar] = val;
  }

  // Expose all active colors as --theme-* for direct use in components
  for (const [key, val] of Object.entries(activeColors)) {
    vars[`--theme-${camelToKebab(key)}`] = val;
  }

  vars["--radius"] = theme.radii.base;
  vars["--container-max"] = theme.spacing.containerMax;
  vars["color"] = activeColors.textPrimary ?? activeColors.foreground ?? "";
  vars["fontFamily"] = theme.fonts.body;

  // Heading font
  vars["--theme-font-heading"] = theme.fonts.heading;
  vars["--theme-font-heading-weight"] = String(theme.fontWeights.heading);
  vars["--theme-font-body-weight"] = String(theme.fontWeights.body);

  // Button-specific vars
  vars["--btn-radius"] = theme.button.radius;
  vars["--btn-shadow"] = theme.button.shadow;
  vars["--btn-hover-shadow"] = theme.button.hoverShadow;
  vars["--btn-transition"] = theme.button.transition;

  // Focus ring
  vars["--theme-focus-ring-offset"] = theme.focusRing.offset;
  vars["--theme-focus-ring-width"] = theme.focusRing.width;
  vars["--theme-focus-ring-color"] = theme.focusRing.color;

  // Typography scale
  for (const [key, val] of Object.entries(theme.typography.fontSize)) {
    vars[`--theme-font-size-${key}`] = val;
  }
  for (const [key, val] of Object.entries(theme.typography.lineHeight)) {
    vars[`--theme-line-height-${key}`] = val;
  }
  for (const [key, val] of Object.entries(theme.typography.letterSpacing)) {
    vars[`--theme-letter-spacing-${key}`] = val;
  }

  // Spacing scale (excludes sectionY and containerMax which are handled separately)
  const spacingScale = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
  for (const key of spacingScale) {
    const val = (theme.spacing as Record<string, string>)[key];
    if (val) vars[`--theme-spacing-${key}`] = val;
  }

  return vars;
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

// ─── Sample specs ────────────────────────────────────────────────────────────

const PRICING_SPEC_OBJ = {
  "root": "main",
  "elements": {
    "main": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["navbar", "navbar-divider", "header", "pricing-section", "pricing-divider", "faq-section", "faq-divider", "cta-footer", "footer-divider-top", "footer"] },
    "navbar": { "type": "Stack", "props": { "direction": "row", "gap": "lg", "align": "center", "justify": "between" }, "children": ["nav-logo", "nav-links"] },
    "nav-logo": { "type": "Text", "props": { "text": "PricingHub", "size": "lg" } },
    "nav-links": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center" }, "children": ["nav-link-home", "nav-link-pricing", "nav-link-about", "nav-link-contact"] },
    "nav-link-home": { "type": "Link", "props": { "label": "Home", "href": "#home" } },
    "nav-link-pricing": { "type": "Link", "props": { "label": "Pricing", "href": "#pricing" } },
    "nav-link-about": { "type": "Link", "props": { "label": "About", "href": "#about" } },
    "nav-link-contact": { "type": "Link", "props": { "label": "Contact", "href": "#contact" } },
    "navbar-divider": { "type": "Separator", "props": { "orientation": "horizontal" } },
    "header": { "type": "Stack", "props": { "direction": "column", "gap": "md", "align": "center" }, "children": ["title", "subtitle"] },
    "title": { "type": "Heading", "props": { "text": "Simple, Transparent Pricing", "level": "1", "align": "center" } },
    "subtitle": { "type": "Text", "props": { "text": "Choose the perfect plan for your needs. Always flexible to scale.", "size": "lg", "tone": "muted", "align": "center" } },
    "pricing-section": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["billing-toggle", "plans-grid"] },
    "billing-toggle": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center", "justify": "center" }, "children": ["toggle-label", "billing-switch", "save-badge"] },
    "toggle-label": { "type": "Text", "props": { "text": "Bill Monthly" } },
    "billing-switch": { "type": "Switch", "props": { "label": "", "name": "billing" } },
    "save-badge": { "type": "Badge", "props": { "text": "Save 20% with annual billing", "variant": "secondary" } },
    "plans-grid": { "type": "Grid", "props": { "cols": "3", "gap": "lg" }, "children": ["plan-starter", "plan-professional", "plan-enterprise"] },
    "plan-starter": { "type": "Card", "props": { "title": "Starter", "description": "Perfect for individuals and small projects" }, "children": ["starter-price", "starter-features", "starter-button"] },
    "starter-price": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["starter-amount", "starter-billing"] },
    "starter-amount": { "type": "Heading", "props": { "text": "$9", "level": "2" } },
    "starter-billing": { "type": "Text", "props": { "text": "per month", "tone": "muted", "size": "sm" } },
    "starter-features": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["sf1", "sf2", "sf3", "sf4"] },
    "sf1": { "type": "Text", "props": { "text": "✓ Up to 10 projects" } },
    "sf2": { "type": "Text", "props": { "text": "✓ 5 GB storage" } },
    "sf3": { "type": "Text", "props": { "text": "✓ Basic analytics" } },
    "sf4": { "type": "Text", "props": { "text": "✓ Email support" } },
    "starter-button": { "type": "Button", "props": { "label": "Get Started", "variant": "secondary" } },
    "plan-professional": { "type": "Card", "props": { "title": "Professional", "description": "For growing teams and businesses" }, "children": ["pro-badge", "pro-price", "pro-features", "pro-button"] },
    "pro-badge": { "type": "Badge", "props": { "text": "Most Popular", "variant": "default" } },
    "pro-price": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["pro-amount", "pro-billing"] },
    "pro-amount": { "type": "Heading", "props": { "text": "$29", "level": "2" } },
    "pro-billing": { "type": "Text", "props": { "text": "per month", "tone": "muted", "size": "sm" } },
    "pro-features": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["pf1", "pf2", "pf3", "pf4", "pf5", "pf6"] },
    "pf1": { "type": "Text", "props": { "text": "✓ Unlimited projects" } },
    "pf2": { "type": "Text", "props": { "text": "✓ 500 GB storage" } },
    "pf3": { "type": "Text", "props": { "text": "✓ Advanced analytics" } },
    "pf4": { "type": "Text", "props": { "text": "✓ Priority support" } },
    "pf5": { "type": "Text", "props": { "text": "✓ Team collaboration" } },
    "pf6": { "type": "Text", "props": { "text": "✓ API access" } },
    "pro-button": { "type": "Button", "props": { "label": "Start Free Trial", "variant": "default" } },
    "plan-enterprise": { "type": "Card", "props": { "title": "Enterprise", "description": "For large-scale operations" }, "children": ["enterprise-price", "enterprise-features", "enterprise-button"] },
    "enterprise-price": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["enterprise-amount", "enterprise-billing"] },
    "enterprise-amount": { "type": "Heading", "props": { "text": "Custom", "level": "2" } },
    "enterprise-billing": { "type": "Text", "props": { "text": "Contact for pricing", "tone": "muted", "size": "sm" } },
    "enterprise-features": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["ef1", "ef2", "ef3", "ef4", "ef5", "ef6"] },
    "ef1": { "type": "Text", "props": { "text": "✓ Everything in Professional" } },
    "ef2": { "type": "Text", "props": { "text": "✓ Unlimited storage" } },
    "ef3": { "type": "Text", "props": { "text": "✓ Custom integrations" } },
    "ef4": { "type": "Text", "props": { "text": "✓ Dedicated support" } },
    "ef5": { "type": "Text", "props": { "text": "✓ SLA guarantee" } },
    "ef6": { "type": "Text", "props": { "text": "✓ On-premise option" } },
    "enterprise-button": { "type": "Button", "props": { "label": "Contact Sales", "variant": "secondary" } },
    "pricing-divider": { "type": "Separator", "props": { "orientation": "horizontal" } },
    "faq-section": { "type": "Stack", "props": { "direction": "column", "gap": "md" }, "children": ["faq-title", "faq-accordion"] },
    "faq-title": { "type": "Heading", "props": { "text": "Frequently Asked Questions", "level": "2", "align": "center" } },
    "faq-accordion": { "type": "Accordion", "props": { "items": [
      { "title": "Can I change my plan later?", "content": "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing accordingly." },
      { "title": "What payment methods do you accept?", "content": "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans." },
      { "title": "Is there a free trial?", "content": "Yes, all plans come with a 14-day free trial. No credit card required to get started." },
      { "title": "What happens if I exceed my storage limit?", "content": "We'll notify you when you're approaching your limit. You can upgrade anytime to get more storage." },
      { "title": "Do you offer discounts for annual billing?", "content": "Yes! Save 20% when you choose annual billing instead of monthly. That's like getting 2.4 months free!" },
      { "title": "Can I cancel anytime?", "content": "Absolutely. You can cancel your subscription anytime. If you're on an annual plan, we'll refund the unused portion." }
    ] } },
    "faq-divider": { "type": "Separator", "props": { "orientation": "horizontal" } },
    "cta-footer": { "type": "Card", "props": { "title": "Ready to get started?", "description": "Join thousands of satisfied customers. Start your free trial today." }, "children": ["footer-button"] },
    "footer-button": { "type": "Button", "props": { "label": "Start Your Free Trial", "variant": "default" } },
    "footer-divider-top": { "type": "Separator", "props": { "orientation": "horizontal" } },
    "footer": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["footer-content", "footer-sep", "footer-bottom"] },
    "footer-content": { "type": "Grid", "props": { "cols": "3", "gap": "lg" }, "children": ["footer-company", "footer-product", "footer-legal"] },
    "footer-company": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["footer-company-title", "footer-company-text", "fc-twitter", "fc-linkedin", "fc-github"] },
    "footer-company-title": { "type": "Heading", "props": { "text": "PricingHub", "level": "4" } },
    "footer-company-text": { "type": "Text", "props": { "text": "Simple, transparent pricing for modern businesses.", "tone": "muted", "size": "sm" } },
    "fc-twitter": { "type": "Link", "props": { "label": "Twitter", "href": "#" } },
    "fc-linkedin": { "type": "Link", "props": { "label": "LinkedIn", "href": "#" } },
    "fc-github": { "type": "Link", "props": { "label": "GitHub", "href": "#" } },
    "footer-product": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["footer-product-title", "fp-features", "fp-pricing", "fp-security", "fp-status"] },
    "footer-product-title": { "type": "Heading", "props": { "text": "Product", "level": "4" } },
    "fp-features": { "type": "Link", "props": { "label": "Features", "href": "#" } },
    "fp-pricing": { "type": "Link", "props": { "label": "Pricing", "href": "#" } },
    "fp-security": { "type": "Link", "props": { "label": "Security", "href": "#" } },
    "fp-status": { "type": "Link", "props": { "label": "Status", "href": "#" } },
    "footer-legal": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["footer-legal-title", "fl-privacy", "fl-terms", "fl-cookies", "fl-contact"] },
    "footer-legal-title": { "type": "Heading", "props": { "text": "Legal", "level": "4" } },
    "fl-privacy": { "type": "Link", "props": { "label": "Privacy Policy", "href": "#" } },
    "fl-terms": { "type": "Link", "props": { "label": "Terms of Service", "href": "#" } },
    "fl-cookies": { "type": "Link", "props": { "label": "Cookie Settings", "href": "#" } },
    "fl-contact": { "type": "Link", "props": { "label": "Contact", "href": "#" } },
    "footer-sep": { "type": "Separator", "props": { "orientation": "horizontal" } },
    "footer-bottom": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center", "justify": "between" }, "children": ["footer-copyright", "footer-badges"] },
    "footer-copyright": { "type": "Text", "props": { "text": "© 2024 PricingHub. All rights reserved.", "tone": "muted", "size": "sm" } },
    "footer-badges": { "type": "Stack", "props": { "direction": "row", "gap": "sm", "align": "center" }, "children": ["badge-secure", "badge-trusted"] },
    "badge-secure": { "type": "Badge", "props": { "text": "🔒 Secure", "variant": "secondary" } },
    "badge-trusted": { "type": "Badge", "props": { "text": "⭐ Trusted by 10K+", "variant": "default" } }
  },
  "state": {
    "billingAnnual": false,
    "faqItems": [
      { "title": "Can I change my plan later?", "content": "Yes! You can upgrade or downgrade at any time." },
      { "title": "Is there a free trial?", "content": "Yes, all plans come with a 14-day free trial." },
      { "title": "Can I cancel anytime?", "content": "Absolutely. Cancel your subscription anytime." }
    ]
  }
};

const FEEDBACK_SPEC_OBJ = {
  "root": "root",
  "elements": {
    "root": { "type": "Card", "props": { "title": "Share Your Feedback", "description": "We'd love to hear from you. Please rate your experience and leave any comments." }, "children": ["form-stack"] },
    "form-stack": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["rating-stack", "input-name", "input-email", "select-category", "textarea-comments", "btn-submit"] },
    "rating-stack": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["rating-label", "rating-input"] },
    "rating-label": { "type": "Text", "props": { "text": "How would you rate your experience?", "size": "lg" } },
    "rating-input": { "type": "Rating", "props": { "max": 5, "label": "Rating" } },
    "input-name": { "type": "Input", "props": { "label": "Full Name", "name": "name", "placeholder": "John Doe" } },
    "input-email": { "type": "Input", "props": { "label": "Email Address", "name": "email", "type": "email", "placeholder": "john@example.com" } },
    "select-category": { "type": "SelectField", "props": { "label": "Feedback Category", "placeholder": "Select a category", "options": ["Product Quality", "Customer Service", "Shipping & Delivery", "Website Experience", "Other"] } },
    "textarea-comments": { "type": "Textarea", "props": { "label": "Your Comments", "name": "comments", "placeholder": "Tell us more about your experience...", "rows": 5 } },
    "btn-submit": { "type": "Button", "props": { "label": "Submit Feedback", "variant": "default" } }
  },
  "state": { "feedback": { "rating": 0, "name": "", "email": "", "category": "", "comments": "" } }
};

const LANDING_SPEC_OBJ = {
  "root": "page",
  "elements": {
    "page": { "type": "Stack", "props": { "direction": "column", "gap": "none" }, "children": ["nav", "hero", "logos", "features", "pricing", "testimonials", "footer"] },
    "nav": { "type": "Stack", "props": { "direction": "row", "gap": "lg", "align": "center", "justify": "between" }, "children": ["nav-logo", "nav-links", "nav-cta"] },
    "nav-logo": { "type": "Text", "props": { "text": "Acme", "size": "lg" } },
    "nav-links": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center" }, "children": ["link-home", "link-pricing", "link-about", "link-contact"] },
    "link-home": { "type": "Link", "props": { "label": "Home", "href": "#home" } },
    "link-pricing": { "type": "Link", "props": { "label": "Pricing", "href": "#pricing" } },
    "link-about": { "type": "Link", "props": { "label": "About", "href": "#about" } },
    "link-contact": { "type": "Link", "props": { "label": "Contact", "href": "#contact" } },
    "nav-cta": { "type": "Button", "props": { "label": "Get started", "variant": "default" } },
    "hero": { "type": "Stack", "props": { "direction": "column", "gap": "lg", "align": "center" }, "children": ["hero-title", "hero-desc", "hero-ctas"] },
    "hero-title": { "type": "Heading", "props": { "text": "Ship products your users love", "level": "1", "align": "center" } },
    "hero-desc": { "type": "Text", "props": { "text": "The all-in-one platform for product teams. Design, build, and ship faster than ever before.", "size": "lg", "tone": "muted", "align": "center" } },
    "hero-ctas": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center" }, "children": ["btn-start", "btn-demo"] },
    "btn-start": { "type": "Button", "props": { "label": "Start for free", "variant": "default" } },
    "btn-demo": { "type": "Button", "props": { "label": "See demo", "variant": "secondary" } },
    "logos": { "type": "Stack", "props": { "direction": "column", "gap": "md", "align": "center" }, "children": ["logos-heading", "logos-row"] },
    "logos-heading": { "type": "Text", "props": { "text": "Trusted by teams at", "tone": "muted", "size": "sm", "align": "center" } },
    "logos-row": { "type": "Stack", "props": { "direction": "row", "gap": "lg", "align": "center" }, "children": ["logo1", "logo2", "logo3"] },
    "logo1": { "type": "Text", "props": { "text": "Company A", "tone": "muted", "size": "sm" } },
    "logo2": { "type": "Text", "props": { "text": "Company B", "tone": "muted", "size": "sm" } },
    "logo3": { "type": "Text", "props": { "text": "Company C", "tone": "muted", "size": "sm" } },
    "features": { "type": "Stack", "props": { "direction": "column", "gap": "lg", "align": "center" }, "children": ["features-title", "features-desc", "features-grid"] },
    "features-title": { "type": "Heading", "props": { "text": "Everything you need to build great products", "level": "2", "align": "center" } },
    "features-desc": { "type": "Text", "props": { "text": "Powerful tools and integrations to streamline your workflow from day one.", "tone": "muted", "align": "center" } },
    "features-grid": { "type": "Grid", "props": { "cols": "3", "gap": "lg" }, "children": ["feat1", "feat2", "feat3"] },
    "feat1": { "type": "Card", "props": { "title": "Fast", "description": "Ship in minutes, not days." }, "children": [] },
    "feat2": { "type": "Card", "props": { "title": "Flexible", "description": "Compose with primitives." }, "children": [] },
    "feat3": { "type": "Card", "props": { "title": "Themed", "description": "Full design token support." }, "children": [] },
    "pricing": { "type": "Stack", "props": { "direction": "column", "gap": "lg", "align": "center" }, "children": ["pricing-title", "pricing-desc", "pricing-grid"] },
    "pricing-title": { "type": "Heading", "props": { "text": "Simple, transparent pricing", "level": "2", "align": "center" } },
    "pricing-desc": { "type": "Text", "props": { "text": "No hidden fees. Cancel anytime.", "tone": "muted", "align": "center" } },
    "pricing-grid": { "type": "Grid", "props": { "cols": "3", "gap": "lg" }, "children": ["plan-starter", "plan-pro", "plan-enterprise"] },
    "plan-starter": { "type": "Card", "props": { "title": "Starter", "description": "For individuals" }, "children": ["price-starter", "btn-starter"] },
    "price-starter": { "type": "Heading", "props": { "text": "$9/mo", "level": "3" } },
    "btn-starter": { "type": "Button", "props": { "label": "Get started", "variant": "secondary" } },
    "plan-pro": { "type": "Card", "props": { "title": "Pro", "description": "For teams" }, "children": ["price-pro", "btn-pro"] },
    "price-pro": { "type": "Heading", "props": { "text": "$29/mo", "level": "3" } },
    "btn-pro": { "type": "Button", "props": { "label": "Start trial", "variant": "default" } },
    "plan-enterprise": { "type": "Card", "props": { "title": "Enterprise", "description": "Custom" }, "children": ["price-enterprise", "btn-enterprise"] },
    "price-enterprise": { "type": "Heading", "props": { "text": "Contact us", "level": "3" } },
    "btn-enterprise": { "type": "Button", "props": { "label": "Contact sales", "variant": "secondary" } },
    "testimonials": { "type": "Stack", "props": { "direction": "column", "gap": "md", "align": "center" }, "children": ["test-title", "test-grid"] },
    "test-title": { "type": "Heading", "props": { "text": "What customers say", "level": "2", "align": "center" } },
    "test-grid": { "type": "Grid", "props": { "cols": "2", "gap": "md" }, "children": ["test1", "test2"] },
    "test1": { "type": "Card", "props": { "description": "\"This product changed how we work.\"" }, "children": ["test1-attr"] },
    "test1-attr": { "type": "Text", "props": { "text": "— Jane, Acme", "tone": "muted", "size": "sm" } },
    "test2": { "type": "Card", "props": { "description": "\"Simple and powerful.\"" }, "children": ["test2-attr"] },
    "test2-attr": { "type": "Text", "props": { "text": "— John, Startup", "tone": "muted", "size": "sm" } },
    "footer": { "type": "Stack", "props": { "direction": "column", "gap": "lg", "align": "center" }, "children": ["footer-heading", "footer-desc", "footer-links", "footer-copy"] },
    "footer-heading": { "type": "Heading", "props": { "text": "Ready to build something great?", "level": "4", "align": "center" } },
    "footer-desc": { "type": "Text", "props": { "text": "Join thousands of teams already using Acme.", "tone": "muted", "align": "center" } },
    "footer-links": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center" }, "children": ["fl-privacy", "fl-terms", "fl-contact"] },
    "fl-privacy": { "type": "Link", "props": { "label": "Privacy", "href": "#" } },
    "fl-terms": { "type": "Link", "props": { "label": "Terms", "href": "#" } },
    "fl-contact": { "type": "Link", "props": { "label": "Contact", "href": "#" } },
    "footer-copy": { "type": "Text", "props": { "text": "© Acme. All rights reserved.", "tone": "muted", "size": "sm" } }
  }
};

const DASHBOARD_SPEC_OBJ = {
  "root": "page",
  "elements": {
    "page": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["header", "metrics-row", "divider1", "content-grid"] },
    "header": { "type": "Stack", "props": { "direction": "row", "align": "center", "justify": "between", "gap": "md" }, "children": ["header-left", "header-actions"] },
    "header-left": { "type": "Stack", "props": { "direction": "column", "gap": "xs" }, "children": ["page-title", "page-subtitle"] },
    "page-title":    { "type": "Heading", "props": { "text": "Dashboard",                         "level": "1" } },
    "page-subtitle": { "type": "Text",    "props": { "text": "Welcome back, Sarah. Here's what's happening.", "tone": "muted" } },
    "header-actions": { "type": "Stack", "props": { "direction": "row", "gap": "sm" }, "children": ["btn-export", "btn-new"] },
    "btn-export": { "type": "Button", "props": { "label": "Export",           "variant": "outline" } },
    "btn-new":    { "type": "Button", "props": { "label": "New report",       "variant": "default" } },
    "metrics-row": { "type": "Grid", "props": { "cols": "4", "gap": "md" }, "children": ["metric-revenue", "metric-users", "metric-orders", "metric-churn"] },
    "metric-revenue": { "type": "Card", "props": { "title": "Total Revenue",   "description": "+12.5% from last month" }, "children": ["metric-revenue-val"] },
    "metric-revenue-val": { "type": "Heading", "props": { "text": "$48,295",    "level": "2" } },
    "metric-users":   { "type": "Card", "props": { "title": "Active Users",    "description": "+8.1% from last month" },  "children": ["metric-users-val"] },
    "metric-users-val":   { "type": "Heading", "props": { "text": "12,430",     "level": "2" } },
    "metric-orders":  { "type": "Card", "props": { "title": "Orders",          "description": "+3.2% from last month" },  "children": ["metric-orders-val"] },
    "metric-orders-val":  { "type": "Heading", "props": { "text": "1,893",      "level": "2" } },
    "metric-churn":   { "type": "Card", "props": { "title": "Churn Rate",      "description": "-0.4% from last month" },  "children": ["metric-churn-val"] },
    "metric-churn-val":   { "type": "Heading", "props": { "text": "2.4%",       "level": "2" } },
    "divider1": { "type": "Separator", "props": {} },
    "content-grid": { "type": "Grid", "props": { "cols": "3", "gap": "md" }, "children": ["recent-activity", "top-products", "quick-actions"] },
    "recent-activity": { "type": "Card", "props": { "title": "Recent Activity" }, "children": ["activity-list"] },
    "activity-list": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["act1", "act2", "act3", "act4", "act5"] },
    "act1": { "type": "Text", "props": { "text": "🟢  New user signup — john@acme.com",      "size": "sm" } },
    "act2": { "type": "Text", "props": { "text": "💳  Payment received — $299",              "size": "sm" } },
    "act3": { "type": "Text", "props": { "text": "📦  Order #4821 shipped",                  "size": "sm" } },
    "act4": { "type": "Text", "props": { "text": "⚠️  Refund requested — Order #4799",       "size": "sm", "tone": "muted" } },
    "act5": { "type": "Text", "props": { "text": "🟢  New user signup — lisa@startup.io",    "size": "sm" } },
    "top-products": { "type": "Card", "props": { "title": "Top Products" }, "children": ["products-list"] },
    "products-list": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["prod1", "prod2", "prod3", "prod4"] },
    "prod1": { "type": "Stack", "props": { "direction": "row", "justify": "between", "align": "center", "gap": "sm" }, "children": ["prod1-name", "prod1-rev"] },
    "prod1-name": { "type": "Text", "props": { "text": "Pro Plan",         "size": "sm" } },
    "prod1-rev":  { "type": "Badge", "props": { "text": "$18,400",          "variant": "secondary" } },
    "prod2": { "type": "Stack", "props": { "direction": "row", "justify": "between", "align": "center", "gap": "sm" }, "children": ["prod2-name", "prod2-rev"] },
    "prod2-name": { "type": "Text", "props": { "text": "Enterprise Plan",  "size": "sm" } },
    "prod2-rev":  { "type": "Badge", "props": { "text": "$14,200",          "variant": "secondary" } },
    "prod3": { "type": "Stack", "props": { "direction": "row", "justify": "between", "align": "center", "gap": "sm" }, "children": ["prod3-name", "prod3-rev"] },
    "prod3-name": { "type": "Text", "props": { "text": "Starter Plan",     "size": "sm" } },
    "prod3-rev":  { "type": "Badge", "props": { "text": "$9,800",           "variant": "secondary" } },
    "prod4": { "type": "Stack", "props": { "direction": "row", "justify": "between", "align": "center", "gap": "sm" }, "children": ["prod4-name", "prod4-rev"] },
    "prod4-name": { "type": "Text", "props": { "text": "Add-ons",          "size": "sm" } },
    "prod4-rev":  { "type": "Badge", "props": { "text": "$5,895",           "variant": "secondary" } },
    "quick-actions": { "type": "Card", "props": { "title": "Quick Actions" }, "children": ["actions-list"] },
    "actions-list": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["qa1", "qa2", "qa3", "qa4"] },
    "qa1": { "type": "Button", "props": { "label": "Create Invoice",    "variant": "outline" } },
    "qa2": { "type": "Button", "props": { "label": "Add Team Member",   "variant": "outline" } },
    "qa3": { "type": "Button", "props": { "label": "View All Orders",   "variant": "outline" } },
    "qa4": { "type": "Button", "props": { "label": "Generate Report",   "variant": "secondary" } }
  }
};

const ARTICLE_SPEC_OBJ = {
  "root": "page",
  "elements": {
    "page": { "type": "Stack", "props": { "direction": "column", "gap": "lg" }, "children": ["nav", "article-wrap", "related-section"] },
    "nav": { "type": "Stack", "props": { "direction": "row", "gap": "md", "align": "center", "justify": "center" }, "children": ["nav-link1", "nav-link2", "nav-link3"] },
    "nav-link1": { "type": "Link", "props": { "label": "Home", "href": "#" } },
    "nav-link2": { "type": "Link", "props": { "label": "Articles", "href": "#" } },
    "nav-link3": { "type": "Link", "props": { "label": "About", "href": "#" } },
    "article-wrap": { "type": "Stack", "props": { "direction": "column", "gap": "lg", "align": "center" }, "children": ["article"] },
    "article": { "type": "Stack", "props": { "direction": "column", "gap": "md" }, "children": ["meta", "title", "lead", "divider1", "body1", "body2", "pullquote", "body3", "body4", "tags-row"] },
    "meta": { "type": "Stack", "props": { "direction": "row", "gap": "sm", "align": "center" }, "children": ["cat-badge", "meta-date"] },
    "cat-badge": { "type": "Badge",   "props": { "text": "Design Systems",   "variant": "secondary" } },
    "meta-date":  { "type": "Text",    "props": { "text": "February 26, 2026 · 8 min read", "tone": "muted", "size": "sm" } },
    "title": { "type": "Heading", "props": { "text": "Building Design Systems That Scale", "level": "1" } },
    "lead":  { "type": "Text",    "props": { "text": "A great design system isn't just a component library — it's a shared language between designers and engineers. Here's how to build one that grows with your product.", "size": "lg", "tone": "muted" } },
    "divider1": { "type": "Separator", "props": {} },
    "body1": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["h2-1", "p1", "p2"] },
    "h2-1": { "type": "Heading", "props": { "text": "Start with tokens, not components", "level": "2" } },
    "p1":   { "type": "Text",    "props": { "text": "Design tokens are the smallest unit of a design system. They encode decisions about color, spacing, typography, and elevation in a way that can be consumed by any platform — web, iOS, Android." } },
    "p2":   { "type": "Text",    "props": { "text": "Before you write a single component, define your tokens. They become the foundation that keeps everything in sync as your system evolves." } },
    "body2": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["h2-2", "p3", "p4"] },
    "h2-2": { "type": "Heading", "props": { "text": "Document decisions, not just usage", "level": "2" } },
    "p3":   { "type": "Text",    "props": { "text": "Most design systems document how to use a component. The great ones document why the component exists, what problem it solves, and what tradeoffs were made." } },
    "p4":   { "type": "Text",    "props": { "text": "This institutional knowledge is what separates a living system from a static library. It's what lets new team members contribute confidently from day one." } },
    "pullquote": { "type": "Card", "props": { "description": "\"The best design systems are invisible. Users don't notice them — they just feel right.\"" }, "children": ["pq-attr"] },
    "pq-attr": { "type": "Text", "props": { "text": "— Sarah Chen, Head of Design at Vercel", "tone": "muted", "size": "sm", "align": "right" } },
    "body3": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["h2-3", "p5", "p6"] },
    "h2-3": { "type": "Heading", "props": { "text": "Versioning and governance", "level": "2" } },
    "p5":   { "type": "Text",    "props": { "text": "Your design system is a product. Treat it like one. That means semantic versioning, changelogs, and a clear deprecation policy." } },
    "p6":   { "type": "Text",    "props": { "text": "Establish a small governance team — even two or three people — who are responsible for reviewing proposed changes, maintaining quality standards, and communicating updates." } },
    "body4": { "type": "Stack", "props": { "direction": "column", "gap": "sm" }, "children": ["h2-4", "p7"] },
    "h2-4": { "type": "Heading", "props": { "text": "Conclusion", "level": "2" } },
    "p7":   { "type": "Text",    "props": { "text": "A great design system is never finished — it evolves with your product and your team. Start small, stay consistent, and invest in documentation. The compounding returns are worth it." } },
    "tags-row": { "type": "Stack", "props": { "direction": "row", "gap": "sm", "wrap": true }, "children": ["tag1", "tag2", "tag3", "tag4"] },
    "tag1": { "type": "Badge", "props": { "text": "Design",          "variant": "outline" } },
    "tag2": { "type": "Badge", "props": { "text": "Engineering",     "variant": "outline" } },
    "tag3": { "type": "Badge", "props": { "text": "Best Practices",  "variant": "outline" } },
    "tag4": { "type": "Badge", "props": { "text": "Tokens",          "variant": "outline" } },
    "related-section": { "type": "Stack", "props": { "direction": "column", "gap": "md" }, "children": ["related-title", "related-grid"] },
    "related-title": { "type": "Heading", "props": { "text": "Related Articles", "level": "3" } },
    "related-grid": { "type": "Grid", "props": { "cols": "3", "gap": "md" }, "children": ["rel1", "rel2", "rel3"] },
    "rel1": { "type": "Card", "props": { "title": "Atomic Design in Practice",       "description": "How to structure components so they compose cleanly at every scale." } },
    "rel2": { "type": "Card", "props": { "title": "Dark Mode Without Tears",         "description": "A token-based approach to dark mode that just works." } },
    "rel3": { "type": "Card", "props": { "title": "The Accessible Component Checklist", "description": "Ship accessible UI by default with this checklist." } }
  }
};

type SampleId = "landing" | "pricing" | "dashboard" | "article" | "feedback";

const SAMPLES: Record<SampleId, { label: string; obj: Record<string, unknown> }> = {
  landing:   { label: "Landing",    obj: LANDING_SPEC_OBJ   },
  pricing:   { label: "Pricing",    obj: PRICING_SPEC_OBJ   },
  dashboard: { label: "Dashboard",  obj: DASHBOARD_SPEC_OBJ },
  article:   { label: "Article",    obj: ARTICLE_SPEC_OBJ   },
  feedback:  { label: "Form",       obj: FEEDBACK_SPEC_OBJ  },
};

// ─── Theme presets ────────────────────────────────────────────────────────────

type ThemePresetId = "violet" | "light" | "ocean" | "forest" | "amber" | "pebble";

// Shared structural tokens that don't vary per preset
const SHARED_TYPOGRAPHY: Theme["typography"] = {
  fontSize: { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem" },
  lineHeight: { tight: "1.25", normal: "1.5", relaxed: "1.75" },
  letterSpacing: { tight: "-0.025em", normal: "0em", wide: "0.025em" },
};

const THEME_PRESETS: Record<ThemePresetId, { label: string; swatch: string; theme: Theme }> = {
  violet: {
    label: "Dark Violet",
    swatch: "#6C5CE7",
    theme: defaultTheme,
  },
  light: {
    label: "Clean Light",
    swatch: "#2563EB",
    theme: {
      mode: "light",
      colors: {
        background: "#FFFFFF",
        surface: "#F8FAFC",
        surfaceBorder: "rgba(0,0,0,0.08)",
        primary: "#2563EB",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
        secondary: "#F1F5F9",
        secondaryForeground: "#0F172A",
        accent: "#0EA5E9",
        muted: "#F1F5F9",
        mutedForeground: "#94A3B8",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        textMuted: "#94A3B8",
        border: "rgba(0,0,0,0.10)",
        ring: "#2563EB",
        destructive: "#DC2626",
        card: "#FFFFFF",
        cardForeground: "#0F172A",
        overlay: "rgba(0,0,0,0.5)",
        success: "#16A34A",
        warning: "#D97706",
        inputBackground: "#F8FAFC",
        inputBorder: "rgba(0,0,0,0.12)",
      },
      colorsDark: {
        background: "#0A0F1E",
        surface: "#111827",
        surfaceBorder: "rgba(255,255,255,0.06)",
        primary: "#3B82F6",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
        secondary: "#1E293B",
        secondaryForeground: "#CBD5E1",
        accent: "#38BDF8",
        muted: "#1E293B",
        mutedForeground: "#64748B",
        textPrimary: "#F1F5F9",
        textSecondary: "#94A3B8",
        textMuted: "#475569",
        border: "rgba(255,255,255,0.08)",
        ring: "#3B82F6",
        destructive: "#EF4444",
        card: "#141B2D",
        cardForeground: "#F1F5F9",
        overlay: "rgba(0,0,0,0.6)",
        success: "#10B981",
        warning: "#F59E0B",
        inputBackground: "#1E293B",
        inputBorder: "rgba(255,255,255,0.10)",
      },
      fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
      fontWeights: { heading: 700, body: 400 },
      typography: SHARED_TYPOGRAPHY,
      spacing: { sectionY: "96px", containerMax: "1200px", xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
      radii: { card: "12px", button: "8px", base: "0.5rem" },
      shadows: { card: "0 1px 8px rgba(0,0,0,0.08)", glow: "0 0 32px rgba(37,99,235,0.12)" },
      focusRing: { offset: "2px", width: "2px", color: "#2563EB" },
      button: { radius: "6px", shadow: "0 1px 3px rgba(0,0,0,0.1)", hoverShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 150ms ease" },
    },
  },
  ocean: {
    label: "Midnight Ocean",
    swatch: "#38BDF8",
    theme: {
      mode: "dark",
      colors: {
        background: "#020B18",
        surface: "#050F20",
        surfaceBorder: "rgba(56,189,248,0.08)",
        primary: "#38BDF8",
        primaryForeground: "#020B18",
        primaryGradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
        secondary: "#0D1F35",
        secondaryForeground: "#BAE6FD",
        accent: "#7DD3FC",
        muted: "#0A1929",
        mutedForeground: "#475569",
        textPrimary: "#F0F9FF",
        textSecondary: "#7DD3FC",
        textMuted: "#334155",
        border: "rgba(56,189,248,0.12)",
        ring: "#38BDF8",
        destructive: "#F87171",
        card: "#071525",
        cardForeground: "#F0F9FF",
        overlay: "rgba(0,0,0,0.65)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#0D1F35",
        inputBorder: "rgba(56,189,248,0.15)",
      },
      colorsDark: {
        background: "#020B18",
        surface: "#050F20",
        surfaceBorder: "rgba(56,189,248,0.08)",
        primary: "#38BDF8",
        primaryForeground: "#020B18",
        primaryGradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
        secondary: "#0D1F35",
        secondaryForeground: "#BAE6FD",
        accent: "#7DD3FC",
        muted: "#0A1929",
        mutedForeground: "#475569",
        textPrimary: "#F0F9FF",
        textSecondary: "#7DD3FC",
        textMuted: "#334155",
        border: "rgba(56,189,248,0.12)",
        ring: "#38BDF8",
        destructive: "#F87171",
        card: "#071525",
        cardForeground: "#F0F9FF",
        overlay: "rgba(0,0,0,0.65)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#0D1F35",
        inputBorder: "rgba(56,189,248,0.15)",
      },
      fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
      fontWeights: { heading: 700, body: 400 },
      typography: SHARED_TYPOGRAPHY,
      spacing: { sectionY: "96px", containerMax: "1200px", xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
      radii: { card: "16px", button: "10px", base: "0.625rem" },
      shadows: { card: "0 4px 24px rgba(0,0,0,0.5)", glow: "0 0 40px rgba(56,189,248,0.15)" },
      focusRing: { offset: "2px", width: "2px", color: "#38BDF8" },
      button: { radius: "8px", shadow: "0 2px 6px rgba(0,0,0,0.4)", hoverShadow: "0 0 20px rgba(56,189,248,0.5)", transition: "all 200ms cubic-bezier(0.4,0,0.2,1)" },
    },
  },
  forest: {
    label: "Forest",
    swatch: "#10B981",
    theme: {
      mode: "dark",
      colors: {
        background: "#051A10",
        surface: "#071F13",
        surfaceBorder: "rgba(16,185,129,0.08)",
        primary: "#10B981",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #059669, #10B981)",
        secondary: "#0A2B1A",
        secondaryForeground: "#A7F3D0",
        accent: "#34D399",
        muted: "#071F13",
        mutedForeground: "#4B7A5E",
        textPrimary: "#ECFDF5",
        textSecondary: "#6EE7B7",
        textMuted: "#374151",
        border: "rgba(16,185,129,0.12)",
        ring: "#10B981",
        destructive: "#F87171",
        card: "#061810",
        cardForeground: "#ECFDF5",
        overlay: "rgba(0,0,0,0.65)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#0A2B1A",
        inputBorder: "rgba(16,185,129,0.15)",
      },
      colorsDark: {
        background: "#051A10",
        surface: "#071F13",
        surfaceBorder: "rgba(16,185,129,0.08)",
        primary: "#10B981",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #059669, #10B981)",
        secondary: "#0A2B1A",
        secondaryForeground: "#A7F3D0",
        accent: "#34D399",
        muted: "#071F13",
        mutedForeground: "#4B7A5E",
        textPrimary: "#ECFDF5",
        textSecondary: "#6EE7B7",
        textMuted: "#374151",
        border: "rgba(16,185,129,0.12)",
        ring: "#10B981",
        destructive: "#F87171",
        card: "#061810",
        cardForeground: "#ECFDF5",
        overlay: "rgba(0,0,0,0.65)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#0A2B1A",
        inputBorder: "rgba(16,185,129,0.15)",
      },
      fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
      fontWeights: { heading: 700, body: 400 },
      typography: SHARED_TYPOGRAPHY,
      spacing: { sectionY: "96px", containerMax: "1200px", xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
      radii: { card: "14px", button: "8px", base: "0.5rem" },
      shadows: { card: "0 4px 24px rgba(0,0,0,0.4)", glow: "0 0 40px rgba(16,185,129,0.15)" },
      focusRing: { offset: "2px", width: "2px", color: "#10B981" },
      button: { radius: "6px", shadow: "0 2px 6px rgba(0,0,0,0.4)", hoverShadow: "0 0 20px rgba(16,185,129,0.45)", transition: "all 200ms ease" },
    },
  },
  amber: {
    label: "Warm Amber",
    swatch: "#D97706",
    theme: {
      mode: "light",
      colors: {
        background: "#FFFBF0",
        surface: "#FEF3C7",
        surfaceBorder: "rgba(0,0,0,0.07)",
        primary: "#D97706",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #D97706, #F59E0B)",
        secondary: "#FEF3C7",
        secondaryForeground: "#78350F",
        accent: "#F59E0B",
        muted: "#FEF9EC",
        mutedForeground: "#92400E",
        textPrimary: "#1C1917",
        textSecondary: "#78350F",
        textMuted: "#A16207",
        border: "rgba(0,0,0,0.09)",
        ring: "#D97706",
        destructive: "#DC2626",
        card: "#FFFEF8",
        cardForeground: "#1C1917",
        overlay: "rgba(0,0,0,0.5)",
        success: "#16A34A",
        warning: "#D97706",
        inputBackground: "#FFFEF8",
        inputBorder: "rgba(0,0,0,0.10)",
      },
      colorsDark: {
        background: "#1C1407",
        surface: "#261B0A",
        surfaceBorder: "rgba(251,191,36,0.08)",
        primary: "#F59E0B",
        primaryForeground: "#1C1407",
        primaryGradient: "linear-gradient(135deg, #D97706, #F59E0B)",
        secondary: "#292007",
        secondaryForeground: "#FDE68A",
        accent: "#FCD34D",
        muted: "#231A06",
        mutedForeground: "#92400E",
        textPrimary: "#FEF9EC",
        textSecondary: "#FDE68A",
        textMuted: "#78350F",
        border: "rgba(251,191,36,0.10)",
        ring: "#F59E0B",
        destructive: "#F87171",
        card: "#1A1206",
        cardForeground: "#FEF9EC",
        overlay: "rgba(0,0,0,0.6)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#292007",
        inputBorder: "rgba(251,191,36,0.12)",
      },
      fonts: { heading: "Georgia, serif", body: "Inter, sans-serif" },
      fontWeights: { heading: 700, body: 400 },
      typography: SHARED_TYPOGRAPHY,
      spacing: { sectionY: "96px", containerMax: "1200px", xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
      radii: { card: "8px", button: "6px", base: "0.375rem" },
      shadows: { card: "0 2px 12px rgba(0,0,0,0.06)", glow: "0 0 32px rgba(217,119,6,0.12)" },
      focusRing: { offset: "2px", width: "2px", color: "#D97706" },
      button: { radius: "4px", shadow: "none", hoverShadow: "0 2px 8px rgba(217,119,6,0.3)", transition: "all 180ms ease" },
    },
  },
  pebble: {
    label: "Pebble",
    swatch: "#BEBAB4",
    theme: {
      mode: "light",
      colors: {
        background: "#EDEAE6",
        surface: "#F5F3F0",
        surfaceBorder: "rgba(0,0,0,0.05)",
        primary: "#3D3D3D",
        primaryForeground: "#FFFFFF",
        primaryGradient: "linear-gradient(135deg, #3D3D3D, #6B6B6B)",
        secondary: "#E4E1DC",
        secondaryForeground: "#1A1A1A",
        accent: "#5A5A5A",
        muted: "#E8E5E0",
        mutedForeground: "#9E9A94",
        textPrimary: "#1A1A1A",
        textSecondary: "#6B6863",
        textMuted: "#A8A49E",
        border: "rgba(0,0,0,0.06)",
        ring: "#3D3D3D",
        destructive: "#C0392B",
        card: "#F5F3F0",
        cardForeground: "#1A1A1A",
        overlay: "rgba(0,0,0,0.45)",
        success: "#2D8653",
        warning: "#B45309",
        inputBackground: "#F5F3F0",
        inputBorder: "rgba(0,0,0,0.08)",
      },
      colorsDark: {
        background: "#1A1A1A",
        surface: "#242424",
        surfaceBorder: "rgba(255,255,255,0.05)",
        primary: "#BEBAB4",
        primaryForeground: "#1A1A1A",
        primaryGradient: "linear-gradient(135deg, #9E9A94, #BEBAB4)",
        secondary: "#2E2E2E",
        secondaryForeground: "#E8E5E0",
        accent: "#9E9A94",
        muted: "#272727",
        mutedForeground: "#6B6863",
        textPrimary: "#EDEAE6",
        textSecondary: "#A8A49E",
        textMuted: "#6B6863",
        border: "rgba(255,255,255,0.06)",
        ring: "#BEBAB4",
        destructive: "#E74C3C",
        card: "#202020",
        cardForeground: "#EDEAE6",
        overlay: "rgba(0,0,0,0.6)",
        success: "#34D399",
        warning: "#FCD34D",
        inputBackground: "#2E2E2E",
        inputBorder: "rgba(255,255,255,0.08)",
      },
      fonts: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
      fontWeights: { heading: 700, body: 400 },
      typography: SHARED_TYPOGRAPHY,
      spacing: { sectionY: "80px", containerMax: "1200px", xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px" },
      radii: { card: "20px", button: "999px", base: "1rem" },
      shadows: { card: "none", glow: "none" },
      focusRing: { offset: "2px", width: "2px", color: "#3D3D3D" },
      button: { radius: "999px", shadow: "none", hoverShadow: "none", transition: "all 200ms ease" },
    },
  },
};

const DEFAULT_SPEC_TEXT = JSON.stringify(LANDING_SPEC_OBJ, null, 2);
const DEFAULT_THEME_TEXT = JSON.stringify(defaultTheme, null, 2);

// ─── Section list helper ─────────────────────────────────────────────────────

function getSections(specObj: Record<string, unknown> | null): string[] {
  if (!specObj) return [];
  const elements = (specObj as { elements?: Record<string, RawElement> }).elements;
  if (!elements) return [];
  const root = (specObj as { root?: string }).root;
  const rootEl = root ? elements[root] : null;
  const children =
    (rootEl?.children as string[]) ??
    ((rootEl?.slots as { default?: string[] })?.default as string[]) ??
    [];
  return children.filter((id) => id in elements);
}

// ─── Column 1: Tabbed JSON editor ───────────────────────────────────────────

type EditorTab = "spec" | "theme";

function JsonEditorPanel({
  specText,
  themeText,
  onSpecTextChange,
  onThemeTextChange,
  specError,
  themeError,
  activeSample,
  onLoadSample,
}: {
  specText: string;
  themeText: string;
  onSpecTextChange: (v: string) => void;
  onThemeTextChange: (v: string) => void;
  specError: string | null;
  themeError: string | null;
  activeSample: SampleId;
  onLoadSample: (id: SampleId) => void;
}) {
  const [tab, setTab] = useState<EditorTab>("spec");
  const text = tab === "spec" ? specText : themeText;
  const onChange = tab === "spec" ? onSpecTextChange : onThemeTextChange;
  const error = tab === "spec" ? specError : themeError;

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 dark:border-zinc-800">
      <div className="shrink-0 space-y-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {/* Sample picker */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Samples</p>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(SAMPLES) as SampleId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onLoadSample(id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  activeSample === id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                )}
              >
                {SAMPLES[id].label}
              </button>
            ))}
          </div>
        </div>
        {/* Spec / Theme tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/60">
          {(["spec", "theme"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition",
                tab === t
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              )}
            >
              {t === "spec" ? "Component Spec" : "Theme Spec"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 min-h-0 flex-col p-3">
        {error && (
          <p className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 min-h-0 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300"
        />
      </div>
    </div>
  );
}

// ─── Column 2: Visual controls ──────────────────────────────────────────────

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isGradient = value.includes("gradient");
  return (
    <label className="flex items-center gap-2 text-xs">
      <span
        className="relative h-6 w-6 shrink-0 overflow-hidden rounded border border-zinc-300 dark:border-zinc-600"
        style={{ background: value }}
      >
        {!isGradient && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        )}
      </span>
      <span className="flex-1 truncate text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
        {value.length > 20 ? value.slice(0, 18) + "…" : value}
      </span>
    </label>
  );
}

function VisualControlsPanel({
  theme,
  onThemeChange,
  sections,
  selectedSection,
  onSelectSection,
  activeThemePreset,
  onLoadThemePreset,
}: {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  sections: string[];
  selectedSection: string | null;
  onSelectSection: (s: string | null) => void;
  activeThemePreset: ThemePresetId | null;
  onLoadThemePreset: (id: ThemePresetId) => void;
}) {
  const updateColor = (key: string, val: string) => {
    onThemeChange({
      ...theme,
      colors: { ...theme.colors, [key]: val },
    });
  };

  const colorEntries = Object.entries(theme.colors).filter(
    ([, v]) => !v.includes("gradient")
  );
  const gradientEntries = Object.entries(theme.colors).filter(([, v]) =>
    v.includes("gradient")
  );

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 dark:border-zinc-800">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Design Controls
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Tweak theme &amp; browse sections.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Theme presets */}
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Theme Presets
          </p>
          <div className="flex flex-col gap-1">
            {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((id) => {
              const preset = THEME_PRESETS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onLoadThemePreset(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium transition",
                    activeThemePreset === id
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                    style={{ background: preset.swatch }}
                  />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Sections */}
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Sections
          </p>
          <div className="flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectSection(selectedSection === s ? null : s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-left text-xs font-medium transition",
                  selectedSection === s
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Colors
          </p>
          <div className="space-y-2">
            {colorEntries.map(([key, val]) => (
              <ColorSwatch
                key={key}
                label={key}
                value={val}
                onChange={(v) => updateColor(key, v)}
              />
            ))}
          </div>
        </section>

        {/* Gradients (read-only preview) */}
        {gradientEntries.length > 0 && (
          <section>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Gradients
            </p>
            <div className="space-y-2">
              {gradientEntries.map(([key, val]) => (
                <ColorSwatch
                  key={key}
                  label={key}
                  value={val}
                  onChange={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Spacing / Radii */}
        <section>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Spacing &amp; Radii
          </p>
          <div className="space-y-2 text-xs">
            {Object.entries(theme.spacing).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">{key}</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{val}</span>
              </div>
            ))}
            {Object.entries(theme.radii).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">radius.{key}</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Column 3: Live render ──────────────────────────────────────────────────

function LiveRenderPanel({
  spec,
  theme,
}: {
  spec: Spec | null;
  theme: Theme;
}) {
  const cssVars = useMemo(() => themeToCssVars(theme), [theme]);
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div className="flex h-full flex-col bg-zinc-100 dark:bg-zinc-950">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Live Render
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Full web preview with theme applied.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRenderKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500"
          >
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2M13.5 2.5v2.7h-2.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-[var(--container-max,1200px)]">
          <div key={renderKey} style={cssVars as React.CSSProperties}>
            <StateProvider initialState={{}}>
              <VisibilityProvider>
                <ActionProvider handlers={{}}>
                  <Renderer spec={spec} registry={webRegistry} loading={false} />
                </ActionProvider>
              </VisibilityProvider>
            </StateProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

function RenderWorkspace() {
  const [activeSample, setActiveSample] = useState<SampleId>("landing");
  const [activeThemePreset, setActiveThemePreset] = useState<ThemePresetId | null>("violet");
  const [specText, setSpecText] = useState(DEFAULT_SPEC_TEXT);
  const [themeText, setThemeText] = useState(DEFAULT_THEME_TEXT);
  const [spec, setSpec] = useState<Spec | null>(() => normalizeSpec(LANDING_SPEC_OBJ));
  const [specObj, setSpecObj] = useState<Record<string, unknown>>(LANDING_SPEC_OBJ);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [specError, setSpecError] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const specDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSample = useCallback((id: SampleId) => {
    const sample = SAMPLES[id];
    const text = JSON.stringify(sample.obj, null, 2);
    setActiveSample(id);
    setSpecText(text);
    setSpecObj(sample.obj);
    setSpec(normalizeSpec(sample.obj));
    setSpecError(null);
    setSelectedSection(null);
  }, []);

  const loadThemePreset = useCallback((id: ThemePresetId) => {
    const preset = THEME_PRESETS[id];
    setActiveThemePreset(id);
    setTheme(preset.theme);
    setThemeText(JSON.stringify(preset.theme, null, 2));
    setThemeError(null);
  }, []);

  const handleSpecText = useCallback((text: string) => {
    setSpecText(text);
    if (specDebounce.current) clearTimeout(specDebounce.current);
    specDebounce.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(text.trim());
        setSpecObj(parsed);
        setSpec(normalizeSpec(parsed));
        setSpecError(null);
      } catch (e) {
        setSpecError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }, 400);
  }, []);

  const handleThemeText = useCallback((text: string) => {
    setActiveThemePreset(null);
    setThemeText(text);
    if (themeDebounce.current) clearTimeout(themeDebounce.current);
    themeDebounce.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(text.trim()) as Theme;
        if (!parsed.colors || typeof parsed.colors !== "object") {
          setThemeError("Theme must have a colors object");
          return;
        }
        setTheme(parsed);
        setThemeError(null);
      } catch (e) {
        setThemeError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }, 400);
  }, []);

  const handleThemeFromControls = useCallback((t: Theme) => {
    setActiveThemePreset(null);
    setTheme(t);
    setThemeText(JSON.stringify(t, null, 2));
    setThemeError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (specDebounce.current) clearTimeout(specDebounce.current);
      if (themeDebounce.current) clearTimeout(themeDebounce.current);
    };
  }, []);

  const sections = useMemo(() => getSections(specObj), [specObj]);

  return (
    <div className="grid h-full grid-cols-[380px_260px_1fr]">
      <JsonEditorPanel
        specText={specText}
        themeText={themeText}
        onSpecTextChange={handleSpecText}
        onThemeTextChange={handleThemeText}
        specError={specError}
        themeError={themeError}
        activeSample={activeSample}
        onLoadSample={loadSample}
      />
      <VisualControlsPanel
        theme={theme}
        onThemeChange={handleThemeFromControls}
        sections={sections}
        selectedSection={selectedSection}
        onSelectSection={setSelectedSection}
        activeThemePreset={activeThemePreset}
        onLoadThemePreset={loadThemePreset}
      />
      <LiveRenderPanel spec={spec} theme={theme} />
    </div>
  );
}

export default function RenderPage() {
  return (
    <main className="h-[calc(100vh-49px)]">
      <RenderWorkspace />
    </main>
  );
}
