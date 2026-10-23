import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Dialog, DialogTitle, Stack, Text, Flex } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { ArrowLeftIcon, CircleHelpIcon, XIcon } from "lucide-react";

import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { useManualStore } from "./manual-store";
import { useManualPage } from "./use-manual-page";
import {
  clampManualWidth,
  MAX_MANUAL_WIDTH,
  MIN_MANUAL_WIDTH,
  readManualWidth,
  writeManualWidth,
} from "./manual-width";
import {
  manualBodyStyle,
  manualContentsLinkStyle,
  manualFallbackCardStyle,
  manualHeaderStyle,
  manualMarkStyle,
  manualPanelStyle,
  manualResizerStyle,
  manualSectionsStyle,
  manualStepStyle,
  manualZoomImageStyle,
  manualZoomTitleStyle,
} from "./manual-panel.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/** How far a keyboard press moves the panel's edge. */
const KEYBOARD_STEP = 40;

/** Props for {@link ManualPanel}: where the reader is. */
export interface ManualPanelProps {
  /** The route the console is on. Which page answers is decided by this. */
  route: string;
}

/**
 * The manual, read beside the screen it explains.
 *
 * <p>A panel rather than a dialog, because a dialog covers the thing the reader is stuck on: they
 * would have to close it to look, and open it again to read on. The page opens at the screen they
 * are on rather than at a contents listing — somebody who pressed help already knows where they
 * got stuck, and asking them to find it again is the cost this panel exists to remove.
 *
 * <p>The body is HTML the build produced from this repository's own manual and the server hands
 * out from its own origin. It is written into the panel as markup because that is what it is;
 * nothing a reader supplies reaches it.
 */
export function ManualPanel({ route }: ManualPanelProps) {
  // Read here rather than passed in: the panel is the only thing that needs it, and a layout
  // threading it through would have to know why.
  const { t, locale } = useTranslation("common");
  const open = useManualStore((s) => s.open);
  const close = useManualStore((s) => s.close);
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const state = useManualPage(route, locale, chosen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);

  // Read synchronously on the first render rather than in an effect, which would paint the panel
  // at the default width and then snap it to the reader's on every open.
  const [width, setWidth] = useState(() => readManualWidth());
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  // A new screen means a new question: whatever page the reader picked from the contents is not
  // the one they are now asking about.
  useEffect(() => { setChosen(undefined); }, [route]);
  useEffect(() => { setSection(0); }, [route, locale, chosen]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      // Dragged from the panel's leading edge, so moving left widens it.
      setWidth(clampManualWidth(current.startWidth + (current.startX - event.clientX)));
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setWidth((held) => { writeManualWidth(held); return held; });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // A picture at the panel's width is smaller than the screen it shows, so pressing one opens it
  // at its own size. Delegated from the body rather than bound per image: the markup is injected,
  // so there is no element here to hang a handler on.
  const onBodyClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    setZoomed({ src: target.currentSrc || target.src, alt: target.alt });
  }, []);

  if (!open) return null;

  /**
   * Scrolls to one of the page's sections.
   *
   * <p>Found by position among the rendered headings rather than by an id: the ids would have to
   * be generated from the heading text, and two languages of the same page would then need
   * different ones for what is the same section.
   *
   * @param index which section, in the order the page carries them
   */
  const goTo = (index: number) => {
    setSection(index);
    bodyRef.current?.querySelectorAll("h2")[index]?.scrollIntoView({ block: "start" });
  };

  const contents = state.status === "no-page" ? state.contents
    : state.status === "page" ? state.page.contents : [];

  return (
    <>
      <aside
        aria-label={t("manual.title")}
        className="relative flex shrink-0 flex-col"
        style={{ width }}
        {...slotAttributes(manualPanelStyle, {})}
      >
        {/* The edge the reader drags. A real element with a role rather than a bare cursor, so
            the width can also be set from the keyboard by somebody who cannot drag. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t("manual.resize")}
          aria-valuenow={width}
          aria-valuemin={MIN_MANUAL_WIDTH}
          aria-valuemax={MAX_MANUAL_WIDTH}
          tabIndex={0}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            drag.current = { startX: event.clientX, startWidth: width };
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          onKeyDown={(event) => {
            const step = event.key === "ArrowLeft" ? KEYBOARD_STEP
              : event.key === "ArrowRight" ? -KEYBOARD_STEP : 0;
            if (!step) return;
            event.preventDefault();
            setWidth((held) => {
              const next = clampManualWidth(held + step);
              writeManualWidth(next);
              return next;
            });
          }}
          className="absolute inset-y-0 -start-1 z-10 w-2 cursor-col-resize"
          {...slotAttributes(manualResizerStyle, {})}
        />

        <Flex align="center" gap="sm" {...partAttributes(manualHeaderStyle, {})}>
          {chosen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChosen(undefined)}
              title={t("manual.backToScreen")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          )}
          {/* The same mark as the control that opened this, so the panel says what it is even
              when its title is the name of a page rather than the word "help". */}
          <CircleHelpIcon
            aria-hidden
            className="size-4 shrink-0"
            {...slotAttributes(manualMarkStyle, {})}
          />
          <Text weight="medium" className="min-w-0 flex-1 truncate">
            {state.status === "page" ? state.page.title : t("manual.title")}
          </Text>
          <Button variant="outline" size="sm" onClick={close} title={t("manual.close")}>
            <XIcon className="size-4" />
          </Button>
        </Flex>

        {state.status === "page" && state.page.sections.length > 0 && (
          <Flex wrap gap="xs" {...partAttributes(manualSectionsStyle, {})}>
            {state.page.sections.map((label, i) => (
              <Button
                key={label}
                variant={i === section ? "secondary" : "outline"}
                size="sm"
                onClick={() => goTo(i)}
              >
                {label}
              </Button>
            ))}
          </Flex>
        )}

        <Stack flex className="min-h-0 overflow-auto" {...partAttributes(manualBodyStyle, {})}>
          {state.status === "loading" && <Text tone="muted">{t("manual.loading")}</Text>}

          {state.status === "unavailable" && <Text tone="muted">{t("manual.unavailable")}</Text>}

          {state.status === "no-page" && (
            <Stack gap="sm">
              <Text tone="muted">{t("manual.noPage")}</Text>
              {/* Every line opens — a contents that only names its pages is a dead end, and the
                  reader is here precisely because they could not find what they wanted. */}
              <Stack gap="none">
                {contents.map((page) => (
                  <Button
                    key={page.slug}
                    variant="outline"
                    size="sm"
                    onClick={() => setChosen(page.slug)}
                    className="h-auto justify-start whitespace-normal"
                    {...partAttributes(manualContentsLinkStyle, {})}
                  >
                    <span {...slotAttributes(manualStepStyle, {})}>{page.step}</span>
                    {page.title}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}

          {state.status === "page" && (
            <Stack gap="sm">
              {state.fellBack && (
                <Text size="caption" {...partAttributes(manualFallbackCardStyle, {})}>
                  {t("manual.fellBackToEnglish")}
                </Text>
              )}
              <div
                ref={bodyRef}
                lang={state.page.locale}
                className="manual-page"
                onClick={onBodyClick}
                dangerouslySetInnerHTML={{ __html: state.page.html }}
              />
            </Stack>
          )}
        </Stack>
      </aside>

      <Dialog open={zoomed !== null} onOpenChange={(next) => !next && setZoomed(null)}>
        {/* The width is the caller's and none of the four named steps fits it: a picture opened at
            its own size wants the window rather than a step, so it is written here. */}
        <BoundedDialogContent className="max-w-[92vw] sm:max-w-[92vw]">
          <DialogTitle {...partAttributes(manualZoomTitleStyle, {})}>{zoomed?.alt}</DialogTitle>
          {zoomed && (
            <img
              src={zoomed.src}
              alt={zoomed.alt}
              // Capped against what the panel can hold rather than against the window, so the
              // picture is the largest one that needs no scrolling: the panel's own ceiling is
              // `100dvh` less its inset, and the 10rem here is that inset plus the padding, the
              // gap and a title of two lines. Sized against the window instead, a short screen
              // gets a picture taller than the panel and a viewer that scrolls to see a picture.
              className="max-h-[calc(100dvh-10rem)] w-full object-contain"
              {...slotAttributes(manualZoomImageStyle, {})}
            />
          )}
        </BoundedDialogContent>
      </Dialog>
    </>
  );
}
