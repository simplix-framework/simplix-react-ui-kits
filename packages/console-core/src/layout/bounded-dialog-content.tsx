import { DialogContent } from "@simplix-react/ui";
import type { ComponentProps } from "react";

/**
 * A dialog panel that cannot grow past the window.
 *
 * @remarks
 * The framework's own `DialogContent` sets a width and no height at all, so a panel whose content
 * happens to be long runs off the top and bottom of the window with nothing to scroll, and the
 * confirm button is simply unreachable, and no error says so. Whether that happens depends on the
 * data: a refusal reason somebody typed at length, a conflict table with a dozen differing
 * fields, a form with every optional section filled. It passes review on the day it is written
 * and fails on a Tuesday in front of an operator.
 *
 * So every dialog in this product uses this instead of reaching for `DialogContent` directly. It
 * fixes the height ceiling; the framework's banded dialog scrolls its body between a fixed header
 * and footer, so the panel itself never scrolls; **width stays the caller's**, since
 * that is a real per-dialog decision, and a class passed here still wins because it lands after.
 *
 * `dvh` rather than `vh`: on a phone the browser's own chrome eats into `vh`, and a panel sized
 * against the larger figure hides its footer behind the address bar.
 *
 * @example
 * ```tsx
 * <BoundedDialogContent width="xl">
 *   <DialogHeader><DialogTitle>{t("plan.addTitle")}</DialogTitle></DialogHeader>
 *   <PlanForm … />
 * </BoundedDialogContent>
 * ```
 */
export function BoundedDialogContent({
  width,
  className,
  ...props
}: ComponentProps<typeof DialogContent> & { width?: DialogWidth }) {
  return (
    <DialogContent
      className={`max-h-[calc(100dvh-2rem)] ${width ? WIDTH_CLASS[width] : ""} ${className ?? ""}`}
      {...props}
    />
  );
}

/**
 * How wide a dialog is, named rather than measured.
 *
 * <p>Four steps, because a per-dialog pixel figure is how thirty dialogs end up thirty widths: a
 * confirmation is `sm`, a form is `md`, a form with a table in it is `lg`, and a comparison of two
 * records side by side is `xl`. A drawing that needs every pixel across (a procedure as lanes) is
 * `window`: as wide as the window lets it be. The width only applies from the `sm` breakpoint up;
 * below it a dialog is the window.
 */
export type DialogWidth = "sm" | "md" | "lg" | "xl" | "window";

const WIDTH_CLASS: Record<DialogWidth, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  window: "sm:max-w-none",
};
