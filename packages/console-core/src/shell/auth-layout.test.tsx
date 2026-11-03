import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The console's theme store reads the stored scheme when its module loads; a server render has no storage.
const stored = new Map<string, string>();
vi.stubGlobal("localStorage", { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => void stored.set(key, value) });
const { AuthLayout } = await import("./auth-layout");
const { ConsoleProductProvider } = await import("../identity/console-product");

function draw(themeControl?: ReactNode): string {
  return renderToStaticMarkup(
    <ConsoleProductProvider subjects={{}} brand={<span data-slot="brand-mark" />}>
      <AuthLayout themeControl={themeControl}>form</AuthLayout>
    </ConsoleProductProvider>,
  );
}

/** The corner of the sign-in page: what the preferences part holds. */
function corner(markup: string): string {
  const at = markup.indexOf('data-part="console-auth-preferences"');
  expect(at).toBeGreaterThan(-1);
  const close = markup.indexOf('data-slot="console-auth-brand"');
  return markup.slice(at, close > at ? close : undefined);
}

describe("AuthLayout", () => {
  it("draws the console's dark-mode toggle in the corner when the product hands no control of its own", () => {
    const markup = draw();
    expect(corner(markup)).toContain("<button");
    expect(markup).not.toContain('data-slot="product-scheme"');
  });

  it("draws the product's scheme control in place of the toggle, so the page holds one control for the scheme", () => {
    const markup = draw(<span data-slot="product-scheme" />);
    const held = corner(markup);
    expect(held).toContain('data-slot="product-scheme"');
    expect(held.match(/<button/g)?.length ?? 0).toBe(corner(draw()).match(/<button/g)!.length - 1);
  });
});
