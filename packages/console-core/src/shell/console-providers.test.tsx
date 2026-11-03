import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The stack's own parts are not what is under test: the contexts it nests are passed through, so the
// markup holds only what the stack itself mounts around the children.
const { passThrough } = vi.hoisted(() => ({ passThrough: ({ children }: { children?: unknown }) => children }));
vi.mock("@simplix-react/i18n/react", () => ({ I18nProvider: passThrough, useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@simplix-react/auth/react", () => ({ AuthProvider: passThrough }));
vi.mock("@simplix-react/access/react", () => ({ AccessProvider: passThrough }));
vi.mock("@tanstack/react-query", () => ({ QueryClientProvider: passThrough }));
// The framework's toast store has no server snapshot, so the surface is replaced by a marker: what is
// under test is whether the stack mounts it.
vi.mock("@simplix-react/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@simplix-react/ui")>()),
  ToastContainer: () => <i data-toast-surface="" />,
}));
vi.mock("../error", () => ({ ErrorDialog: () => null }));
vi.mock("./display-preferences", () => ({
  useDisplayPreferences: () => ({ prefs: {} }),
  useAppliedFill: () => undefined,
}));
vi.mock("./use-theme", () => ({ useTheme: () => ({ colorTheme: "light" }) }));
vi.mock("../layout/tiles-collapse", () => ({ TilesCollapseProvider: passThrough }));

const { ConsoleProviders } = await import("./console-providers");


function draw(drawToasts?: boolean): string {
  const props = {
    namespace: "test",
    i18nAdapter: {},
    auth: {},
    accessPolicy: {},
    queryClient: {},
    product: { subjects: {}, brand: null },
    ...(drawToasts === undefined ? {} : { drawToasts }),
  } as unknown as Parameters<typeof ConsoleProviders>[0];
  return renderToStaticMarkup(<ConsoleProviders {...props}>page</ConsoleProviders>);
}

describe("ConsoleProviders toast surface", () => {
  it("mounts the console's toast surface by default, so the console apps keep their toasts", () => {
    expect(draw()).toContain("data-toast-surface");
  });

  it("mounts it when asked to", () => {
    expect(draw(true)).toContain("data-toast-surface");
  });

  it("mounts no toast surface when the product draws the store itself, so no toast is drawn twice", () => {
    const markup = draw(false);
    expect(markup).not.toContain("data-toast-surface");
    expect(markup).toContain("page");
  });
});
