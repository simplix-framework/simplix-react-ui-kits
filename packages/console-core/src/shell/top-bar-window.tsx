import { MenuIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Flex, MenuLink, usePageHeaderState } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { ChromeControlRows } from "./chrome-control-rows";
import { ConsoleWindow } from "./console-window";
import { ConsoleContentColumn } from "./content-column";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  ConsolePhoneBar,
  ConsolePhoneMenuSection,
  ConsolePhoneMenuSheet,
  PhoneButton,
  useConsoleOnAPhone,
} from "./phone-shell";
import { previewBrandLinkStyle } from "./preview-chrome.style";
import { consoleBandControlsStyle, consoleBandTopBarStyle } from "./top-bar-window.style";

/** A destination the band carries ahead of its controls, since the window has no menu column. */
export interface ConsoleBandDestination {
  readonly key: string;
  readonly label: ReactNode;
  /** The mark ahead of the label. */
  readonly icon?: ReactNode;
  /** Whether the reader is standing on it. */
  readonly current?: boolean;
  readonly onSelect?: () => void;
}

/** Props for {@link ConsoleBandTopBar}. */
export interface ConsoleBandTopBarProps {
  /** The product mark at the start of the band. */
  readonly mark: ReactNode;
  /** Where pressing the mark leads and what that link is called for a screen reader; absent, the mark does nothing. */
  readonly home?: { readonly href: string; readonly label: string };
  /** The app's own destinations, drawn first among the controls. */
  readonly destinations?: readonly ConsoleBandDestination[];
  /** The controls after the destinations: language, theme, the account and signing out. */
  readonly children?: ReactNode;
  /**
   * The rows a phone's menu sheet carries under the destinations and the language and theme rows:
   * the account page and signing out, as buttons. A press on one closes the sheet.
   *
   * <p>The wide band draws {@link children} as bare glyphs and short buttons, which a phone has no
   * room for in one row; the sheet draws the same controls as named rows a thumb can hit.
   */
  readonly phoneMenu?: ReactNode;
}

/**
 * The top bar of a window with no menu column: the mark at the start, then the app's destinations
 * and its controls at the end.
 *
 * <p>The console's own top bar carries areas, a region, the bell and the search, which a window
 * for the people a product serves has none of; this band is that window's bar, so an app and its
 * design reference draw one shape.
 *
 * <p><b>On a phone the band is the console's phone bar.</b> The destinations and the controls are
 * about 600px of buttons in one row, which a phone's window cannot hold, and the document then
 * scrolls sideways. On a phone window the row is the mark, the page title and one menu
 * button, and the destinations, the language, the theme and {@link ConsoleBandTopBarProps.phoneMenu}
 * move into the sheet that button opens, the shape the console's own phone shell uses. The bar
 * carries the page title, so the page header does not draw it a second time on a phone.
 */
export function ConsoleBandTopBar(props: ConsoleBandTopBarProps) {
  const onAPhone = useConsoleOnAPhone();
  return onAPhone ? <ConsoleBandPhoneBar {...props} /> : <ConsoleBandWideBar {...props} />;
}

function ConsoleBandWideBar({ mark, home, destinations = [], children }: ConsoleBandTopBarProps) {
  return (
    // Wrapping is what keeps a band wider than its window inside it: the controls drop under the
    // mark, right-aligned, instead of pushing the document sideways. A window narrower than a tablet
    // draws the phone bar instead, so this is the case of a window that is nearly wide enough.
    <Flex align="center" justify="between" gap="md" wrap {...partAttributes(consoleBandTopBarStyle, {})}>
      {home ? (
        <MenuLink href={home.href} attributes={{ ...slotAttributes(previewBrandLinkStyle, {}), "aria-label": home.label }}>
          {mark}
        </MenuLink>
      ) : (
        mark
      )}
      <Flex align="center" gap="sm" wrap {...partAttributes(consoleBandControlsStyle, {})}>
        {destinations.map((destination) => (
          <Button
            key={destination.key}
            variant={destination.current ? "secondary" : "ghost"}
            size="sm"
            aria-current={destination.current ? "page" : undefined}
            onClick={destination.onSelect}
          >
            {destination.icon}
            {destination.label}
          </Button>
        ))}
        {children}
      </Flex>
    </Flex>
  );
}

function ConsoleBandPhoneBar({ mark, home, destinations = [], phoneMenu }: ConsoleBandTopBarProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  const { title } = usePageHeaderState();
  const [open, setOpen] = useState(false);
  return (
    <>
      <ConsolePhoneBar
        brand={mark}
        home={home}
        title={title}
        actions={
          <PhoneButton
            type="button"
            variant="ghost"
            aria-label={t("phone.menu")}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="size-5" aria-hidden />
          </PhoneButton>
        }
      />
      <ConsolePhoneMenuSheet
        open={open}
        onOpenChange={setOpen}
        title={t("phone.menu")}
        footer={<ConsoleBandMenuFooter phoneMenu={phoneMenu} onClose={() => setOpen(false)} />}
      >
        <ConsoleBandMenuDestinations destinations={destinations} onClose={() => setOpen(false)} />
      </ConsolePhoneMenuSheet>
    </>
  );
}

/** The destinations of the band as rows of the phone sheet, each closing the sheet before it acts. */
export function ConsoleBandMenuDestinations({
  destinations,
  onClose,
}: {
  readonly destinations: readonly ConsoleBandDestination[];
  readonly onClose: () => void;
}) {
  if (destinations.length === 0) return null;
  return (
    <ConsolePhoneMenuSection onActivate={onClose}>
      {destinations.map((destination) => (
        <Button
          key={destination.key}
          variant={destination.current ? "secondary" : "ghost"}
          className="w-full justify-start"
          aria-current={destination.current ? "page" : undefined}
          onClick={destination.onSelect}
        >
          {destination.icon}
          {destination.label}
        </Button>
      ))}
    </ConsolePhoneMenuSection>
  );
}

/** The language and theme rows, then the app's own rows, under the destinations in the phone sheet. */
export function ConsoleBandMenuFooter({
  phoneMenu,
  onClose,
}: {
  readonly phoneMenu?: ReactNode;
  readonly onClose: () => void;
}) {
  return (
    <>
      <ConsolePhoneMenuSection>
        <ChromeControlRows display={false} />
      </ConsolePhoneMenuSection>
      {phoneMenu ? <ConsolePhoneMenuSection onActivate={onClose}>{phoneMenu}</ConsolePhoneMenuSection> : null}
    </>
  );
}

/** Props for {@link ConsoleTopBarWindow}. */
export interface ConsoleTopBarWindowProps {
  /** The band across the top, usually a {@link ConsoleBandTopBar}. */
  readonly topBar: ReactNode;
  /** The routed screen. */
  readonly children: ReactNode;
}

/**
 * The window of an app with a top bar and nothing else: no menu column and no status strip, the
 * screen in the content column under the bar.
 */
export function ConsoleTopBarWindow({ topBar, children }: ConsoleTopBarWindowProps) {
  return (
    <ConsoleWindow>
      {topBar}
      <Flex gap="none" flex overflow="hidden">
        <ConsoleContentColumn>{children}</ConsoleContentColumn>
      </Flex>
    </ConsoleWindow>
  );
}
