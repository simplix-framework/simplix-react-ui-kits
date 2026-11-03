import type { FormEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteAuthAlertStyle,
  siteAuthCardStyle,
  siteAuthDoneStyle,
  siteAuthFieldHeadStyle,
  siteAuthFieldHintStyle,
  siteAuthFieldTitleStyle,
  siteAuthFormStyle,
  siteAuthHeadStyle,
  siteAuthLinksStyle,
  siteAuthLinkStyle,
  siteAuthOrLineStyle,
  siteAuthOrStyle,
  siteAuthProvidersStyle,
  siteAuthStageStyle,
  siteAuthStyle,
  siteAuthTextStyle,
  siteAuthTitleStyle,
  sitePasswordMetStyle,
  sitePasswordRulesStyle,
  sitePasswordRuleStyle,
  sitePasswordStepStyle,
  sitePasswordStrengthStyle,
} from "./auth.style";

/** Props for {@link AuthPage}. */
export interface AuthPageProps {
  /** The step shown, written as the page's `data-page` so a check knows which step it reads. */
  readonly step: string;
  /** A light or dark ground: the sign-in server follows the reader's scheme; dark takes the site's dark values. */
  readonly scheme?: "light" | "dark";
  /** The step's {@link AuthCard}, and the product's toasts. */
  readonly children: ReactNode;
}

/** The sign-in server's page: its own ground outside the site window, the `page` container of its card. */
export function AuthPage({ step, scheme, children }: AuthPageProps) {
  return (
    <div {...slotAttributes(siteAuthStyle, {})} data-page={step} data-band={scheme === "dark" ? "dark" : undefined}>
      {children}
    </div>
  );
}

/** Props for {@link AuthCard}. */
export interface AuthCardProps {
  readonly title: ReactNode;
  /** The product's mark before the title; a finished step leaves it out and opens with {@link AuthDoneMark}. */
  readonly mark?: ReactNode;
  /** The step: its sentences, ways in, form and links, in reading order. */
  readonly children: ReactNode;
}

/** The centred card one sign-in step is drawn in, headed by the mark and the step's title (the page's h1). */
export function AuthCard({ title, mark, children }: AuthCardProps) {
  return (
    <div {...slotAttributes(siteAuthStageStyle, {})}>
      <section {...slotAttributes(siteAuthCardStyle, {})} aria-label={typeof title === "string" ? title : undefined}>
        <div {...slotAttributes(siteAuthHeadStyle, {})}>
          {mark}
          <h1 {...slotAttributes(siteAuthTitleStyle, {})}>{title}</h1>
        </div>
        {children}
      </section>
    </div>
  );
}

/** Props for {@link AuthForm}. */
export interface AuthFormProps {
  /**
   * Called when the form is sent. Without `action` the part stops the page from reloading and the
   * step handles the values; with `action` it is called and the browser then posts the form.
   */
  readonly onSubmit?: () => void;
  /**
   * The address a sign-in server's page posts its fields to: the form is sent by the browser, as the
   * server's own page sends it, and the server answers with the next page.
   */
  readonly action?: string;
  /** How a posted form is sent; `post` unless a server page says otherwise. */
  readonly method?: "post" | "get";
  /** The form's id, where a server's script finds the form by it. */
  readonly id?: string;
  /** The fields in reading order, then the submit. */
  readonly children: ReactNode;
  /** `none` for a form that is only its submit (signing in with a passkey). */
  readonly gap?: "fields" | "none";
}

/**
 * What sending an {@link AuthForm} does: a form without an `action` stays on the page and hands the
 * values to the step; a form with one is posted by the browser after `onSubmit` has run.
 */
export function submitAuthForm(event: Pick<FormEvent, "preventDefault">, action: string | undefined, onSubmit: (() => void) | undefined): void {
  if (action === undefined) event.preventDefault();
  onSubmit?.();
}

/** A step's form, validated by the step rather than the browser. */
export function AuthForm({ onSubmit, action, method = "post", id, children, gap }: AuthFormProps) {
  return (
    <form
      {...slotAttributes(siteAuthFormStyle, { gap })}
      id={id}
      action={action}
      method={action === undefined ? undefined : method}
      noValidate
      onSubmit={(event: FormEvent<HTMLFormElement>) => submitAuthForm(event, action, onSubmit)}
    >
      {children}
    </form>
  );
}

/** Props for {@link AuthProviders}. */
export interface AuthProvidersProps {
  /** The ways in, each a block `SiteAction` to the identity provider. */
  readonly children: ReactNode;
}

/** Ways to go on with another account, one under the other. */
export function AuthProviders({ children }: AuthProvidersProps) {
  return <div {...slotAttributes(siteAuthProvidersStyle, {})}>{children}</div>;
}

/** Props for {@link AuthOr}. */
export interface AuthOrProps {
  readonly label: ReactNode;
}

/** A rule between two ways in, with its word in the middle ("or with email"). */
export function AuthOr({ label }: AuthOrProps) {
  return (
    <div {...slotAttributes(siteAuthOrStyle, {})}>
      <span {...slotAttributes(siteAuthOrLineStyle, {})} />
      {label}
      <span {...slotAttributes(siteAuthOrLineStyle, {})} />
    </div>
  );
}

/** Props for {@link AuthText}. */
export interface AuthTextProps {
  readonly size?: "body" | "caption";
  /** `lead` is a small bold line with a glyph before it (the product draws it). */
  readonly tone?: "muted" | "plain" | "lead" | "bad";
  /** Spoken when it appears or changes, for a state the step lands on. */
  readonly live?: boolean;
  readonly children: ReactNode;
}

/** A sentence in the card. */
export function AuthText({ size, tone, live = false, children }: AuthTextProps) {
  return (
    <p {...slotAttributes(siteAuthTextStyle, { size, tone })} role={live ? "status" : undefined}>
      {children}
    </p>
  );
}

/** Props for {@link AuthAlert}. */
export interface AuthAlertProps {
  readonly children: ReactNode;
}

/** What went wrong with what was sent, spoken at once. */
export function AuthAlert({ children }: AuthAlertProps) {
  return (
    <p {...slotAttributes(siteAuthAlertStyle, {})} role="alert">
      {children}
    </p>
  );
}

/** Props for {@link AuthLinks}. */
export interface AuthLinksProps {
  /** `spread`: two links at the two ends; `inline`: links in a line of muted small print. */
  readonly layout?: "spread" | "inline";
  /** `SiteTextAction` links, and words between them. */
  readonly children: ReactNode;
}

/** Links to other steps. */
export function AuthLinks({ layout, children }: AuthLinksProps) {
  return <p {...slotAttributes(siteAuthLinksStyle, { layout })}>{children}</p>;
}

/** Props for {@link AuthLink}. */
export interface AuthLinkProps {
  /** One `SiteTextAction`. */
  readonly children: ReactNode;
}

/** A link to another step on its own line, at the start (back to sign in). */
export function AuthLink({ children }: AuthLinkProps) {
  return <span {...slotAttributes(siteAuthLinkStyle, {})}>{children}</span>;
}

/** The strength of a new password, from 0 to `steps`. */
export interface PasswordStrengthProps {
  readonly score: number;
  /** How many bars; three by default. */
  readonly steps?: number;
  /** The strength in words for a screen reader ("Password strength 2 of 3"). */
  readonly label: string;
}

/** How strong a new password is: short bars filled with the accent up to the score. */
export function PasswordStrength({ score, steps = 3, label }: PasswordStrengthProps) {
  return (
    <span {...slotAttributes(sitePasswordStrengthStyle, {})} role="img" aria-label={label}>
      {Array.from({ length: steps }, (_, index) => (
        <i key={index} {...slotAttributes(sitePasswordStepStyle, { on: index < score })} />
      ))}
    </span>
  );
}

/** One rule of {@link PasswordRules}. */
export interface PasswordRule {
  readonly key: string;
  readonly label: ReactNode;
  readonly met: boolean;
}

/** Props for {@link PasswordRules}. */
export interface PasswordRulesProps {
  readonly rules: readonly PasswordRule[];
  /** The check a met rule shows, a glyph the product draws. */
  readonly mark?: ReactNode;
  /** What a screen reader hears after a met rule ("met"). */
  readonly metLabel?: string;
}

/** The rules under a new-password field, each ticked as it is met; spoken as they change. */
export function PasswordRules({ rules, mark, metLabel }: PasswordRulesProps) {
  return (
    <small {...slotAttributes(sitePasswordRulesStyle, {})} aria-live="polite">
      {rules.map((rule) => (
        <span key={rule.key} {...slotAttributes(sitePasswordRuleStyle, { met: rule.met })}>
          {rule.met ? mark : null}
          {rule.label}
          {rule.met && metLabel !== undefined ? <span {...slotAttributes(sitePasswordMetStyle, {})}>{metLabel}</span> : null}
        </span>
      ))}
    </small>
  );
}

/** Props for {@link AuthFieldHead}. */
export interface AuthFieldHeadProps {
  readonly title: ReactNode;
  readonly hint?: ReactNode;
}

/** What a code field asks: its title in bold over the hint. */
export function AuthFieldHead({ title, hint }: AuthFieldHeadProps) {
  return (
    <div {...slotAttributes(siteAuthFieldHeadStyle, {})}>
      <span {...slotAttributes(siteAuthFieldTitleStyle, {})}>{title}</span>
      {hint !== undefined ? <span {...slotAttributes(siteAuthFieldHintStyle, {})}>{hint}</span> : null}
    </div>
  );
}

/** Props for {@link AuthDoneMark}. */
export interface AuthDoneMarkProps {
  /** The check, a glyph the product draws. */
  readonly children: ReactNode;
}

/** The check a finished step opens with. */
export function AuthDoneMark({ children }: AuthDoneMarkProps) {
  return (
    <span {...slotAttributes(siteAuthDoneStyle, {})} aria-hidden="true">
      {children}
    </span>
  );
}
