import { ChevronsUpDownIcon, ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
  Stack,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { ConsoleMenuGlyph, ConsoleMenuLinkRow } from "./menu-tree";
import { menuLabelStyle, menuRailButtonStyle, menuRailRuleStyle, menuRowStyle } from "./menu-tree.style";
import { ConsolePhoneMenuSection } from "./phone-shell";
import { serviceLinksStyle } from "./service-links.style";

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

/** The measure the services' menu opens at: the menu column's own width, so the rows line up with it. */
const SERVICES_MEASURE = "w-56";

/**
 * The services beside the console (a customer portal, the sign-in server's admin console, a mail
 * catcher), drawn at the foot of the navigation and opened in a new tab.
 *
 * <p>In the column and on the rail they are one control however many services an installation
 * configures: a row named by `title` with a caret, which opens the services upward as a menu, and on
 * the rail one mark with the same name as a tooltip. A menu keeps the foot one row tall where a row
 * per service grew with the installation's configuration. In the phone's menu sheet they are a
 * section of rows, since the sheet scrolls. A service with no configured address is left out, and with
 * none left nothing is drawn at all.
 *
 * <p>Every link opens with no opener and no referrer, so the service cannot reach back into the
 * console's window and is not told which console page the operator was on.
 */
export function ConsoleServiceLinks({ title, links, layout }: ConsoleServiceLinksProps) {
  const shown = configuredServiceLinks(links);
  if (shown.length === 0) return null;
  if (layout === "rail") return <RailServiceLinks title={title} links={shown} />;
  if (layout === "sheet") {
    return (
      <Stack gap="none" role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout })}>
        <ConsolePhoneMenuSection title={title}>
          {shown.map((link) => (
            <ConsoleMenuLinkRow key={link.key} icon={link.icon} label={link.label} href={link.href} external />
          ))}
        </ConsolePhoneMenuSection>
      </Stack>
    );
  }
  return (
    <Stack gap="none" shrink={false} role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout })}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between"
            {...slotAttributes(menuRowStyle, { kind: "branch", strong: false, current: false })}
          >
            <span className="min-w-0 flex-1 truncate" {...slotAttributes(menuLabelStyle, {})}>
              {title}
            </span>
            <ConsoleMenuGlyph>
              <ChevronsUpDownIcon />
            </ConsoleMenuGlyph>
          </button>
        </DropdownMenuTrigger>
        <ServiceMenuContent links={shown} side="top" align="start" />
      </DropdownMenu>
    </Stack>
  );
}

/** The menu the services open as: a row per service, each opening in a tab of its own. */
function ServiceMenuContent({
  links,
  side,
  align,
}: {
  readonly links: readonly ConfiguredServiceLink[];
  readonly side: "top" | "right";
  readonly align: "start" | "end";
}) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  return (
    <DropdownMenuContent side={side} align={align} className={SERVICES_MEASURE}>
      {links.map((link) => (
        <DropdownMenuItem key={link.key} asChild>
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.icon}
            <span className="min-w-0 flex-1 truncate">{link.label}</span>
            <ExternalLinkIcon aria-hidden />
            <span className="sr-only">{t("link.newTab")}</span>
          </a>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

/**
 * The services on the rail: one mark, drawn as a rail mark is drawn (the same part, never current),
 * whose name is a tooltip shown on hover and on keyboard focus and which opens the services as a menu
 * to its right.
 */
function RailServiceLinks({ title, links }: { readonly title: string; readonly links: readonly ConfiguredServiceLink[] }) {
  return (
    <Stack gap="xs" align="center" role="navigation" aria-label={title} {...partAttributes(serviceLinksStyle, { layout: "rail" })}>
      <Separator className="w-8" {...partAttributes(menuRailRuleStyle, {})} />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" {...partAttributes(menuRailButtonStyle, { active: false })}>
                <ConsoleMenuGlyph>
                  <ExternalLinkIcon />
                </ConsoleMenuGlyph>
                <span className="sr-only">{title}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
        <ServiceMenuContent links={links} side="right" align="end" />
      </DropdownMenu>
    </Stack>
  );
}
