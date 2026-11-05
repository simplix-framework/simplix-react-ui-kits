import { describe, expect, it } from "vitest";

import { holdDroppedFocus, nameByFirstHeading, takeQuestionFocus } from "./question-focus";

/** An element of a fake page: it knows what it holds and records the focus it takes. */
function element(page: { activeElement: unknown }, name: string, children: unknown[] = []) {
  const self = {
    name,
    isConnected: true,
    contains: (other: unknown) => other === self || children.includes(other),
    focus: () => {
      page.activeElement = self;
    },
  };
  return self;
}

function page() {
  const doc: { activeElement: unknown; body: unknown } = { activeElement: null, body: { name: "body" } };
  doc.activeElement = doc.body;
  return doc;
}

describe("takeQuestionFocus", () => {
  it("moves the focus into the question and back to the opener when the question drops it", () => {
    const doc = page();
    const opener = element(doc, "opener");
    opener.focus();
    const field = element(doc, "field");
    const question = element(doc, "question", [field]);
    const giveBack = takeQuestionFocus(question, doc);
    expect(doc.activeElement).toBe(question);
    field.focus();
    giveBack();
    expect(doc.activeElement).toBe(opener);
  });

  it("leaves a focus the reader moved out of the question where they put it", () => {
    const doc = page();
    const opener = element(doc, "opener");
    opener.focus();
    const question = element(doc, "question");
    const giveBack = takeQuestionFocus(question, doc);
    const elsewhere = element(doc, "elsewhere");
    elsewhere.focus();
    giveBack();
    expect(doc.activeElement).toBe(elsewhere);
  });

  it("gives nothing back to an opener the page replaced while asking", () => {
    const doc = page();
    const opener = element(doc, "opener");
    opener.focus();
    const question = element(doc, "question");
    const giveBack = takeQuestionFocus(question, doc);
    opener.isConnected = false;
    doc.activeElement = doc.body;
    giveBack();
    expect(doc.activeElement).toBe(doc.body);
  });

  it("gives the dropped focus to the control the page drew again in the question's place", () => {
    const doc = page();
    const opener = element(doc, "opener");
    opener.focus();
    // The question replaces its opener as it opens, so the opener is gone before it can be noted.
    opener.isConnected = false;
    doc.activeElement = doc.body;
    const question = element(doc, "question");
    const giveBack = takeQuestionFocus(question, doc, "cancel");
    const redrawn = element(doc, "redrawn");
    const ids: Record<string, typeof redrawn> = { cancel: redrawn };
    const withIds = Object.assign(doc, { getElementById: (id: string) => ids[id] ?? null });
    withIds.activeElement = withIds.body;
    giveBack();
    expect(doc.activeElement).toBe(redrawn);
  });

  it("leaves a focus the reader moved alone even where the page names a control to return to", () => {
    const doc = Object.assign(page(), { getElementById: () => null as { focus(): void } | null });
    const redrawn = element(doc, "redrawn");
    doc.getElementById = () => redrawn;
    const question = element(doc, "question");
    const giveBack = takeQuestionFocus(question, doc, "cancel");
    const elsewhere = element(doc, "elsewhere");
    elsewhere.focus();
    giveBack();
    expect(doc.activeElement).toBe(elsewhere);
  });

  it("takes the focus back from the stand-in that caught it before the question closed", () => {
    const doc = page();
    const question = element(doc, "question");
    const redrawn = element(doc, "redrawn");
    const withIds = Object.assign(doc, { getElementById: (id: string) => (id === "cancel" ? redrawn : null) });
    const giveBack = takeQuestionFocus(question, withIds, "cancel");
    // The section's heading caught the focus the closing question dropped, before the question's cleanup ran.
    const heading = Object.assign(element(doc, "heading"), { addEventListener: () => undefined });
    holdDroppedFocus(heading);
    expect(doc.activeElement).toBe(heading);
    giveBack();
    expect(doc.activeElement).toBe(redrawn);
  });

  it("hands the focus on after a development mount ran the question twice", () => {
    const doc = page();
    const question = element(doc, "question");
    const redrawn = element(doc, "redrawn");
    let drawn = false;
    const withIds = Object.assign(doc, { getElementById: (id: string) => (drawn && id === "cancel" ? redrawn : null) });
    // Mount, the simulated unmount, and the mount again, with the focus inside the question throughout.
    takeQuestionFocus(question, withIds, "cancel")();
    const giveBack = takeQuestionFocus(question, withIds, "cancel");
    expect(doc.activeElement).toBe(question);
    drawn = true;
    doc.activeElement = doc.body;
    giveBack();
    expect(doc.activeElement).toBe(redrawn);
  });

  it("leaves a heading the reader focused on purpose alone", () => {
    const doc = page();
    const question = element(doc, "question");
    const redrawn = element(doc, "redrawn");
    const giveBack = takeQuestionFocus(question, Object.assign(doc, { getElementById: () => redrawn }), "cancel");
    const heading = element(doc, "heading");
    heading.focus();
    giveBack();
    expect(doc.activeElement).toBe(heading);
  });

  it("keeps the focus a question inside it took first", () => {
    const doc = page();
    const opener = element(doc, "opener");
    opener.focus();
    const inner = element(doc, "inner");
    const outer = element(doc, "outer", [inner]);
    // The inner question's effect runs first and takes the focus from the opener.
    const innerBack = takeQuestionFocus(inner, doc);
    const outerBack = takeQuestionFocus(outer, doc);
    expect(doc.activeElement).toBe(inner);
    outerBack();
    expect(doc.activeElement).toBe(inner);
    innerBack();
    expect(doc.activeElement).toBe(opener);
  });
});

describe("nameByFirstHeading", () => {
  function root(heading: { id: string } | null, own: Record<string, string> = {}) {
    const attributes = { ...own };
    return {
      attributes,
      getAttribute: (name: string) => attributes[name] ?? null,
      setAttribute: (name: string, value: string) => {
        attributes[name] = value;
      },
      querySelector: () => heading,
    };
  }

  it("names the question by its first heading, giving the heading an id where it has none", () => {
    const heading = { id: "" };
    const node = root(heading);
    nameByFirstHeading(node, "q1");
    expect(heading.id).toBe("q1");
    expect(node.attributes["aria-labelledby"]).toBe("q1");
    const titled = { id: "title" };
    const other = root(titled);
    nameByFirstHeading(other, "q2");
    expect(other.attributes["aria-labelledby"]).toBe("title");
  });

  it("leaves a named root and a root without a heading alone", () => {
    const named = root({ id: "" }, { "aria-label": "Cancel" });
    nameByFirstHeading(named, "q3");
    expect(named.attributes["aria-labelledby"]).toBeUndefined();
    const bare = root(null);
    nameByFirstHeading(bare, "q4");
    expect(bare.attributes["aria-labelledby"]).toBeUndefined();
  });
});
