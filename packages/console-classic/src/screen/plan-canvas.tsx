import { MousePointerClickIcon, TriangleAlertIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Flex,
  Icon,
  Stack,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type IconName,
} from "@simplix-react/ui";

import { NumericText, StrongText, TooltipTarget } from "../layout";

/** One tool on the bar. A tool this build cannot perform carries its reason and is not selectable. */
export interface CanvasToolDef {
  /** The tool, or a string naming one this build does not perform. */
  readonly key: string;
  readonly label: string;
  readonly icon: IconName;
  /** Why it cannot be picked, when it cannot. */
  readonly unavailableReason?: string;
}

/** One thing standing on the plan. */
export interface CanvasMark {
  readonly id: string;
  readonly label: string;
  /** What kind of record it points at, as the badge beside the label. */
  readonly kind: string;
  /** Whether it is drawn as a point or as an outline. */
  readonly region: boolean;
  /** Horizontal position as a percentage of the drawing's width. */
  readonly x: number;
  /** Vertical position as a percentage of the drawing's height. */
  readonly y: number;
  /** Set where the mark needs a person's attention. */
  readonly warn?: boolean;
}

/** One item in the palette a reader drags from. */
export interface CanvasPaletteItem {
  readonly id: string;
  readonly label: string;
  /** The one line under it saying what it is or why it is not placed. */
  readonly note?: string;
  readonly warn?: boolean;
  /** Whether picking it arms the pin tool. A file or an already-placed mark is not placeable. */
  readonly placeable?: boolean;
}

/** One group of the palette. */
export interface CanvasPaletteGroup {
  readonly key: string;
  readonly title: string;
  readonly count?: number;
  readonly items: readonly CanvasPaletteItem[];
  /** What the group says when it holds nothing. */
  readonly emptyLabel?: string;
}

interface PlanCanvasProps {
  /** The drawing's own pixel size, which every stored ratio is a ratio of. */
  readonly imageWidth: number | undefined;
  readonly imageHeight: number | undefined;
  /** The drawing file itself, absent while none has been uploaded. */
  readonly imageSrc?: string;
  /** What the bar offers. */
  readonly tools: readonly CanvasToolDef[];
  readonly activeTool: string;
  readonly onToolChange: (tool: string) => void;
  /** What the reader drags from, and what the remaining work is counted in. */
  readonly palette: readonly CanvasPaletteGroup[];
  /** The palette item armed for placing, when one is. */
  readonly armedId?: string;
  readonly onArm: (id: string | undefined) => void;
  readonly marks: readonly CanvasMark[];
  readonly selectedId?: string;
  readonly onSelect: (id: string | undefined) => void;
  /** Places the armed palette item at a point on the drawing, in percentages. */
  readonly onPlace: (itemId: string, x: number, y: number) => void;
  /** Moves an existing mark, in percentages. */
  readonly onMoveMark: (markId: string, x: number, y: number) => void;
  /** Whether this reader may change anything at all. */
  readonly canEdit: boolean;
  /** The properties of whatever is selected. Never a dialog — it would cover the spot being aimed at. */
  readonly properties: ReactNode;
  /** Buttons acting on the selection, under the bar. */
  readonly actions?: ReactNode;
}

/** How far one wheel notch or one press of the zoom buttons moves the scale. */
const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

/**
 * 도면 · 좌표 배치 (P-34) — a drawing that is worked on rather than looked at.
 *
 * <p><b>Four regions, none of them left out.</b> The bar says which tool is armed (a mode with no
 * marker has to be discovered by pressing), the palette holds what can be placed, the canvas holds
 * the drawing and what stands on it, and the properties panel edits the selection.
 *
 * <p><b>The properties are a panel, never a dialog.</b> A window opened while a position is being
 * aimed at covers the very spot being aimed at.
 *
 * <p><b>Coordinates are stored relative to the drawing.</b> Every mark is a pair of percentages, so
 * replacing the drawing image keeps the placement — and a scale change is a separate thing the
 * reader is told about rather than something silently absorbed.
 *
 * <p><b>Nothing is written until it is saved.</b> A canvas whose mistakes cannot be undone is one
 * nobody places anything on boldly, so every edit goes into the caller's own stack and 저장 is
 * explicit.
 */
export function PlanCanvas({
  imageWidth,
  imageHeight,
  imageSrc,
  tools,
  activeTool,
  onToolChange,
  palette,
  armedId,
  onArm,
  marks,
  selectedId,
  onSelect,
  onPlace,
  onMoveMark,
  canEdit,
  properties,
  actions,
}: PlanCanvasProps) {
  const { t } = useTranslation("common");
  const surface = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ markId: string } | null>(null);
  const panning = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const ratio =
    imageWidth && imageHeight && imageWidth > 0 ? (imageHeight / imageWidth) * 100 : 70.7;

  /** Where a pointer event landed, as percentages of the drawing. */
  const pointAt = useCallback((event: { clientX: number; clientY: number }) => {
    const box = surface.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return undefined;
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return undefined;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }, []);

  const onSurfacePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activeTool === "pan") {
      panning.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (activeTool === "pin" && canEdit && armedId) {
      const point = pointAt(event);
      if (point) {
        onPlace(armedId, point.x, point.y);
        onArm(undefined);
      }
      return;
    }
    onSelect(undefined);
  };

  const onSurfacePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panning.current) {
      setPan({
        x: panning.current.panX + (event.clientX - panning.current.x),
        y: panning.current.panY + (event.clientY - panning.current.y),
      });
      return;
    }
    if (!dragging.current || !canEdit) return;
    const point = pointAt(event);
    if (point) onMoveMark(dragging.current.markId, point.x, point.y);
  };

  const endPointer = () => {
    panning.current = null;
    dragging.current = null;
  };

  // A minimap belongs where the picture is bigger than the window, and only there — the drawing
  // scaled to fit needs no second copy of itself.
  const scaled = zoom > 1;

  return (
    <Stack gap="sm">
      <Card padding="sm">
        <Flex align="center" gap="sm" wrap justify="between">
          <Flex align="center" gap="xs" wrap>
            {tools.map((tool) =>
              tool.unavailableReason ? (
                <Tooltip key={tool.key}>
                  <TooltipTrigger asChild>
                    <TooltipTarget>
                      <Button variant="outline" size="sm" disabled aria-disabled="true">
                        <Icon name={tool.icon} />
                        {tool.label}
                      </Button>
                    </TooltipTarget>
                  </TooltipTrigger>
                  <TooltipContent>{tool.unavailableReason}</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  key={tool.key}
                  variant={activeTool === tool.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToolChange(tool.key)}
                >
                  <Icon name={tool.icon} />
                  {tool.label}
                </Button>
              ),
            )}
          </Flex>
          <Flex align="center" gap="xs">
            <Button
              variant="outline"
              size="sm"
              aria-label={t("canvas.zoomOut")}
              onClick={() => setZoom((value) => Math.max(ZOOM_MIN, value - ZOOM_STEP))}
            >
              <ZoomOutIcon />
            </Button>
            <NumericText size="caption" tone="muted">
              {Math.round(zoom * 100)}%
            </NumericText>
            <Button
              variant="outline"
              size="sm"
              aria-label={t("canvas.zoomIn")}
              onClick={() => setZoom((value) => Math.min(ZOOM_MAX, value + ZOOM_STEP))}
            >
              <ZoomInIcon />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              {t("canvas.fit")}
            </Button>
          </Flex>
        </Flex>
        {actions && (
          <Flex align="center" gap="xs" wrap>
            {actions}
          </Flex>
        )}
      </Card>

      {/* The three columns of the canvas: a palette of a fixed width, the drawing taking what is
          left, and the properties of the selection. The widths and the flex rules are the frame a
          drawing is read in — a plan that reflows as its palette grows is a plan whose marks move,
          so these are geometry rather than styling and stay as class names. Everything from the
          stage down is the same: a mark's place is a coordinate, and no flow primitive expresses
          one. */}
      <Flex gap="sm" align="start" className="min-h-0">
        {/* The palette. What is not yet placed is counted here rather than in a table under the
            plan: the place a reader drags from and the place the remaining work is counted have to
            be the same place, or the same gap is counted twice. */}
        <Stack gap="sm" className="w-64 shrink-0">
          {palette.map((group) => (
            <Card key={group.key} padding="sm">
              <Stack gap="xs">
                <Flex align="center" justify="between">
                  <StrongText size="caption">{group.title}</StrongText>
                  {group.count !== undefined && (
                    <Badge variant="outline">{group.count}</Badge>
                  )}
                </Flex>
                {group.items.length === 0 ? (
                  <Text size="caption" tone="muted">
                    {group.emptyLabel ?? t("canvas.paletteEmpty")}
                  </Text>
                ) : (
                  <Stack gap="none">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!item.placeable}
                        onClick={() => onArm(armedId === item.id ? undefined : item.id)}
                        // A `Button` centres its label and this is a list row: the reader
                        // scans a column of names down their left edge. What is missing is an
                        // alignment on `Button`; until it has one the row is drawn here.
                        className={`rounded-md px-2 py-1.5 text-left text-sm ${
                          armedId === item.id ? "bg-accent font-medium" : ""
                        } ${item.placeable ? "hover:bg-accent" : "cursor-default"}`}
                      >
                        <Flex align="center" gap="xs" wrap>
                          <span>{item.label}</span>
                          {item.warn && <TriangleAlertIcon size={14} />}
                        </Flex>
                        {item.note && (
                          <Text size="caption" tone="muted">
                            {item.note}
                          </Text>
                        )}
                      </button>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* The plan itself. Absolute positions rather than a layout primitive: a mark's place on a
            drawing is a coordinate, and a flow layout has no way to express one. */}
        <Card padding="none" className="min-w-0 flex-1 overflow-hidden">
          <div className="relative overflow-hidden bg-muted/30">
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <div
                ref={surface}
                onPointerDown={onSurfacePointerDown}
                onPointerMove={onSurfacePointerMove}
                onPointerUp={endPointer}
                onPointerLeave={endPointer}
                className="relative w-full bg-background"
                style={{
                  paddingBottom: `${ratio}%`,
                  cursor: activeTool === "pan" ? "grab" : activeTool === "pin" ? "crosshair" : "default",
                  backgroundImage: imageSrc
                    ? `url(${imageSrc})`
                    : "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)",
                  backgroundSize: imageSrc ? "100% 100%" : "5% 5%",
                }}
              >
                {marks.map((mark) => (
                  <button
                    key={mark.id}
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      onSelect(mark.id);
                      if (canEdit && activeTool === "select") {
                        dragging.current = { markId: mark.id };
                        surface.current?.setPointerCapture(event.pointerId);
                      }
                    }}
                    title={`${mark.kind} · ${mark.label}`}
                    style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-xs shadow-sm ${
                      selectedId === mark.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : mark.warn
                          ? "border-warning bg-background"
                          : "border-border bg-background"
                    } ${mark.region ? "border-dashed" : ""}`}
                  >
                    {mark.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The minimap, which is only here because the picture is bigger than the window. */}
            {scaled && (
              <div className="absolute bottom-2 right-2 h-24 w-32 overflow-hidden rounded border bg-background/90">
                <div className="relative h-full w-full">
                  {marks.map((mark) => (
                    <span
                      key={mark.id}
                      style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                      className={`absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                        selectedId === mark.id ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {!imageSrc && (
              <div className="pointer-events-none absolute inset-x-0 top-2">
                {/* raw layout: positioned over the plan surface at a coordinate, which no flow
                    primitive expresses — the row inside it is a Flex. */}
                <Flex justify="center">
                  <Badge variant="secondary">{t("canvas.noImage")}</Badge>
                </Flex>
              </div>
            )}
          </div>
        </Card>

        {/* The properties of the selection. A panel rather than a dialog, so the drawing stays
            visible while the thing on it is being adjusted. */}
        {selectedId ? (
          properties
        ) : (
          <EmptyState
            size="sm"
            icon={<MousePointerClickIcon />}
            title={t("canvas.nothingSelected")}
            description={t("canvas.nothingSelectedBody")}
          />
        )}
      </Flex>
    </Stack>
  );
}
