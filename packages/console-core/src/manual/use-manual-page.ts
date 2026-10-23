import { useEffect, useState } from "react";

/** Where the build put the rendered manual. Served as static files beside the applications. */
const MANUAL_ROOT = "/manual";

/** The language every reader falls back to. A page missing here is missing everywhere. */
const FALLBACK_LOCALE = "en";

/** What one language's index says about itself. */
interface ManualIndex {
  locale: string;
  pages: { slug: string; title: string; step: number; sections: string[] }[];
  routes: Record<string, string>;
}

/** What the panel needs to draw one page. */
export interface ManualPage {
  /** The page's own title, in the language it was written in. */
  title: string;
  /** Its `##` headings, in order — what the panel lists at the top. */
  sections: string[];
  /** The page's body, already HTML. */
  html: string;
  /** The language actually opened, which is not the one asked for when a page was missing. */
  locale: string;
  /** Every page of the language actually opened, for the contents when no page answers. */
  contents: { slug: string; title: string; step: number }[];
}

/** What the panel is showing: a page, the contents, or the reason it has neither. */
export type ManualState =
  | { status: "loading" }
  | { status: "page"; page: ManualPage; fellBack: boolean }
  | { status: "no-page"; contents: ManualPage["contents"]; locale: string }
  | { status: "unavailable" };

const indexCache = new Map<string, Promise<ManualIndex | null>>();

/**
 * Reads one language's index, once per session.
 *
 * @param locale the language to read
 * @returns its index, or null when that language has no manual
 */
function readIndex(locale: string): Promise<ManualIndex | null> {
  const held = indexCache.get(locale);
  if (held) return held;
  const request = fetch(`${MANUAL_ROOT}/${locale}/index.json`)
    .then((r) => (r.ok ? (r.json() as Promise<ManualIndex>) : null))
    .catch(() => null);
  indexCache.set(locale, request);
  return request;
}

/**
 * Extracts the rendered body from a page document, with its pictures made findable.
 *
 * <p>Parsed rather than sliced with a regular expression: the page is a whole document with a
 * head of its own, and the panel wants the one element that carries the prose.
 *
 * <p>The pictures are named by a path relative to the page (`images/desktop/D-04.png`), which is
 * what lets the two languages write the same sentence. Injected into a console screen that path
 * resolves against whatever route is open — `/contracts/images/...` — so every picture would be
 * broken, and broken in a way that changes with the screen the reader happens to be on. They are
 * made absolute here, against the language the page actually came from.
 *
 * @param html the document as served
 * @param locale the language this document was fetched from
 * @returns the article's inner HTML, or null when the document carries none
 */
function articleOf(html: string, locale: string): string | null {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const article = parsed.querySelector("article.manual-page");
  if (!article) return null;

  // The page is this repository's own build output served from this origin, and the renderer
  // rebuilds every image tag from three attributes rather than copying what the source wrote.
  // Stripped again here anyway: this is the last point before the markup becomes live, it costs
  // one pass, and a check that only holds while both halves stay in agreement is not a check.
  for (const node of article.querySelectorAll("script, style, iframe, object, embed, link")) {
    node.remove();
  }
  for (const node of article.querySelectorAll("*")) {
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || (name === "href" && /^\s*javascript:/i.test(attr.value))) {
        node.removeAttribute(attr.name);
      }
    }
  }

  for (const img of article.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (!src || /^([a-z]+:)?\/\//i.test(src) || src.startsWith("/")) continue;
    img.setAttribute("src", `${MANUAL_ROOT}/${locale}/${src}`);
    img.setAttribute("loading", "lazy");
  }
  return article.innerHTML;
}

/**
 * Every key worth trying for one route, nearest first.
 *
 * <p>Two things separate what the router says from what the board wrote. The router's paths end
 * in a slash and the board's do not, which alone left all but two of the console's screens
 * looking as though the manual did not cover them. And a route can carry a parameter — the
 * installations of one signing key — which no page can name, so the walk up the path finds the
 * page about the thing that route belongs to instead of giving up at the leaf.
 *
 * @param route the path the console is on
 * @returns the keys to look up, from the exact route to its shallowest parent
 */
function lookupKeys(route: string): string[] {
  const trimmed = route.length > 1 ? route.replace(/\/+$/, "") : "/";
  const keys = [trimmed];
  let at = trimmed;
  while (at.includes("/") && at !== "/") {
    at = at.slice(0, at.lastIndexOf("/")) || "/";
    keys.push(at);
  }
  return keys;
}

/**
 * The manual page that answers for a route, in the reader's language where one exists.
 *
 * <p>Three answers and they are different things. A page in the asked-for language is the
 * ordinary one. A page only in English is opened AND said so — an operator reading the console
 * in Korean who is handed English gets no explanation from the prose itself, so the panel has to
 * supply one or the missing translation reads as a broken screen. No page for this route at all
 * is not an error either: the manual is written per step of the work, and a screen no step has
 * reached yet simply has none, so the contents open instead of a dead end.
 *
 * @param route the path the console is on
 * @param locale the language the console is being read in
 * @param chosen a page the reader picked from the contents, which wins over the route
 * @returns what the panel should draw
 */
export function useManualPage(route: string, locale: string, chosen?: string): ManualState {
  const [state, setState] = useState<ManualState>({ status: "loading" });

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });

    (async () => {
      const asked = await readIndex(locale);
      const fallback = locale === FALLBACK_LOCALE ? asked : await readIndex(FALLBACK_LOCALE);
      if (!live) return;
      if (!asked && !fallback) { setState({ status: "unavailable" }); return; }

      // The asked-for language decides which page answers; English only supplies the prose when
      // that language has not written it. Letting English choose the page too would send a
      // reader to a different page than their own language would have opened.
      const index = asked ?? fallback!;
      const slug = chosen ?? lookupKeys(route).map((key) => index.routes[key]).find(Boolean);
      const contents = index.pages
        .map(({ slug: s, title, step }) => ({ slug: s, title, step }))
        .sort((a, b) => a.step - b.step);

      if (!slug) { setState({ status: "no-page", contents, locale: index.locale }); return; }

      for (const candidate of asked ? [asked, fallback] : [fallback]) {
        if (!candidate) continue;
        const page = candidate.pages.find((p) => p.slug === slug);
        if (!page) continue;
        const response = await fetch(`${MANUAL_ROOT}/${candidate.locale}/${slug}.html`)
          .catch(() => null);
        if (!live) return;
        if (!response?.ok) continue;
        const html = articleOf(await response.text(), candidate.locale);
        if (!live) return;
        if (html === null) continue;
        setState({
          status: "page",
          fellBack: candidate.locale !== locale,
          page: {
            title: page.title,
            sections: page.sections,
            html,
            locale: candidate.locale,
            contents: candidate.pages
              .map(({ slug: s, title, step }) => ({ slug: s, title, step }))
              .sort((a, b) => a.step - b.step),
          },
        });
        return;
      }
      setState({ status: "no-page", contents, locale: index.locale });
    })();

    return () => { live = false; };
  }, [route, locale, chosen]);

  return state;
}
