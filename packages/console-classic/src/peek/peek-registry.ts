import type { ReactNode } from "react";

import type { PeekRenderProps } from "./peek-context";

/**
 * What a peek needs to know about the record it is opening.
 *
 * <p>An id and, where the opener already has it, the name. The name is not looked up: the row or
 * field that offered the peek was drawing it a moment ago, and handing it over means the dialog's
 * title is right on the first frame instead of after a read resolves.
 */
export interface PeekTarget {
  readonly id: string;
  readonly name?: string;
}

/** Draws one entity's peek dialog. Registered by the app, called by the host. */
export type PeekRenderer = (target: PeekTarget, props: PeekRenderProps) => ReactNode;

const renderers = new Map<string, PeekRenderer>();

/**
 * Teach the host how to open one kind of record.
 *
 * <p><b>Why this exists at all.</b> A peek dialog holds the referenced record's whole detail,
 * tabs included, and a detail component lives in its own entity's module. No module in this
 * repository depends on another — every one imports `domain-*` packages and the shared UI
 * packages and nothing else — so a grant panel in `modules/auth` cannot reach the role detail in
 * `modules/user-admin` to render it. Lifting the details into a shared package would invert
 * that: the package every module imports would import every module back.
 *
 * <p><b>So the app does the joining.</b> It is the one place that already depends on all of them.
 * Each module exports its dialog, the app registers it here at start-up, and a screen opens a
 * record by naming its kind — carrying an id and a string, not an import.
 *
 * <p><b>The cost, stated plainly.</b> `kind` becomes a contract written as a string, and a string
 * that does not match silently opens nothing at all. That failure has happened three times in this
 * repository under other names, which is why `peekKindsAreRegistered` compares the kinds registered
 * against the kinds opened and fails the build on either side being alone. **Do not add a kind
 * without it.**
 *
 * @param kind the entity's name, as screens will ask for it
 * @param render draws that entity's dialog
 */
export function registerPeek(kind: string, render: PeekRenderer): void {
  renderers.set(kind, render);
}

/**
 * The renderer for one kind, or `undefined` where nothing registered it.
 *
 * <p>The caller decides what to do with the absence. The host reports it rather than opening an
 * empty dialog, because a peek that opens onto nothing reads as a record with no content.
 *
 * @param kind the entity's name
 * @returns its renderer, or `undefined`
 */
export function peekRendererFor(kind: string): PeekRenderer | undefined {
  return renderers.get(kind);
}

/**
 * Every kind registered so far.
 *
 * <p>For diagnostics and for the message the host prints when a kind is missing — naming what IS
 * available turns 「nothing happened」 into a typo somebody can see.
 *
 * @returns the registered kinds, sorted
 */
export function registeredPeekKinds(): readonly string[] {
  return [...renderers.keys()].sort();
}
