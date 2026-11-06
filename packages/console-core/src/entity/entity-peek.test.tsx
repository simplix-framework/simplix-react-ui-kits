import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { entityPageHref, entityPeek } from "./entity-peek";

function Detail(props: Record<string, string>) {
  return <span>{props.creditAccountId}</span>;
}

describe("the entity peek", () => {
  it("goes to the entity's list with the record opened", () => {
    expect(entityPageHref("/credit-accounts", "a/b c")).toBe("/credit-accounts?id=a%2Fb%20c");
  });

  it("hands the peek the entity's own detail, the target and the dialog state", () => {
    const spec = { detail: Detail, idProp: "creditAccountId", route: "/credit-accounts" };
    const onOpenChange = () => undefined;
    const node = entityPeek(spec)({ id: "ca-1", name: "Studio" }, { open: true, onOpenChange });
    expect(isValidElement(node)).toBe(true);
    const props = (node as { props: Record<string, unknown> }).props;
    expect(props.spec).toBe(spec);
    expect(props.target).toEqual({ id: "ca-1", name: "Studio" });
    expect(props.open).toBe(true);
    expect(props.onOpenChange).toBe(onOpenChange);
  });
});
