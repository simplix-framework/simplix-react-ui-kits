import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Badge, Button, Card, Flex, Icon, QrCode, Stack, Text } from "@simplix-react/ui";

import { useContentLanguageLabel } from "../i18n";
import { HorizontalScroll } from "../layout";
import { UnbuiltAction } from "../notice";

/**
 * A paper size, by the name printers and inspectors use for it.
 *
 * <p>Closed rather than a free string: the preview draws the sheet at the real proportion, and a
 * size nobody has measured is a preview that lies about what fits.
 */
export type PaperSize =
  | "A4-portrait"
  | "A4-landscape"
  | "A3-portrait"
  | "A3-landscape"
  /** An ID-1 card, 86×54mm — what a worker carries and holds up to a reader. */
  | "card-landscape";

/** The proportion of each sheet, and how wide the preview draws it. */
const SHEET: Readonly<Record<PaperSize, { readonly width: number; readonly ratio: number }>> = {
  // width in px at 100%, and height ÷ width. A4 is 210×297mm, A3 is 297×420mm.
  "A4-portrait": { width: 520, ratio: 297 / 210 },
  "A4-landscape": { width: 720, ratio: 210 / 297 },
  "A3-portrait": { width: 600, ratio: 420 / 297 },
  "A3-landscape": { width: 820, ratio: 297 / 420 },
  // ID-1, the size every access card and bank card is. Drawn small because it IS small: a preview
  // that blows a card up to a sheet's width hides that a name in fourteen characters does not fit.
  "card-landscape": { width: 344, ratio: 54 / 86 },
};

interface PrintSheetProps {
  readonly size: PaperSize;
  /** The margin the printer will actually leave, as a CSS length — 「15mm」. */
  readonly margin?: string;
  /** Title printed at the head of the sheet. */
  readonly title: string;
  /** Everything on the page. */
  readonly children: ReactNode;
  /**
   * What a reader scans to check the printed copy is still the current one.
   *
   * <p>A posted document goes out of date the moment the record behind it changes, and paper
   * cannot say so — the code is how the person standing in front of it finds out.
   */
  readonly verifyUrl?: string;
  /** The line under the code, in the language of whoever is reading the posted copy. */
  readonly verifyCaption?: ReactNode;
  /**
   * What stands beside the code in the second language the site prints in.
   *
   * <p>A posted permit a foreign worker has to read carries both languages on the one sheet, and
   * the second one belongs where the reader is already looking — beside the code they scan, not
   * on a second page.
   */
  readonly verifyBody?: ReactNode;
}

/**
 * 인쇄 미리 보기 · 출력물 (P-37) — one sheet, at the proportion it will actually be printed at.
 *
 * <p><b>The sheet is not fitted to the window.</b> Rescaling the paper to whatever width the
 * browser happens to be means the preview cannot show what falls off the page, which is the one
 * thing a print preview exists to show.
 *
 * <p><b>On a site the paper is the interface.</b> A posted permit is what a worker reads before
 * starting, so what is on it is judged as a screen is judged rather than treated as an export.
 */
export function PrintSheet({
  size,
  margin = "15mm",
  title,
  children,
  verifyUrl,
  verifyCaption,
  verifyBody,
}: PrintSheetProps) {
  const { t } = useTranslation("common");
  const sheet = SHEET[size];

  return (
    <Card
      padding="none"
      // raw layout: the sheet is a fixed proportion of real paper, so its box is measured rather
      // than composed — a framework primitive would fit it to the column and hide the overflow
      // this preview exists to show.
      className="shrink-0 border shadow-sm"
      style={{ width: sheet.width, minHeight: sheet.width * sheet.ratio, padding: margin }}
    >
      <Stack gap="md">
        <Text className="text-center font-medium">{title}</Text>
        {children}
        {verifyUrl && (
          <Flex gap="md" align="center">
            <QrCode value={verifyUrl} size={96} label={t("print.verifyLabel")} />
            <Stack gap="none">
              <Text size="caption">{t("print.verifyLabel")}</Text>
              {verifyCaption && (
                <Text size="caption" tone="muted">
                  {verifyCaption}
                </Text>
              )}
              {verifyBody}
            </Stack>
          </Flex>
        )}
      </Stack>
    </Card>
  );
}

/** How the viewer lays the sheets out. */
export type ViewerFit = "width" | "single" | "spread";

/** Something that will not survive the print, and what can be done about it. */
export interface PrintOverflow {
  /** What falls off, and onto which page — 「감소대책 3줄이 2쪽으로 넘어갑니다」. */
  readonly message: string;
  /** The ways out — a larger sheet, or accepting the second page. */
  readonly actions?: ReactNode;
}

interface DocumentViewerProps {
  readonly size: PaperSize;
  /** How many pages the document runs to. */
  readonly pages: number;
  /** Which page is open, 1-based. */
  readonly page: number;
  readonly onPageChange: (page: number) => void;
  readonly fit: ViewerFit;
  readonly onFitChange: (fit: ViewerFit) => void;
  /** The languages this document can be shown in, and which is showing. */
  readonly languages?: readonly string[];
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** What will not fit, warned about above the sheet rather than after printing. */
  readonly overflow?: PrintOverflow;
  /**
   * How large the sheet is drawn, as a percentage.
   *
   * <p>Separate from {@link ViewerFit}: fitting decides how many sheets stand side by side, and
   * zoom decides how big each one is. A reader checking whether a box will hold a signature needs
   * the second without giving up the first.
   */
  readonly zoom?: number;
  readonly onZoomChange?: (zoom: number) => void;
  /**
   * The pages a problem lands on, 1-based — drawn on the rail so the reader can get to them.
   *
   * <p>A warning that names page 2 and gives no way to page 2 is a warning the reader has to act
   * on by counting.
   */
  readonly marks?: readonly number[];
  /** Opens the find box. The viewer draws the affordance; searching the sheet is the caller's. */
  readonly onFind?: () => void;
  /** The one line at the foot restating what is still unresolved. */
  readonly status?: string;
  /** The sheets themselves. */
  readonly children: ReactNode;
}

/**
 * 인쇄 미리 보기 · 출력물 (P-37) — the viewer a multi-page document is read in.
 *
 * <p><b>Viewer controls and print settings are two different things and stay apart.</b> Which page
 * is open, how it is fitted and which language is showing belong to the reader looking at it;
 * paper, margin, copies and which language is printed belong to the form beside it. Mixing them
 * makes every look-at change what comes out of the printer.
 *
 * <p><b>What will be cut is said inside the viewer, before the print.</b> A warning that arrives
 * after the paper does is a warning nobody can act on, so it sits directly under the toolbar with
 * the two ways out attached.
 *
 * <p><b>A statutory form is reproduced as it is, not redrawn.</b> Where the boxes' positions are
 * fixed by the form itself, a tidier layout is one the office will not accept.
 */
export function DocumentViewer({
  size,
  pages,
  page,
  onPageChange,
  fit,
  onFitChange,
  languages,
  language,
  onLanguageChange,
  overflow,
  zoom = 100,
  onZoomChange,
  marks,
  onFind,
  status,
  children,
}: DocumentViewerProps) {
  const { t } = useTranslation("common");
  const languageLabel = useContentLanguageLabel();
  const step = (by: number) => onZoomChange?.(Math.min(200, Math.max(50, zoom + by)));

  return (
    <Stack gap="sm">
      <Flex align="center" gap="sm" wrap>
        <Flex gap="xs" align="center">
          <Button
            variant="outline"
            size="xs"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t("print.previousPage")}
          </Button>
          <Text size="caption">{t("print.pageOf", { page, pages })}</Text>
          <Button
            variant="outline"
            size="xs"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("print.nextPage")}
          </Button>
        </Flex>

        <Badge variant="outline">{t(`print.paper.${size}`)}</Badge>

        <Flex gap="xs" align="center" className="ml-auto min-w-0">
          {onZoomChange && (
            <Flex gap="xs" align="center">
              <Button variant="outline" size="xs" onClick={() => step(-25)} disabled={zoom <= 50}>
                {t("print.zoomOut")}
              </Button>
              <Text size="caption">{t("print.zoomValue", { zoom })}</Text>
              <Button variant="outline" size="xs" onClick={() => step(25)} disabled={zoom >= 200}>
                {t("print.zoomIn")}
              </Button>
            </Flex>
          )}
          {onFind === undefined ? (
            <UnbuiltAction label={t("print.find")} size="xs" />
          ) : (
            <Button variant="outline" size="xs" onClick={onFind}>
              {t("print.find")}
            </Button>
          )}
          {(["width", "single", "spread"] as const).map((option) => (
            <Button
              key={option}
              size="xs"
              variant={fit === option ? "default" : "outline"}
              onClick={() => onFitChange(option)}
            >
              {t(`print.fit.${option}`)}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* The rail: every page reachable by name, with the ones carrying a problem marked. */}
      <Flex gap="xs" wrap>
        {Array.from({ length: pages }, (_, index) => index + 1).map((one) => (
          <Button
            key={one}
            size="xs"
            variant={one === page ? "default" : "outline"}
            onClick={() => onPageChange(one)}
          >
            {t("print.pageNumber", { page: one })}
            {marks?.includes(one) && <TriangleAlertIcon className="size-3.5 text-warning" />}
          </Button>
        ))}
      </Flex>

      {languages && languages.length > 0 && (
        <Flex gap="xs" wrap>
          {languages.map((one) => (
            <Button
              key={one}
              size="xs"
              variant={language === one ? "default" : "outline"}
              // The row still says which language is on screen where nothing can change it, so
              // the chips stay and lose their press rather than disappearing.
              disabled={!onLanguageChange}
              onClick={onLanguageChange ? () => onLanguageChange(one) : undefined}
            >
              {/* Named rather than echoed: 「km」 is the tag it was stored under. */}
              {languageLabel(one)}
            </Button>
          ))}
        </Flex>
      )}

      {overflow && (
        <AlertBanner tone="warning" icon={TriangleAlertIcon} title={overflow.message} trailing={overflow.actions} />
      )}

      {/* The sheets scroll sideways inside their own box: at 100% an A3 spread is wider than the
          column, and a page body that scrolled horizontally instead would take the whole console
          with it. */}
      <HorizontalScroll>
        {/* raw span: `zoom` scales the sheet and the box it stands in together, which is what a
            print preview needs — a transform would leave the scrollable area the size of the
            unscaled paper and hide the half the reader zoomed in to see. */}
        <span className="block" style={{ zoom: zoom / 100 }}>
          <Flex gap="md" align="start" className="p-2">
            {children}
          </Flex>
        </span>
      </HorizontalScroll>

      {status && (
        <Text size="caption" tone="muted">
          {status}
        </Text>
      )}
    </Stack>
  );
}
