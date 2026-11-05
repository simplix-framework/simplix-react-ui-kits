import { useEffect, type RefObject } from "react";

/** The parts of an element the question's focus reads: whether it holds another, and taking the focus. */
export interface FocusNode {
  contains(other: unknown): boolean;
  focus(): void;
}

/** The parts of the document the question's focus reads. */
export interface FocusDocument {
  readonly activeElement: unknown;
  readonly body: unknown;
}

/** Whether a value is an element that can take the focus back and is still on the page. */
function isOpener(value: unknown): value is { focus(): void; readonly isConnected: boolean } {
  return typeof value === "object" && value !== null && typeof (value as { focus?: unknown }).focus === "function" && "isConnected" in value;
}

/**
 * Moves the focus into a question that just opened, and returns what gives it back when the question
 * closes.
 *
 * <p>The question takes the focus unless the focus is already inside it (a question drawn inside
 * another, such as a typed confirmation on a question's card, which took it first). On closing, the
 * focus goes back to the control that held it before the question opened, only where the closing
 * question would otherwise drop it (to the document or with the question itself) and only while that
 * control is still on the page; a focus the reader moved elsewhere stays where they put it. A page that
 * replaced the opener while asking hands the dropped focus on itself (the account section's heading).
 *
 * @param node the question's root, which takes the focus (a `tabIndex` of -1, never a Tab stop)
 * @param doc the document the question is drawn in
 * @returns the function that gives the focus back, to run when the question closes
 */
export function takeQuestionFocus(node: FocusNode, doc: FocusDocument): () => void {
  if (node.contains(doc.activeElement)) return () => undefined;
  const opener = doc.activeElement !== doc.body && isOpener(doc.activeElement) ? doc.activeElement : null;
  node.focus();
  return () => {
    const lost = doc.activeElement === null || doc.activeElement === doc.body || node.contains(doc.activeElement);
    if (lost && opener !== null && opener.isConnected) opener.focus();
  };
}

/**
 * {@link takeQuestionFocus} for a question part: the focus moves into `root` when the part mounts and
 * comes back to its opener when it unmounts.
 */
export function useQuestionFocus(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const node = root.current;
    if (node === null) return;
    return takeQuestionFocus(node, node.ownerDocument);
  }, [root]);
}

/** The parts of a question's root its naming reads and writes. */
export interface LabelNode {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  querySelector(selector: string): { id: string } | null;
}

/**
 * Names a question that takes the focus by its own first heading, so a screen reader announces the
 * question and not a bare "group" when the focus moves in. A root named already is left alone, and a
 * heading without an id is given `id`.
 */
export function nameByFirstHeading(node: LabelNode, id: string): void {
  if (node.getAttribute("aria-labelledby") || node.getAttribute("aria-label")) return;
  const heading = node.querySelector("h1, h2, h3, h4, h5, h6");
  if (heading === null) return;
  if (!heading.id) heading.id = id;
  node.setAttribute("aria-labelledby", heading.id);
}
