/**
 * What {@link SettingsTile} refuses, held open so it goes on refusing it.
 *
 * <p><b>This file compiles and never runs.</b> Every `@ts-expect-error` below is a shape the type
 * has to reject; the day one of them starts compiling, `tsc` reports the directive as unused and
 * the package's typecheck fails. So the contract is proved in both directions on every build — the
 * broken forms stay broken and the fixed forms stay fixed — which is the property a sentence in a
 * doc comment cannot have.
 *
 * <p>It sits beside the type rather than in a test folder because it is not a test of behaviour:
 * nothing here is executed, and the compiler is the whole assertion.
 */
import type { SettingsTile } from "./settings-tiles";

/** The shape every case below starts from — everything a tile carries except the answer. */
const figure = { key: "someKey", label: "어떤 값", value: 12, basis: "무엇을 셌는지" } as const;

// ── What the type refuses ────────────────────────────────────────────────────────────────────

/** A tile that never says whether its figure was counted. This was the whole console. */
// @ts-expect-error `counted` is missing
export const saysNothing: SettingsTile = { ...figure };

/** A count of rows with no answer to 「그 목록은 어디에 있는가」. */
// @ts-expect-error a counted tile owes `href` or `listUnbuilt`
export const countedGoingNowhere: SettingsTile = { ...figure, counted: true };

/** A computed figure dressed as a link — a rate has no rows to open. */
// @ts-expect-error a computed tile has no destination
export const computedWithADestination: SettingsTile = { ...figure, counted: false, href: "/x" };

/** A computed figure claiming a list is being built for it. */
// @ts-expect-error a computed tile has no list to be unbuilt
export const computedWithAnUnbuiltList: SettingsTile = { ...figure, counted: false, listUnbuilt: true };

/** Both answers at once, which are contradictory: the list is either there or it is not. */
// @ts-expect-error `href` and `listUnbuilt` are the two halves of one answer
export const bothAnswers: SettingsTile = { ...figure, counted: true, href: "/x", listUnbuilt: true };

// ── What the type accepts ────────────────────────────────────────────────────────────────────

/** Counted, and here is the list. */
export const counted: SettingsTile = { ...figure, counted: true, href: "/audit/log?window=today" };

/** Counted, and the screen listing these rows is not built yet. */
export const listNotBuiltYet: SettingsTile = { ...figure, counted: true, listUnbuilt: true };

/** A rate, a duration, a date or a word — nothing was counted, so nothing is owed. */
export const computed: SettingsTile = { ...figure, value: "87%", counted: false };
