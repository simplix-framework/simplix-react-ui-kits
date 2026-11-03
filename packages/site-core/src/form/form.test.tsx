import { renderToStaticMarkup } from "react-dom/server";
import { Dialog } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { bySlot, silentRefusals, tabStops, tagsOf, unmarked } from "../testing/markup";
import { RadioCards, SiteCheckbox, SiteSwitch } from "./choices";
import { CodeField } from "./code-field";
import { ConfirmByTyping, typedConfirms } from "./confirm-by-typing";
import { SiteDialogFrame } from "./dialog";
import { FieldNote, FormField, SiteInput, SiteTextarea } from "./fields";
import { radioKeyTarget, radioTabStop } from "./radio-keys";
import { SiteSelect } from "./select";
import { SiteToastList } from "./toasts";

const byPart = (html: string, part: string) => tagsOf(html).filter((tag) => tag.attributes["data-part"] === part);
// A framework part draws its own glyph and, for a form, a hidden native control beside it.
const frameworkOwned = (html: string) =>
  new Set(tagsOf(html).filter((tag) => tag.name === "svg" || (["input", "select", "option"].includes(tag.name) && (tag.attributes["aria-hidden"] === "true" || tag.attributes.value === ""))).map((tag) => `<${tag.name}>`));
const ownUnmarked = (html: string) => unmarked(html).filter((tag) => !frameworkOwned(html).has(tag));

describe("fields", () => {
  it("draws a field's name over its control, muted on request, with a note under it", () => {
    const html = renderToStaticMarkup(
      <FormField label="Email" muted>
        <SiteInput value="a@b.c" readOnly />
        <FieldNote tone="bad">Enter an email address</FieldNote>
      </FormField>,
    );
    const field = bySlot(html, "site-field")[0];
    expect(field?.name).toBe("label");
    expect(field?.attributes["data-muted"]).toBe("true");
    expect(bySlot(html, "site-field-note")[0]?.attributes["data-tone"]).toBe("bad");
    expect(bySlot(html, "site-field-note")[0]?.name).toBe("small");
    expect(ownUnmarked(html)).toEqual([]);
  });

  it("draws a text input at the control height by default and reports a refused value", () => {
    const plain = bySlot(renderToStaticMarkup(<SiteInput value="" readOnly />), "site-input")[0];
    expect(plain?.attributes["data-size"]).toBe("md");
    expect(plain?.attributes.type).toBe("text");
    expect(plain?.attributes["aria-invalid"]).toBeUndefined();
    const refused = bySlot(renderToStaticMarkup(<SiteInput value="x" readOnly invalid size="sm" />), "site-input")[0];
    expect(refused?.attributes["aria-invalid"]).toBe("true");
    expect(refused?.attributes["data-size"]).toBe("sm");
    expect(bySlot(renderToStaticMarkup(<SiteTextarea value="" readOnly />), "site-textarea")).toHaveLength(1);
  });
});

describe("choices", () => {
  it("draws the framework checkbox as a site part inside a label, the badge for the eye only", () => {
    const html = renderToStaticMarkup(<SiteCheckbox checked onCheckedChange={() => {}} label="I agree to the terms" required badge="Required" />);
    const box = byPart(html, "site-checkbox")[0];
    expect(box?.name).toBe("button");
    expect(box?.attributes.role).toBe("checkbox");
    expect(box?.attributes["data-state"]).toBe("checked");
    expect(box?.attributes["aria-required"]).toBe("true");
    expect(bySlot(html, "site-checkbox-row")[0]?.name).toBe("label");
    expect(bySlot(html, "site-checkbox-badge")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(ownUnmarked(html)).toEqual([]);
  });

  it("names a checkbox without words by its name", () => {
    const html = renderToStaticMarkup(<SiteCheckbox checked={false} onCheckedChange={() => {}} name="Select all" />);
    expect(byPart(html, "site-checkbox")[0]?.attributes["aria-label"]).toBe("Select all");
    expect(bySlot(html, "site-checkbox-row")).toHaveLength(0);
  });

  it("names the line that says why a disabled checkbox cannot be changed", () => {
    const html = renderToStaticMarkup(<SiteCheckbox checked={false} onCheckedChange={() => {}} label="Attach the record" disabled describedBy="why" />);
    expect(byPart(html, "site-checkbox")[0]?.attributes["aria-describedby"]).toBe("why");
    expect(byPart(renderToStaticMarkup(<SiteCheckbox checked={false} onCheckedChange={() => {}} label="Attach" />), "site-checkbox")[0]?.attributes["aria-describedby"]).toBeUndefined();
  });

  it("draws the framework switch as a site part", () => {
    const html = renderToStaticMarkup(<SiteSwitch checked onCheckedChange={() => {}} label="Marketing mail" />);
    const control = byPart(html, "site-toggle")[0];
    expect(control?.attributes.role).toBe("switch");
    expect(control?.attributes["data-state"]).toBe("checked");
    expect(bySlot(html, "site-toggle-row")[0]?.name).toBe("label");
  });

  it("makes a radio group one tab stop on the chosen card, or on the first open one when none is", () => {
    const options = [
      { value: "a", title: "A", body: "first", disabled: true },
      { value: "b", title: "B" },
      { value: "c", title: "C" },
    ] as const;
    const chosen = renderToStaticMarkup(<RadioCards label="Plan" value="c" options={options} onValueChange={() => {}} />);
    expect(tabStops(chosen).map((tag) => tag.attributes["data-value"])).toEqual(["c"]);
    expect(bySlot(chosen, "site-radio-dot")).toHaveLength(1);
    const none = renderToStaticMarkup(<RadioCards label="Plan" value={null} options={options} onValueChange={() => {}} />);
    expect(tabStops(none).map((tag) => tag.attributes["data-value"])).toEqual(["b"]);
    expect(radioTabStop(options, null)).toBe("b");
    expect(ownUnmarked(chosen)).toEqual([]);
  });

  it("walks the arrows past disabled options and wraps", () => {
    const options = [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }];
    expect(radioKeyTarget(options, "a", "ArrowRight")).toBe("c");
    expect(radioKeyTarget(options, "c", "ArrowDown")).toBe("a");
    expect(radioKeyTarget(options, "a", "End")).toBe("c");
    expect(radioKeyTarget(options, "a", "Enter")).toBeNull();
  });
});

describe("SiteSelect", () => {
  const options = [
    { value: "KR", label: "Korea" },
    { value: "US", label: "United States" },
  ] as const;

  it("draws the framework trigger as a site part showing the chosen option's words", () => {
    const html = renderToStaticMarkup(<SiteSelect label="Country" options={options} value="US" onValueChange={() => {}} block />);
    const trigger = byPart(html, "site-select")[0];
    expect(trigger?.name).toBe("button");
    expect(trigger?.attributes["aria-label"]).toBe("Country");
    expect(trigger?.attributes["data-part-block"]).toBe("true");
    expect(html).toContain("United States");
    expect(bySlot(html, "site-select-value")[0]?.attributes["data-placeholder"]).toBe("false");
  });

  it("shows the placeholder in the muted ink while nothing is chosen", () => {
    const html = renderToStaticMarkup(<SiteSelect label="Reason" placeholder="Choose one" options={options} value={null} onValueChange={() => {}} />);
    expect(html).toContain("Choose one");
    expect(bySlot(html, "site-select-value")[0]?.attributes["data-placeholder"]).toBe("true");
  });
});

describe("CodeField", () => {
  it("draws six cells marked as the site's cells, all marked refused for a refused code", () => {
    const html = renderToStaticMarkup(<CodeField label="Code" value="12" onValueChange={() => {}} invalid cellLabel={(at, of) => `${at}/${of}`} />);
    expect(byPart(html, "site-code")).toHaveLength(1);
    const cells = byPart(html, "site-code-cell");
    expect(cells).toHaveLength(6);
    expect(cells.every((cell) => cell.attributes["data-part-invalid"] === "true" && cell.attributes["aria-invalid"] === "true")).toBe(true);
    expect(cells[0]?.attributes.value).toBe("1");
    expect(cells[0]?.attributes["aria-label"]).toBe("1/6");
  });
});

describe("ConfirmByTyping", () => {
  const actions = { confirm: { id: "delete", label: "Delete", reason: "Type DELETE to delete" }, cancel: { id: "cancel", label: "Cancel" } };

  it("confirms only on the word, ignoring the space around it", () => {
    expect(typedConfirms(" DELETE ", "DELETE")).toBe(true);
    expect(typedConfirms("delete", "DELETE")).toBe(false);
    expect(typedConfirms("", "")).toBe(false);
  });

  it("keeps the deletion disabled until the word is typed, as an alert dialog on the danger ground", () => {
    const waiting = renderToStaticMarkup(<ConfirmByTyping title="Delete my voice" body="It cannot be undone." label="Type DELETE" word="DELETE" value="DEL" onValueChange={() => {}} {...actions} />);
    const root = bySlot(waiting, "site-confirm")[0];
    expect(root?.attributes.role).toBe("alertdialog");
    expect(root?.attributes["aria-label"]).toBe("Delete my voice");
    const confirm = bySlot(waiting, "site-action").find((tag) => tag.attributes["data-action"] === "delete");
    expect(confirm?.attributes.disabled).toBeDefined();
    expect(confirm?.attributes["data-tone"]).toBe("danger");
    const ready = renderToStaticMarkup(<ConfirmByTyping title="Delete my voice" label="Type DELETE" word="DELETE" value="DELETE" onValueChange={() => {}} {...actions} />);
    expect(bySlot(ready, "site-action").find((tag) => tag.attributes["data-action"] === "delete")?.attributes.disabled).toBeUndefined();
    expect(ownUnmarked(waiting)).toEqual([]);
  });

  it("describes the waiting deletion by its reason, and drops the reason once the word is typed", () => {
    const waiting = renderToStaticMarkup(<ConfirmByTyping title="Delete my voice" label="Type DELETE" word="DELETE" value="" onValueChange={() => {}} {...actions} />);
    const confirm = bySlot(waiting, "site-action").find((tag) => tag.attributes["data-action"] === "delete");
    expect(confirm?.attributes["aria-describedby"]).toBe(bySlot(waiting, "site-action-reason")[0]?.attributes.id);
    expect(waiting).toContain(">Type DELETE to delete</span>");
    expect(silentRefusals(waiting)).toEqual([]);
    const ready = renderToStaticMarkup(<ConfirmByTyping title="Delete my voice" label="Type DELETE" word="DELETE" value="DELETE" onValueChange={() => {}} {...actions} />);
    expect(bySlot(ready, "site-action-reason")).toEqual([]);
    // @ts-expect-error the deletion carries the reason it waits for
    expect(<ConfirmByTyping title="T" label="L" word="W" value="" onValueChange={() => {}} confirm={{ id: "delete", label: "Delete" }} cancel={{ id: "cancel", label: "Cancel" }} />).toBeDefined();
  });

  it("draws a plain card with its points as a list and the field's name muted", () => {
    const html = renderToStaticMarkup(
      <ConfirmByTyping tone="plain" title="Delete the account" points={[{ key: "a", text: "Voices go" }, { key: "b", text: "Receipts stay" }]} label="Type your email" word="t@example.com" value="" onValueChange={() => {}} {...actions} />,
    );
    expect(bySlot(html, "site-confirm")[0]?.attributes.role).toBeUndefined();
    expect(bySlot(html, "site-confirm-point")).toHaveLength(2);
    expect(bySlot(html, "site-field")[0]?.attributes["data-muted"]).toBe("true");
  });

  it("draws what else it asks between the points and the typed field", () => {
    const html = renderToStaticMarkup(
      <ConfirmByTyping tone="plain" title="Delete the account" points={[{ key: "a", text: "Voices go" }]} label="Type your email" word="t@example.com" value="" onValueChange={() => {}} {...actions}>
        <p data-slot="site-caption">Deleted after a waiting period</p>
        <span data-slot="site-field" data-reason="true" />
      </ConfirmByTyping>,
    );
    const order = [...html.matchAll(/data-slot="(site-confirm-body|site-caption|site-field)"/g)].map((match) => match[1]);
    expect(order).toEqual(["site-confirm-body", "site-caption", "site-field", "site-field"]);
    expect(html.indexOf("data-reason")).toBeLessThan(html.lastIndexOf('data-slot="site-field"'));
  });
});

describe("SiteDialogFrame", () => {
  it("names the dialog by the framework title and description, with a close button named for it", () => {
    const html = renderToStaticMarkup(
      <Dialog open>
        <SiteDialogFrame title="Change plan" description="Pro+ from today" close={{ name: "Close Change plan", glyph: <svg data-slot="glyph" /> }} footer={<button data-slot="site-action" type="button">Change</button>} />
      </Dialog>,
    );
    expect(byPart(html, "site-dialog-title")[0]?.name).toBe("h2");
    expect(byPart(html, "site-dialog-description")).toHaveLength(1);
    expect(bySlot(html, "site-dialog-close")[0]?.attributes["aria-label"]).toBe("Close Change plan");
    expect(bySlot(html, "site-dialog-foot")).toHaveLength(1);
  });
});

describe("SiteToastList", () => {
  it("draws each toast on one line with a dot in its tone and at most one action", () => {
    const html = renderToStaticMarkup(
      <SiteToastList
        toasts={[
          { id: "1", type: "success", message: "Plan changed" },
          { id: "2", type: "error", message: "Not sent", action: { label: "Try again", run: () => {} } },
        ]}
      />,
    );
    expect(bySlot(html, "site-toasts")[0]?.attributes.role).toBe("status");
    expect(bySlot(html, "site-toast").map((tag) => tag.attributes["data-action"])).toEqual(["false", "true"]);
    expect(bySlot(html, "site-toast-dot").map((tag) => tag.attributes["data-tone"])).toEqual(["good", "bad"]);
    expect(bySlot(html, "site-toast-action")).toHaveLength(1);
    expect(ownUnmarked(html)).toEqual([]);
  });
});
