import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Button } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { previewToolStyle } from "./preview-chrome.style";

/** Props for {@link ChromeToolButton}: a button's own props, without the variant and size it fixes. */
export type ChromeToolButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "variant" | "size">;

/**
 * A glyph control in the top bar (help, language, mode, display), drawn by the bar's one tool
 * declaration so every tool, the console's own and an app's, has the same size, hover and press.
 *
 * <p>Forwards its ref and props so a `DropdownMenuTrigger asChild` or `PopoverTrigger asChild` can
 * clone it.
 */
export const ChromeToolButton = forwardRef<HTMLButtonElement, ChromeToolButtonProps>(function ChromeToolButton(
  props,
  ref,
) {
  return <Button ref={ref} variant="ghost" size="icon-sm" {...props} {...partAttributes(previewToolStyle, {})} />;
});
