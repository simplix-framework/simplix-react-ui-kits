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
vi.mock("../error", () => ({ ErrorDialog: () => <i data-error-surface="" /> }));
vi.mock("./display-preferences", () => ({
  useDisplayPreferences: () => ({ prefs: {} }),
  useAppliedFill: () => undefined,
}));
vi.mock("./use-theme", () => ({ useTheme: () => ({ colorTheme: "light" }) }));
vi.mock("../layout/tiles-collapse", () => ({ TilesCollapseProvider: passThrough }));

const { ConsoleProviders } = await import("./console-providers");


function draw(drawToasts?: boolean, drawErrors?: boolean): string {
  const props = {
    namespace: "test",
    i18nAdapter: {},
    auth: {},
    accessPolicy: {},
    queryClient: {},
    product: { subjects: {}, brand: null },
    ...(drawToasts === undefined ? {} : { drawToasts }),
    ...(drawErrors === undefined ? {} : { drawErrors }),
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

describe("ConsoleProviders error dialog", () => {
  it("mounts the console's error dialog by default and when asked to", () => {
    expect(draw()).toContain("data-error-surface");
    expect(draw(undefined, true)).toContain("data-error-surface");
  });

  it("mounts no error dialog when the product draws the error store itself, so no failure is told twice", () => {
    const markup = draw(undefined, false);
    expect(markup).not.toContain("data-error-surface");
    expect(markup).toContain("data-toast-surface");
  });
});
