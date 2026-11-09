/**
 * The props a route hands a generated page that takes required ones, keyed by the page's directory
 * (`<kind>-<variant>`, `default` for none, as the harness names it). A template that adds a required
 * prop fails the mount until its page is given one here.
 */
export const PAGE_PROPS = {
  "error-page-default": { mark: "!" },
  "static-page-account": { route: "/static-page-account/overview" },
  "static-page-checkout": { step: "details", main: "Main", frame: { label: "Provider", body: "Body" } },
  "static-page-checkout-done": { mark: "✔", title: "Done" },
};
