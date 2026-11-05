import { describe, expect, it } from "vitest";

import { nameByFirstHeading, takeQuestionFocus } from "./question-focus";

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
