import type { Spec } from "@json-render/core";

/** Format a prop value for JSX: strings quoted, primitives as {expr}, objects as JSON */
function formatPropValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "{null}";
  if (typeof value === "string") {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") return `{${String(value)}}`;
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return `{${json}}`;
  }
  return "{}";
}

/** Convert a single element to JSX string (opens tag, children rendered separately) */
function elementToReact(
  key: string,
  el: { type: string; props?: Record<string, unknown>; children?: string[] },
  elements: Record<string, { type: string; props?: Record<string, unknown>; children?: string[] }>,
  indent: string
): string {
  const type = el.type;
  const props = el.props ?? {};
  const childKeys = el.children ?? [];
  const hasChildren = childKeys.length > 0;

  const propEntries = Object.entries(props)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${formatPropValue(v)}`);
  const propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";

  const childLines = childKeys
    .map((childKey) => {
      const child = elements[childKey];
      if (!child) return `${indent}  {/* missing: ${childKey} */}`;
      return elementToReact(childKey, child, elements, indent + "  ");
    })
    .filter(Boolean);

  if (hasChildren) {
    return `${indent}<${type}${propsStr}>\n${childLines.join("\n")}\n${indent}</${type}>`;
  }
  return `${indent}<${type}${propsStr} />`;
}

/**
 * Convert a Spec (root + elements) into a React component code string.
 * Output is a single root JSX expression.
 */
export function specToReactCode(spec: Spec | null): string {
  if (!spec?.root || !spec.elements?.[spec.root]) {
    return "// No UI spec yet. Describe a screen in the chat.";
  }

  const rootEl = spec.elements[spec.root] as {
    type: string;
    props?: Record<string, unknown>;
    children?: string[];
  };
  const code = elementToReact(spec.root, rootEl, spec.elements as Record<string, { type: string; props?: Record<string, unknown>; children?: string[] }>, "  ");
  return `function GeneratedUI() {\n  return (\n${code}\n  );\n}`;
}
