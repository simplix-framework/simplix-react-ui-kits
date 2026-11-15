import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { applyEdit, createHistory, type ProcessDefinition } from "@simplix-react/process-core";
import type { ProcessEditing } from "@simplix-react/process/edit";
import { TooltipProvider, UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { PhoneTurns } from "./phone-turn";
import { ProcedureSettings, type ProcedureSettingsProps } from "./procedure-settings";

const published: ProcessDefinition = {
  format: "simplix-process",
  version: 1,
  id: "review",
  name: "Review",
  lanes: [{ id: "author", label: "Author" }, { id: "reviewer", label: "Reviewer" }],
  sections: [{ id: "main", label: "Main", steps: [{ id: "draft", label: "Draft", acts: [{ id: "write", lanes: ["author"], kind: "do", label: "Write" }] }, { id: "check", label: "Check", acts: [{ id: "read", lanes: ["reviewer"], kind: "check", label: "Read" }] }] }],
  jumps: [],
};

/** A session standing at a definition, as the hook hands one out, for a screen drawn once. */
function sessionAt(definition: ProcessDefinition): ProcessEditing {
  const history = createHistory(definition);
  return { definition: history.present, initial: published, apply: (operation) => applyEdit(definition, operation), undo: () => {}, redo: () => {}, canUndo: false, canRedo: false, refusal: null, consequences: [], reset: () => {} };
}

function drawn(props: Partial<ProcedureSettingsProps>): string {
  const all: ProcedureSettingsProps = { label: "Procedures", procedures: [{ key: "review", label: "Review" }], selected: "review", onSelect: () => {}, editing: sessionAt(published), versions: [{ key: "v1", label: "v1", definition: published }], empty: { title: "Choose one" }, ...props };
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(TooltipProvider, { children: createElement(ProcedureSettings, all) }) }));
}

const changed = (): ProcessDefinition => {
  const result = applyEdit(published, { type: "update-step", id: "draft", patch: { label: "Write the draft" } });
  if (!result.ok) throw new Error("not applied");
  return result.definition;
};

describe("ProcedureSettings", () => {
  it("says whether the procedure differs from the version in force", () => {
    expect(drawn({ onPublish: () => {} })).toContain('data-procedure-changed="false"');
    expect(drawn({ onPublish: () => {}, editing: sessionAt(changed()) })).toContain('data-procedure-changed="true"');
  });

  it("offers the check before publishing only to a reader who may publish", () => {
    expect(drawn({ onPublish: () => {} })).toContain('data-procedure-tab="check"');
    const read = drawn({});
    expect(read).not.toContain('data-procedure-tab="check"');
    expect(read).not.toContain("data-procedure-changed");
    expect(read).not.toContain("data-process-editor");
  });

  it("publishes only a changed procedure without problems", () => {
    // The button that publishes is the only primary verb of the tab: whether it is drawn disabled.
    const publish = (html: string): boolean => { const button = html.match(/<button[^>]*>(?:(?!<\/button>).)*publish(?:(?!<\/button>).)*<\/button>/s)?.[0] ?? ""; if (button === "") throw new Error("no publish button"); return /\sdisabled=""|aria-disabled="true"/.test(button); };
    const check = (props: Partial<ProcedureSettingsProps>): string => drawn({ onPublish: () => {}, defaultTab: "check", ...props });
    expect(publish(check({}))).toBe(true);
    expect(publish(check({ editing: sessionAt(changed()) }))).toBe(false);
    expect(publish(check({ editing: sessionAt(changed()), problems: [{ subject: "write", message: "No screen offers this act" }] }))).toBe(true);
  });

  it("draws nothing under the choices while none is chosen", () => {
    const html = drawn({ selected: undefined });
    expect(html).toContain("Choose one");
    expect(html).not.toContain("data-procedure-tab");
  });
});

describe("PhoneTurns", () => {
  const item = (key: string) => ({ key, kind: "Review", title: `Work ${key}`, turn: { state: "mine" as const, label: "Write" }, procedure: { definition: published } });
  const phone = (items: ReturnType<typeof item>[], defaultItem?: string): string =>
    renderToStaticMarkup(createElement(UIProvider, { children: createElement(PhoneTurns, { shell: { title: "My turn", tabs: [], activeTab: "" }, items, defaultItem, empty: { title: "Nothing is at your turn" } }) }));

  it("shows one piece of work and which of how many it is", () => {
    const html = phone([item("a"), item("b")], "b");
    expect(html).toContain('data-phone-turn="b"');
    expect(html).not.toContain('data-phone-turn="a"');
  });

  it("says so when nothing is at the reader's turn", () => {
    expect(phone([])).toContain("Nothing is at your turn");
  });
});
