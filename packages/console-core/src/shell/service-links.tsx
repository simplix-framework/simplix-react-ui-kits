import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Separator, Stack, Text, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { ConsoleMenuGlyph, ConsoleMenuLinkRow } from "./menu-tree";
import { menuRailButtonStyle, menuRailRuleStyle } from "./menu-tree.style";
import { ConsolePhoneMenuSection } from "./phone-shell";
import { serviceLinksStyle, serviceLinksTitleStyle } from "./service-links.style";

/** One service beside the console that an operator opens in a tab of its own. */
export interface ConsoleServiceLink {
  readonly key: string;
  /** What the service is called. */
  readonly label: string;
  /**
   * Where the service is reached. Which address that is belongs to the installation, so the product
   * reads it from its deployment configuration; absent, empty or blank, the link is not drawn, and an
   * installation that configures no address for a service shows no link to it.
   */
  readonly href?: string | null;
  /** The service's mark, drawn at 16px in a row and 18px on the rail. */
  readonly icon?: ReactNode;
}

/** A service whose address is configured. */
export interface ConfiguredServiceLink extends ConsoleServiceLink {
  readonly href: string;
}

/** Where the services are drawn: the expanded column, the rail, or the phone's menu sheet. */
export type ConsoleServiceLinksLayout = "column" | "rail" | "sheet";

/** Props for {@link ConsoleServiceLinks}. */
export interface ConsoleServiceLinksProps {
  /** What the services are called together, over them in the column and the sheet, and their landmark's name. */
  readonly title: string;
  readonly links: readonly ConsoleServiceLink[];
  readonly layout: ConsoleServiceLinksLayout;
}

/**
 * The services whose address is configured, in the order given, each address trimmed.
 *
 * @param links the services the product knows of
 * @returns those with an address to open
 */
export function configuredServiceLinks(links: readonly ConsoleServiceLink[]): ConfiguredServiceLink[] {
  return links.flatMap((link) => {
    const href = link.href?.trim();
    return href ? [{ ...link, href }] : [];
  });
}

/**
 * The services beside the console (a customer portal, the sign-in server's admin console, a mail
 * catcher), drawn at the foot of the navigation and opened in a new tab.
 *
 * <p>In the column they are rows under a rule and a name, each ending in the external-link mark. On
 * the rail each is a mark of its own whose name is a tooltip, shown on hover and on keyboard focus,
 * because a rail mark that opened a flyout for one row would cost a second press to leave. In the
 * phone's menu sheet they are a section of rows. A service with no configured address is left out,
 * and with none left nothing is drawn at all.
 *
 * <p>Every link opens with no opener and no referrer, so the service cannot reach back into the
 * console's window and is not told which console page the operator was on.
 */
export function ConsoleServiceLinks({ title, links, layout }: ConsoleServiceLinksProps) {
  const shown = configuredServiceLinks(links);
  if (shown.length === 0) return null;
  if (layout === "rail") return <RailServiceLinks title={title} links={shown} />;
  const rows = shown.map((link) => <ConsoleMenuLinkRow key={link.key} icon={link.icon} label={link.label} href={link.href} external />);
  if (layout === "sheet") {
    return (
      <Stack gap="none" role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout })}>
        <ConsolePhoneMenuSection title={title}>{rows}</ConsolePhoneMenuSection>
      </Stack>
    );
  }
  return (
    <Stack gap="xs" shrink={false} role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout })}>
      <Text size="caption" tone="muted" {...partAttributes(serviceLinksTitleStyle, {})}>
        {title}
      </Text>
      {rows}
    </Stack>
  );
}

/**
 * The services on the rail, each drawn as a rail mark is drawn (the same part, never current), so the
 * rail keeps one size and one look for every mark on it.
 */
function RailServiceLinks({ title, links }: { readonly title: string; readonly links: readonly ConfiguredServiceLink[] }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  return (
    <Stack gap="xs" align="center" role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout: "rail" })}>
      <Separator className="w-8" {...partAttributes(menuRailRuleStyle, {})} />
      {links.map((link) => (
        <Tooltip key={link.key}>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-sm" {...partAttributes(menuRailButtonStyle, { active: false })}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <ConsoleMenuGlyph>{link.icon}</ConsoleMenuGlyph>
                <span className="sr-only">{`${link.label} ${t("link.newTab")}`}</span>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{link.label}</TooltipContent>
        </Tooltip>
      ))}
    </Stack>
  );
}
