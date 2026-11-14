import { describe, expect, it } from "vitest";

import { siteErrorKind, siteErrorView, type SiteErrorEvent, type SiteErrorsCopy } from "./errors";
import { siteErrorReasonStyle } from "./errors.style";

const copy: SiteErrorsCopy = {
  titles: { validation: "Check what you entered", auth: "Not allowed", client: "Not sent", server: "Something went wrong", network: "No connection", unknown: "Something went wrong", gateway: "Service unavailable" },
  unavailable: "The service is not answering. Try again in a moment.",
  fallback: "The request could not be finished.",
  close: "Close",
  closeAll: (count) => `Close all (${count})`,
};

const event = (over: Partial<SiteErrorEvent>): SiteErrorEvent => ({ category: "server", message: "", raw: undefined, ...over });

describe("siteErrorView", () => {
  it("says nothing while no failure waits", () => {
    expect(siteErrorView([], copy)).toBeUndefined();
  });

  it("titles the first failure by its kind and leads with the server's own sentence", () => {
    expect(siteErrorView([event({ category: "client", status: 409, message: "The plan is already yours" })], copy)).toEqual({
      title: "Not sent",
      description: "The plan is already yours",
      fields: [],
    });
  });

  it("names each field's reason a rejected request carries", () => {
    const view = siteErrorView([event({ category: "validation", message: "Check the form", validationErrors: [{ field: "email", message: "Enter an email address" }] })], copy);
    expect(view?.fields).toEqual(["Enter an email address"]);
  });

  it("tells a server that is not answering calmly, never with the bare status it sent", () => {
    const view = siteErrorView([event({ status: 503, message: "HTTP 503", validationErrors: [{ field: "x", message: "y" }] })], copy);
    expect(view).toEqual({ title: "Service unavailable", description: copy.unavailable, fields: [] });
    expect(siteErrorKind(event({ status: 500 }))).toBe("server");
  });

  it("falls back to the product's sentence for a failure without one, and offers to close them all when more wait", () => {
    const view = siteErrorView([event({}), event({ message: "Second" })], copy);
    expect(view?.description).toBe(copy.fallback);
    expect(view?.closeAll).toBe("Close all (2)");
  });

  it("draws each field reason as a list item", () => {
    expect(siteErrorReasonStyle.base).toContain("list-disc");
  });
});
