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
  /** Finds the control the page drew in the question's place, by its `id`. */
  getElementById?(id: string): { focus(): void } | null;
}

/** The elements holding a focus that a part of the page dropped, until the focus leaves them. */
const holdingDropped = new WeakSet<object>();

/** The parts of an element that holds a dropped focus. */
export interface DroppedFocusHolder {
  focus(): void;
  addEventListener(type: "blur", listener: () => void, options: { once: true }): void;
}

/**
 * Gives a focus that a part of the page dropped to a stand-in (the account section's heading), marked as
 * held for somebody else: a question closing after the stand-in took it still hands it on to the control
 * it names ({@link takeQuestionFocus}), whichever of the two ran first. The mark ends when the focus
 * leaves the stand-in.
 */
export function holdDroppedFocus(target: DroppedFocusHolder): void {
  target.focus();
  holdingDropped.add(target);
  target.addEventListener("blur", () => holdingDropped.delete(target), { once: true });
}

/** Whether a value is a stand-in holding a dropped focus ({@link holdDroppedFocus}). */
function holdsDroppedFocus(value: unknown): boolean {
  return typeof value === "object" && value !== null && holdingDropped.has(value);
}

/** The opener each question root noted when it first took the focus. */
const taken = new WeakMap<object, { readonly opener: { focus(): void; readonly isConnected: boolean } | null }>();

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
 * control is still on the page; a focus the reader moved elsewhere stays where they put it.
 *
 * <p>A question drawn in place of the control that opened it removes that control as it opens, so the
 * opener is gone by the time the question could note it. The page names the control it draws again in
 * the question's place (`returnTo`, the control's element `id`), and a dropped focus goes there when
 * the question closes. Where neither is on the page, the account section's heading takes it.
 *
 * @param node the question's root, which takes the focus (a `tabIndex` of -1, never a Tab stop)
 * @param doc the document the question is drawn in
 * @param returnTo the element `id` of the control drawn in the question's place once it closes
 * @returns the function that gives the focus back, to run when the question closes
 */
export function takeQuestionFocus(node: FocusNode, doc: FocusDocument, returnTo?: string): () => void {
  // The same question mounted again (React runs a development mount twice) keeps the opener it noted
  // first, so the focus it already holds is not read as a question inside it having taken it.
  const earlier = taken.get(node);
  if (earlier === undefined && node.contains(doc.activeElement)) return () => undefined;
  const opener = earlier !== undefined ? earlier.opener : doc.activeElement !== doc.body && isOpener(doc.activeElement) ? doc.activeElement : null;
  taken.set(node, { opener });
  if (!node.contains(doc.activeElement)) node.focus();
  return () => {
    // A stand-in that took the dropped focus first holds it for this question to hand on.
    const lost = doc.activeElement === null || doc.activeElement === doc.body || node.contains(doc.activeElement) || holdsDroppedFocus(doc.activeElement);
    if (!lost) return;
    if (opener !== null && opener.isConnected) {
      opener.focus();
      return;
    }
    if (returnTo !== undefined) doc.getElementById?.(returnTo)?.focus();
  };
}

/**
 * {@link takeQuestionFocus} for a question part: the focus moves into `root` when the part mounts and
 * comes back to its opener, or to the control `returnTo` names, when it unmounts.
 */
export function useQuestionFocus(root: RefObject<HTMLElement | null>, returnTo?: string): void {
  useEffect(() => {
    const node = root.current;
    if (node === null) return;
    return takeQuestionFocus(node, node.ownerDocument, returnTo);
  }, [root, returnTo]);
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
