import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { format } from "node:util";
import { act, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { createI18nConfig } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import { TooltipProvider, UIProvider } from "@simplix-react/ui";
import { composeStories } from "@storybook/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PAGE_PROPS } from "./page-props.mjs";

/**
 * Every board frame a kit's templates generated, and every generated page and shell that has no
 * frame, mounted once per story or component in the providers a board
 * gives a console screen: the language, the query client, the router, the framework's UI defaults,
 * and, where the kit exports them, the product identity and the peek host. A frame passes when it
 * mounts without throwing, draws an element, and nothing reports an error to the console while it
 * settles.
 */

const out = process.env.HARNESS_OUT as string;
const kitDir = process.env.HARNESS_KIT as string;
const kit = JSON.parse(readFileSync(join(kitDir, "package.json"), "utf-8")) as { name: string; exports: Record<string, unknown> };
const storiesDir = join(out, "stories");
const storyFiles = readdirSync(storiesDir).filter((file) => file.endsWith(".stories.tsx")).sort();
const storyNames = new Set(storyFiles.map((file) => file.slice(0, -".stories.tsx".length)));

/**
 * The generated pages and shells that have no board frame, mounted as the router mounts them: a
 * module's `pages/<name>/page.tsx` and an app's `app/layouts/root-layout.tsx`, with the props
 * `page-props.mjs` gives a page that takes required ones.
 */
function unframed(): { label: string; file: string; props: Record<string, unknown> }[] {
  const found: { label: string; file: string; props: Record<string, unknown> }[] = [];
  const pagesDir = join(out, "modules", "admin", "note", "src", "pages");
  for (const name of existsSync(pagesDir) ? readdirSync(pagesDir).sort() : []) {
    const file = join(pagesDir, name, "page.tsx");
    const props = (PAGE_PROPS as Record<string, Record<string, unknown>>)[name] ?? {};
    if (existsSync(file) && !storyNames.has(name)) found.push({ label: `page ${name}`, file, props });
  }
  const appsDir = join(out, "apps");
  for (const app of existsSync(appsDir) ? readdirSync(appsDir).sort() : []) {
    const file = join(appsDir, app, "src", "app", "layouts", "root-layout.tsx");
    if (existsSync(file) && !storyNames.has(`${app}-shell`)) found.push({ label: `shell ${app}`, file, props: {} });
  }
  return found;
}

type Wrapper = ComponentType<{ children: ReactNode }>;

/** The kit's own providers a console screen sits in, where the kit exports them. */
async function kitProviders(): Promise<Wrapper[]> {
  const wrappers: Wrapper[] = [];
  if ("./identity" in kit.exports) {
    const { ConsoleProductProvider } = await import(/* @vite-ignore */ `${kit.name}/identity`);
    wrappers.push(({ children }) => <ConsoleProductProvider subjects={{}}>{children}</ConsoleProductProvider>);
  }
  if ("./peek" in kit.exports) {
    const { PeekHost } = await import(/* @vite-ignore */ `${kit.name}/peek`);
    wrappers.push(({ children }) => <PeekHost>{children}</PeekHost>);
  }
  return wrappers;
}

let root: Root | undefined;
let errors: string[] = [];

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // The browser APIs a laid-out page reads that the DOM implementation leaves out.
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }));
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errors.push(format(...args).split("\n").slice(0, 3).join(" | "));
  });
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  errors = [];
  document.body.innerHTML = "";
});

async function mount(Story: ComponentType): Promise<HTMLElement> {
  const { adapter, i18nReady } = createI18nConfig({ defaultLocale: "en", supportedLocales: ["en"] });
  await i18nReady;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const wrappers = await kitProviders();
  const Screen = () => wrappers.reduceRight<ReactNode>((inner, Wrap) => <Wrap>{inner}</Wrap>, <Story />);
  const router = createRouter({ routeTree: createRootRoute({ component: Screen }), history: createMemoryHistory({ initialEntries: ["/"] }) });
  await router.load();
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root?.render(
      <I18nProvider adapter={adapter}>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>
          </UIProvider>
        </QueryClientProvider>
      </I18nProvider>,
    );
  });
  // Let the effects a first paint starts (mock reads, the router's own) settle.
  await act(async () => new Promise((done) => setTimeout(done, 50)));
  return host;
}

async function expectMounts(name: string, Story: ComponentType): Promise<void> {
  const host = await mount(Story);
  expect(errors, `${name}: errors while mounting`).toEqual([]);
  // A page hands its title to the shell's header, which a frame mounted alone does not have, so
  // a page with no rows yet draws its regions and no words: drawing an element is the measure.
  expect(host.firstElementChild, `${name}: drew nothing`).not.toBeNull();
  act(() => root?.unmount());
  root = undefined;
}

describe.each(storyFiles)("%s", (file) => {
  it("mounts every story without an error", async () => {
    const stories = composeStories(await import(/* @vite-ignore */ join(storiesDir, file))) as Record<string, ComponentType>;
    expect(Object.keys(stories).length).toBeGreaterThan(0);
    for (const [name, Story] of Object.entries(stories)) await expectMounts(name, Story);
  });
});

describe.each(unframed())("$label", ({ file, props }) => {
  it("mounts without an error", async () => {
    const module = (await import(/* @vite-ignore */ file)) as Record<string, unknown>;
    const exported = Object.entries(module).filter(([name, value]) => typeof value === "function" && /(Page|RootLayout)$/.test(name));
    expect(exported.length, `${file}: exports no page component`).toBeGreaterThan(0);
    for (const [name, Component] of exported) {
      const Page = Component as ComponentType<Record<string, unknown>>;
      await expectMounts(name, () => <Page {...props} />);
    }
  });
});
