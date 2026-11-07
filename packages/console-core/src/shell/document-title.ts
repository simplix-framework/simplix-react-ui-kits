import { useEffect } from "react";

/**
 * The title the document had before any page named itself: the title its HTML gives, which is the
 * product's own. Read once, so a title this module wrote is never mistaken for the product's.
 */
let productTitle: string | undefined;

/**
 * The document title for a page: its heading followed by the product's title (`Users - Back Office`),
 * or the product's title alone where the page has no heading or the heading is the product's title.
 *
 * @param product the title the document had before any page named itself
 * @param heading the page header's title, or `undefined` while the page publishes none
 */
export function documentTitleOf(product: string, heading: string | undefined): string {
  const name = heading?.trim() ?? "";
  if (name === "" || name === product) return product;
  return product === "" ? name : `${name} - ${product}`;
}

/**
 * Keeps the tab, the bookmark and the history entry named after the page the console is showing:
 * the page header's title is what a screen publishes, so the document title follows it instead of
 * staying on the product's name for every route. The product's title comes back when the header
 * has none, or goes away.
 *
 * @param heading the page header's title
 */
export function useDocumentTitle(heading: string | undefined): void {
  useEffect(() => {
    productTitle ??= document.title;
    const product = productTitle;
    const next = documentTitleOf(product, heading);
    if (document.title !== next) document.title = next;
    return () => {
      if (document.title !== product) document.title = product;
    };
  }, [heading]);
}
