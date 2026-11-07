import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteCheckbox } from "./choices";

describe("SiteCheckbox field", () => {
  it("posts its field while checked, as a native box posts rememberMe=on", () => {
    const html = renderToStaticMarkup(<SiteCheckbox checked onCheckedChange={() => {}} label="Remember me" field={{ name: "rememberMe", value: "on" }} />);
    expect(html).toMatch(/<input type="hidden" name="rememberMe" value="on"\/?>/);
  });

  it("posts nothing while unchecked, and nothing without a field", () => {
    expect(renderToStaticMarkup(<SiteCheckbox checked={false} onCheckedChange={() => {}} label="Remember me" field={{ name: "rememberMe", value: "on" }} />)).not.toContain("rememberMe");
    expect(renderToStaticMarkup(<SiteCheckbox checked onCheckedChange={() => {}} label="Remember me" />)).not.toContain('type="hidden"');
  });

  it("posts its field from a box with no words beside it too", () => {
    expect(renderToStaticMarkup(<SiteCheckbox checked onCheckedChange={() => {}} name="Terms" field={{ name: "termsAccepted", value: "on" }} />)).toContain('name="termsAccepted"');
  });
});
