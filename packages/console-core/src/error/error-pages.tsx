import { Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Lock,
  LogIn,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";
import { Button, EmptyState, Flex } from "@simplix-react/ui";
import { usePermissionGroupName } from "../identity";

interface ErrorPageLayoutProps {
  code: string;
  icon: React.ReactNode;
  /**
   * The tint the kind of error is read by — amber for something being worked on, red for a
   * failure, slate for a refusal, blue for a sign-in.
   *
   * <p><b>A class name and staying one.</b> The design system names four tones (default, muted,
   * primary, destructive) and only the red of a server error is among them; the other three carry
   * a distinction the tokens do not make, and collapsing them would make a maintenance window and
   * a crash the same colour.
   */
  iconClassName: string;
  titleKey: string;
  /** Catalogue key for the body line; ignored when {@link description} is supplied. */
  descriptionKey?: string;
  /** Already-composed body line, for pages whose text depends on what was refused. */
  description?: string;
  actions: React.ReactNode;
}

function ErrorPageLayout({
  code,
  icon,
  iconClassName,
  titleKey,
  descriptionKey,
  description,
  actions,
}: ErrorPageLayoutProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return (
    // Fills the height it is given and centres inside it. It used to ask for the viewport
    // (`min-h-dvh`), which is taller than the console's scrolling region by however much chrome
    // stands above it — 185px here — so the card sat below centre and the page grew a scrollbar
    // with nothing to scroll to. Where a mount supplies no height at all, that mount supplies the
    // screen: the root route's error boundary replaces the whole layout, and `RouteErrorFallback`
    // is the one place that has to say so.
    <Flex align="center" justify="center" className="flex-1 min-h-0 py-8">
      {/* ONE box. This drew a `Card` around an `EmptyState`, which draws a bordered box of its
          own — so every error page was a box inside a box, and the icon was a badge inside the
          badge this already draws. The state panel is the box.

          The status number moved under the actions and went quiet. It is what support asks for
          and what the operator never acts on, and as a red heading over the title it competed
          with the sentence that says what happened. */}
      <EmptyState
        className="w-full max-w-md"
        icon={icon}
        iconClassName={iconClassName}
        title={t(titleKey)}
        description={description ?? (descriptionKey ? t(descriptionKey) : undefined)}
        action={<Flex gap="sm">{actions}</Flex>}
        footer={code || undefined}
      />
    </Flex>
  );
}

/** 404 — Not Yet Implemented */
export function NotFoundPage() {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const router = useRouter();

  return (
    <ErrorPageLayout
      code=""
      icon={<Wrench />}
      iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
      titleKey="error.notFoundTitle"
      descriptionKey="error.notFoundDescription"
      actions={
        <>
          <Button variant="outline" onClick={() => router.history.back()}>
            <ArrowLeft />
            {t("error.goBack")}
          </Button>
          <Link to="/">
            <Button>
              <Home />
              {t("error.goHome")}
            </Button>
          </Link>
        </>
      }
    />
  );
}

/** 500 — Internal Server Error */
export function ServerErrorPage({ reset }: { reset?: () => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return (
    <ErrorPageLayout
      code="500"
      icon={<AlertTriangle />}
      iconClassName="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
      titleKey="error.serverErrorTitle"
      descriptionKey="error.serverErrorDescription"
      actions={
        <>
          <Link to="/">
            <Button variant="outline">
              <Home />
              {t("error.goHome")}
            </Button>
          </Link>
          <Button onClick={() => reset ? reset() : window.location.reload()}>
            <RefreshCw />
            {t("error.tryAgain")}
          </Button>
        </>
      }
    />
  );
}

export interface AccessDeniedPageProps {
  /** The permission the refused screen requires, when the caller knows it. */
  permission?: { action: string; subject: string };
}

/**
 * 403 — Access Denied.
 *
 * <p>Names the permission that was missing. "You do not have permission" alone leaves the
 * operator with nothing to ask their administrator for, and the group and action are exactly
 * what the administrator grants on the role screen.
 */
export function AccessDeniedPage({ permission }: AccessDeniedPageProps = {}) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const router = useRouter();
  const groupName = usePermissionGroupName();

  // The two halves of what the administrator has to grant, both in the words the role screen uses.
  // The group arrives as the constant the server compares (`PAYMENT_LEDGER`), which is not
  // something the operator can repeat to anybody.
  const actionLabel = permission ? t(`error.permissionAction.${permission.action}`) : "";
  const description = permission
    ? `${t("error.accessDeniedNeeds", { permission: `${groupName(permission.subject)} · ${actionLabel}` })} ${t("error.accessDeniedAskAdmin")}`
    : `${t("error.accessDeniedDescription")} ${t("error.accessDeniedAskAdmin")}`;

  return (
    <ErrorPageLayout
      code="403"
      icon={<Lock />}
      iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-300"
      titleKey="error.accessDeniedTitle"
      description={description}
      actions={
        <>
          {router.history.canGoBack() && (
            <Button variant="outline" onClick={() => router.history.back()}>
              <ArrowLeft />
              {t("error.goBack")}
            </Button>
          )}
          {/* An operator whose role reaches nothing is refused at the dashboard too. Offering
              the dashboard there is a button back onto the same wall; the account menu's sign-out
              is the way out, and it is always on screen. */}
          {router.state.location.pathname !== "/" && (
            <Link to="/">
              <Button>
                <Home />
                {t("error.goHome")}
              </Button>
            </Link>
          )}
        </>
      }
    />
  );
}

/** 401 — Authentication Required */
export function AuthRequiredPage() {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return (
    <ErrorPageLayout
      code="401"
      icon={<LogIn />}
      iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
      titleKey="error.authRequiredTitle"
      descriptionKey="error.authRequiredDescription"
      actions={
        <>
          <Link to="/">
            <Button variant="outline">
              <Home />
              {t("error.goHome")}
            </Button>
          </Link>
          <Link to="/login">
            <Button>
              <LogIn />
              {t("error.signIn")}
            </Button>
          </Link>
        </>
      }
    />
  );
}

/** 503 — Service Unavailable */
export function ServiceUnavailablePage() {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return (
    <ErrorPageLayout
      code="503"
      icon={<Wrench />}
      iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
      titleKey="error.serviceUnavailableTitle"
      descriptionKey="error.serviceUnavailableDescription"
      /*
       * One button, because a 503 page can offer exactly one thing: ask the server again.
       *
       * It drew two — 「서버 상태 확인」 beside 「새로 고침」 — and both called `reload()`. The
       * first label promised a reading the button never took, which is worse than the second
       * button being redundant: an operator presses it expecting to learn whether the window is
       * over and learns only that the page came back the same. A real status check is a read of
       * the deployment's health address, and that address is an installation's value rather than
       * a constant this package may hold, so it belongs to whatever routes this page — which
       * today is nothing.
       */
      actions={
        <Button onClick={() => window.location.reload()}>
          <RefreshCw />
          {t("error.refresh")}
        </Button>
      }
    />
  );
}
