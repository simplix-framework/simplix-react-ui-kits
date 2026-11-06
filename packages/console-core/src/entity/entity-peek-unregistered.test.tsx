import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { peekRendererFor, unregisteredPeekRenderer } from "../peek";
import { UnregisteredKindPeek } from "./entity-peek";

describe("a reference whose kind nothing registered", () => {
  it("is answered by the dialog the entity module registers, naming the record", () => {
    expect(peekRendererFor("noSuchKind")).toBeUndefined();
    const render = unregisteredPeekRenderer();
    expect(render).toBeDefined();
    const onOpenChange = () => {};
    const element = render?.("noSuchKind", { id: "r1", name: "Pro" }, { open: true, onOpenChange });
    expect(isValidElement(element)).toBe(true);
    const dialog = element as ReactElement<{ target: { id: string; name?: string }; open: boolean; onOpenChange: unknown }>;
    expect(dialog.type).toBe(UnregisteredKindPeek);
    expect(dialog.props.target).toEqual({ id: "r1", name: "Pro" });
    expect(dialog.props.open).toBe(true);
    expect(dialog.props.onOpenChange).toBe(onOpenChange);
  });
});
