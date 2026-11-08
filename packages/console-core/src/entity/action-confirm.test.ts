import { describe, expect, it } from "vitest";

import { confirmDestructive, confirmSentence, refusalSentence, refusedDescription } from "./action-confirm";

interface Grant {
  readonly revoked: boolean;
}

describe("confirmSentence", () => {
  it("returns a fixed sentence whether or not a record is held", () => {
    expect(confirmSentence("Revoke", { revoked: false })).toBe("Revoke");
    expect(confirmSentence("Revoke", null)).toBe("Revoke");
  });

  it("writes a sentence from the record held, so one confirmation words both directions", () => {
    const label = (grant: Grant) => (grant.revoked ? "Reinstate" : "Revoke");
    expect(confirmSentence(label, { revoked: true })).toBe("Reinstate");
    expect(confirmSentence(label, { revoked: false })).toBe("Revoke");
  });

  it("draws nothing while no record is held, so a function is never handed null", () => {
    expect(confirmSentence(() => "never", null)).toBe("");
  });
});

describe("confirmDestructive", () => {
  it("keeps the boolean form: absent is plain, true is danger", () => {
    expect(confirmDestructive(undefined, null)).toBe(false);
    expect(confirmDestructive(true, null)).toBe(true);
    expect(confirmDestructive(false, { revoked: false })).toBe(false);
  });

  it("decides from the record held, and is plain while none is held", () => {
    const danger = (grant: Grant) => !grant.revoked;
    expect(confirmDestructive(danger, { revoked: false })).toBe(true);
    expect(confirmDestructive(danger, { revoked: true })).toBe(false);
    expect(confirmDestructive(danger, null)).toBe(false);
  });
});

describe("refusedDescription", () => {
  it("draws the question's own sentence while nothing was refused", () => {
    expect(refusedDescription("Stops new uses of this voice.", undefined, "The server did not accept this.")).toBe("Stops new uses of this voice.");
  });

  it("puts the refusal before the question, so the reader meets why nothing happened first", () => {
    expect(refusedDescription("Stops new uses of this voice.", "The voice is in use.", "The server did not accept this.")).toBe(
      "The server did not accept this. The voice is in use. Stops new uses of this voice.",
    );
  });

  it("leaves out a part that is empty", () => {
    expect(refusedDescription("", "The voice is in use.", "The server did not accept this.")).toBe("The server did not accept this. The voice is in use.");
  });
});

describe("refusalSentence", () => {
  it("reads the server's own message from a rejection", () => {
    expect(refusalSentence(new Error("The voice is in use"))).toBe("The voice is in use");
  });

  it("joins the messages of the fields the server named, when it named any, in place of its general sentence", () => {
    const named = { data: { message: "Validation failed", errorDetail: [{ field: "reason", message: "Give a reason." }, { field: "until", message: "Pick a later day." }] } };
    expect(refusalSentence(named)).toBe("Give a reason. Pick a later day.");
  });
});
