import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tagsOf, unmarked } from "../testing/markup";
import { AuthAlert, AuthCard, AuthDoneMark, AuthFieldHead, AuthForm, AuthLink, AuthLinks, AuthOr, AuthPage, AuthProviders, AuthText, PasswordRules, PasswordStrength, submitAuthForm } from "./auth";

describe("AuthPage and AuthCard", () => {
  it("draws the step as the page, its card headed by the mark and the one h1", () => {
    const html = renderToStaticMarkup(
      <AuthPage step="signIn">
        <AuthCard title="Sign in" mark={<svg data-slot="glyph" />}>
          <AuthText size="body">Welcome back</AuthText>
        </AuthCard>
      </AuthPage>,
    );
    const root = bySlot(html, "site-auth")[0];
    expect(root?.attributes["data-page"]).toBe("signIn");
    expect(root?.attributes["data-band"]).toBeUndefined();
    expect(bySlot(html, "site-auth-title")[0]?.name).toBe("h1");
    expect(bySlot(html, "site-auth-card")[0]?.attributes["aria-label"]).toBe("Sign in");
    expect(unmarked(html)).toEqual([]);
  });

  it("takes the dark values on a dark scheme", () => {
    const html = renderToStaticMarkup(
      <AuthPage step="code" scheme="dark">
        <AuthCard title="Code">x</AuthCard>
      </AuthPage>,
    );
    expect(bySlot(html, "site-auth")[0]?.attributes["data-band"]).toBe("dark");
  });
});

describe("the card's parts", () => {
  it("sets a form's fields apart, and a passkey form that is only its submit not at all", () => {
    expect(bySlot(renderToStaticMarkup(<AuthForm>x</AuthForm>), "site-auth-form")[0]?.attributes["data-gap"]).toBe("fields");
    const passkey = bySlot(renderToStaticMarkup(<AuthForm gap="none">x</AuthForm>), "site-auth-form")[0];
    expect(passkey?.attributes["data-gap"]).toBe("none");
    expect(passkey?.attributes.novalidate ?? passkey?.attributes.noValidate).toBeDefined();
  });

  it("hands a step's values to the step, and lets the browser post a server page's form", () => {
    let prevented = 0;
    let handed = 0;
    const event = { preventDefault: () => (prevented += 1) };
    submitAuthForm(event, undefined, () => (handed += 1));
    expect([prevented, handed]).toEqual([1, 1]);
    submitAuthForm(event, "https://id.example/login-actions/authenticate", () => (handed += 1));
    expect([prevented, handed]).toEqual([1, 2]);
    submitAuthForm(event, "https://id.example/login-actions/authenticate", undefined);
    expect(prevented).toBe(1);
  });

  it("names the address, the method and the id of a posted form, and none on a step's own form", () => {
    const posted = bySlot(renderToStaticMarkup(<AuthForm action="/act" id="kc-form-login">x</AuthForm>), "site-auth-form")[0];
    expect(posted?.attributes.action).toBe("/act");
    expect(posted?.attributes.method).toBe("post");
    expect(posted?.attributes.id).toBe("kc-form-login");
    const own = bySlot(renderToStaticMarkup(<AuthForm>x</AuthForm>), "site-auth-form")[0];
    expect(own?.attributes.action).toBeUndefined();
    expect(own?.attributes.method).toBeUndefined();
  });

  it("speaks a wrong value at once and a status only on request", () => {
    expect(bySlot(renderToStaticMarkup(<AuthAlert>Wrong password</AuthAlert>), "site-auth-alert")[0]?.attributes.role).toBe("alert");
    expect(bySlot(renderToStaticMarkup(<AuthText live>Signed in</AuthText>), "site-auth-text")[0]?.attributes.role).toBe("status");
    expect(bySlot(renderToStaticMarkup(<AuthText>Fine print</AuthText>), "site-auth-text")[0]?.attributes.role).toBeUndefined();
  });

  it("fills the strength bars up to the score and names the strength", () => {
    const html = renderToStaticMarkup(<PasswordStrength score={2} label="Password strength 2 of 3" />);
    expect(bySlot(html, "site-password-step").map((tag) => tag.attributes["data-on"])).toEqual(["true", "true", "false"]);
    expect(bySlot(html, "site-password-strength")[0]?.attributes["aria-label"]).toBe("Password strength 2 of 3");
    expect(unmarked(html)).toEqual([]);
  });

  it("ticks a met rule and tells a screen reader it is met", () => {
    const html = renderToStaticMarkup(
      <PasswordRules
        mark={<svg data-slot="glyph" />}
        metLabel="met"
        rules={[
          { key: "length", label: "At least 10 characters", met: true },
          { key: "mix", label: "Letters and numbers", met: false },
        ]}
      />,
    );
    expect(bySlot(html, "site-password-rule").map((tag) => tag.attributes["data-met"])).toEqual(["true", "false"]);
    expect(bySlot(html, "site-password-met")).toHaveLength(1);
    expect(bySlot(html, "site-password-rules")[0]?.attributes["aria-live"]).toBe("polite");
    expect(bySlot(html, "glyph")).toHaveLength(1);
  });

  it("marks every element of the other parts", () => {
    const html = renderToStaticMarkup(
      <>
        <AuthProviders>
          <a data-slot="site-action" href="/google">Google</a>
        </AuthProviders>
        <AuthOr label="or" />
        <AuthFieldHead title="Enter the code" hint="It changes every 30 seconds" />
        <AuthLinks layout="inline">
          <a data-slot="site-text-action" href="/resend">Resend</a>
        </AuthLinks>
        <AuthLink>
          <a data-slot="site-text-action" href="/back">Back</a>
        </AuthLink>
        <AuthDoneMark>
          <svg data-slot="glyph" />
        </AuthDoneMark>
      </>,
    );
    expect(unmarked(html)).toEqual([]);
    expect(bySlot(html, "site-auth-or-line")).toHaveLength(2);
    expect(bySlot(html, "site-auth-done")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(tagsOf(html).filter((tag) => tag.attributes["data-layout"] === "inline")).toHaveLength(1);
  });
});
