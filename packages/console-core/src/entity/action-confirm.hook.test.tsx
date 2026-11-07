import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

/**
 * A minimal hook runtime: the package has no DOM environment, and what is under test is the hook's
 * state across presses and renders, not the dialog's markup. Each render runs the hook again with
 * the slots of the last one; effects run after the render whose dependencies changed.
 */
const harness = vi.hoisted(() => {
  const slots: unknown[] = [];
  const effects: { deps: readonly unknown[] | undefined; run: () => void }[] = [];
  let cursor = 0;
  const changed = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) => !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  return {
    slots,
    effects,
    begin: () => {
      cursor = 0;
      effects.length = 0;
    },
    useState: <S,>(initial: S) => {
      const at = cursor++;
      if (!(at in slots)) slots[at] = initial;
      return [slots[at] as S, (next: S | ((was: S) => S)) => {
        slots[at] = typeof next === "function" ? (next as (was: S) => S)(slots[at] as S) : next;
      }] as const;
    },
    useReducer: <S, E>(reducer: (s: S, e: E) => S, initial: S) => {
      const at = cursor++;
      if (!(at in slots)) slots[at] = initial;
      return [slots[at] as S, (event: E) => {
        slots[at] = reducer(slots[at] as S, event);
      }] as const;
    },
    useRef: <V,>(initial: V) => {
      const at = cursor++;
      if (!(at in slots)) slots[at] = { current: initial };
      return slots[at] as { current: V };
    },
    useCallback: <F,>(fn: F) => {
      cursor++;
      return fn;
    },
    useEffect: (run: () => void, deps?: readonly unknown[]) => {
      const at = cursor++;
      const was = slots[at] as readonly unknown[] | undefined;
      if (!(at in slots) || changed(was, deps)) {
        slots[at] = deps;
        effects.push({ deps, run });
      }
    },
    flushEffects: () => {
      for (const effect of effects.splice(0)) effect.run();
    },
  };
});

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: harness.useState,
  useReducer: harness.useReducer,
  useRef: harness.useRef,
  useCallback: harness.useCallback,
  useEffect: harness.useEffect,
}));

const { useActionConfirm } = await import("./action-confirm");

interface DialogProps {
  readonly open: boolean;
  readonly isPending?: boolean;
  readonly onConfirm: () => void;
  readonly onOpenChange: (open: boolean) => void;
}

interface Row {
  readonly id: string;
}

function mount(config: { running?: boolean; onConfirm: (row: Row) => void | PromiseLike<unknown> }) {
  harness.slots.length = 0;
  let running = config.running;
  let hook = render();
  function render() {
    harness.begin();
    const result = useActionConfirm<Row>({
      title: "Reset",
      description: "Resets the breaker",
      confirmLabel: "Reset",
      runningLabel: "Resetting...",
      cancelLabel: "Cancel",
      running,
      onConfirm: config.onConfirm,
    });
    harness.flushEffects();
    return result;
  }
  return {
    dialog: () => (hook.dialog as ReactElement<DialogProps>).props,
    request: (row: Row) => {
      hook.request(row);
      hook = render();
    },
    rerender: (next?: boolean) => {
      running = next;
      hook = render();
      // An effect that dispatched has changed the state the dialog is drawn from.
      hook = render();
    },
  };
}

describe("useActionConfirm", () => {
  it("keeps the dialog open on the running label until the verb settles, and refuses a second press", () => {
    const onConfirm = vi.fn();
    const screen = mount({ running: false, onConfirm });
    screen.request({ id: "a" });
    expect(screen.dialog().open).toBe(true);

    screen.dialog().onConfirm();
    // The mutation reports itself running on the tick after the press.
    screen.rerender(false);
    expect(screen.dialog().open).toBe(true);
    expect(screen.dialog().isPending).toBe(true);

    screen.rerender(true);
    expect(screen.dialog().open).toBe(true);
    expect(screen.dialog().isPending).toBe(true);
    screen.dialog().onConfirm();
    screen.dialog().onOpenChange(false);
    screen.rerender(true);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.dialog().open).toBe(true);

    screen.rerender(false);
    expect(screen.dialog().open).toBe(false);
  });

  it("follows a returned promise and closes once it settles", async () => {
    let settle: () => void = () => undefined;
    const screen = mount({ onConfirm: () => new Promise<void>((resolve) => (settle = resolve)) });
    screen.request({ id: "a" });
    screen.dialog().onConfirm();
    screen.rerender(undefined);
    expect(screen.dialog().open).toBe(true);
    expect(screen.dialog().isPending).toBe(true);
    settle();
    await Promise.resolve();
    await Promise.resolve();
    screen.rerender(undefined);
    expect(screen.dialog().open).toBe(false);
  });

  it("closes at once for a verb that returns nothing and reports no running state", () => {
    const onConfirm = vi.fn();
    const screen = mount({ onConfirm });
    screen.request({ id: "a" });
    screen.dialog().onConfirm();
    screen.rerender(undefined);
    expect(onConfirm).toHaveBeenCalledWith({ id: "a" });
    expect(screen.dialog().open).toBe(false);
  });
});
