import { describe, expect, it } from "vitest";

import { confirmBusy, confirmStep, type ConfirmEvent, type ConfirmState } from "./action-confirm";

interface Row {
  readonly id: string;
}

const closed: ConfirmState<Row> = { phase: "asking", target: null };
const run = (events: readonly ConfirmEvent<Row>[], from: ConfirmState<Row> = closed) => events.reduce(confirmStep<Row>, from);
const asked = run([{ type: "request", target: { id: "a" } }]);

describe("confirmStep: a verb followed by running", () => {
  it("stays open on the running label through the tick before the mutation reports itself running", () => {
    const sent = run([{ type: "sent", follows: "running", running: false }], asked);
    expect(sent.target).toEqual({ id: "a" });
    expect(confirmBusy(sent, false)).toBe(true);
    // The false read before the mutation reports pending is not the end of it.
    expect(run([{ type: "running", running: false }], sent).target).toEqual({ id: "a" });
  });

  it("stays open while it runs and closes when it settles", () => {
    const running = run([{ type: "sent", follows: "running", running: false }, { type: "running", running: true }], asked);
    expect(running.target).toEqual({ id: "a" });
    expect(confirmBusy(running, true)).toBe(true);
    expect(run([{ type: "running", running: false }], running)).toEqual(closed);
  });

  it("refuses Escape, another request and a second send while it runs", () => {
    const running = run([{ type: "sent", follows: "running" }, { type: "running", running: true }], asked);
    expect(run([{ type: "dismiss" }], running)).toBe(running);
    expect(run([{ type: "request", target: { id: "b" } }], running)).toBe(running);
    expect(run([{ type: "sent", follows: "running" }], running)).toBe(running);
  });

  it("lets Escape out of a verb that never started, which may have refused before calling anything", () => {
    const sent = run([{ type: "sent", follows: "running", running: false }], asked);
    expect(run([{ type: "dismiss" }], sent)).toEqual(closed);
  });

  it("counts a run already in flight at the press as started", () => {
    const sent = run([{ type: "sent", follows: "running", running: true }], asked);
    expect(run([{ type: "running", running: false }], sent)).toEqual(closed);
  });
});

describe("confirmStep: a verb returning its promise", () => {
  it("stays open until the promise settles, whatever running says", () => {
    const sent = run([{ type: "sent", follows: "promise" }], asked);
    expect(run([{ type: "running", running: true }, { type: "running", running: false }], sent).target).toEqual({ id: "a" });
    expect(run([{ type: "settled" }], sent)).toEqual(closed);
    expect(run([{ type: "dismiss" }], sent)).toBe(sent);
  });
});

describe("confirmStep: a verb whose promise the server refused", () => {
  const sent = run([{ type: "sent", follows: "promise" }], asked);

  it("returns to asking on the same record with the refusal held, so the dialog stays open", () => {
    const refused = run([{ type: "refused", message: "The voice is in use" }], sent);
    expect(refused).toEqual({ phase: "asking", target: { id: "a" }, refusal: "The voice is in use" });
    expect(confirmBusy(refused, undefined)).toBe(false);
  });

  it("lets the reader press again, and drops the refusal while the second press runs", () => {
    const refused = run([{ type: "refused", message: "The voice is in use" }], sent);
    const again = run([{ type: "sent", follows: "promise" }], refused);
    expect(again).toEqual({ phase: "waiting", target: { id: "a" }, follows: "promise", started: false });
    expect(run([{ type: "settled" }], again)).toEqual(closed);
  });

  it("lets the reader dismiss it, and forgets the refusal for the next record asked about", () => {
    const refused = run([{ type: "refused", message: "The voice is in use" }], sent);
    expect(run([{ type: "dismiss" }], refused)).toEqual(closed);
    expect(run([{ type: "request", target: { id: "b" } }], refused)).toEqual({ phase: "asking", target: { id: "b" } });
  });

  it("is read only for a promise: a verb followed by running or asked about has no refusal to hold", () => {
    expect(run([{ type: "refused", message: "x" }], asked)).toBe(asked);
    const running = run([{ type: "sent", follows: "running" }], asked);
    expect(run([{ type: "refused", message: "x" }], running)).toBe(running);
  });
});

describe("confirmStep: a verb with nothing to follow", () => {
  it("closes at once, as a synchronous verb has already happened", () => {
    expect(run([{ type: "sent", follows: "nothing" }], asked)).toEqual(closed);
  });
});

describe("confirmStep: asking", () => {
  it("opens on a request and closes on a dismissal without running anything", () => {
    expect(asked.target).toEqual({ id: "a" });
    expect(confirmBusy(asked, undefined)).toBe(false);
    expect(run([{ type: "dismiss" }], asked)).toEqual(closed);
  });

  it("sends nothing while no record is held", () => {
    expect(run([{ type: "sent", follows: "running" }])).toEqual(closed);
  });
});
