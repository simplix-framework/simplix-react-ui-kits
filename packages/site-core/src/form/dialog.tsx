import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import {
  siteDialogCloseStyle,
  siteDialogDescriptionStyle,
  siteDialogFootStyle,
  siteDialogHeadStyle,
  siteDialogStyle,
  siteDialogTitlesStyle,
  siteDialogTitleStyle,
} from "./form.style";

/** Props for {@link SiteDialogFrame}. */
export interface SiteDialogFrameProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  /** The close button in the corner: its accessible name (named for the dialog) and its glyph. */
  readonly close?: { readonly name: string; readonly glyph: ReactNode };
  readonly children?: ReactNode;
  /** The actions at the end, the committing one last. */
  readonly footer?: ReactNode;
}

/**
 * The inside of a site dialog: the title and description with the close button, the content, then
 * the actions. It names the dialog through the framework's title and description, so it stands
 * inside a framework `Dialog`; {@link SiteDialog} puts it there.
 */
export function SiteDialogFrame({ title, description, close, children, footer }: SiteDialogFrameProps) {
  return (
    <>
      <div {...slotAttributes(siteDialogHeadStyle, {})}>
        <div {...slotAttributes(siteDialogTitlesStyle, {})}>
          <DialogTitle {...partAttributes(siteDialogTitleStyle, {})}>{title}</DialogTitle>
          {description !== undefined ? <DialogDescription {...partAttributes(siteDialogDescriptionStyle, {})}>{description}</DialogDescription> : null}
        </div>
        {close !== undefined ? (
          <DialogClose asChild>
            <button {...slotAttributes(siteDialogCloseStyle, {})} type="button" aria-label={close.name}>
              {close.glyph}
            </button>
          </DialogClose>
        ) : null}
      </div>
      {children}
      {footer !== undefined ? <div {...slotAttributes(siteDialogFootStyle, {})}>{footer}</div> : null}
    </>
  );
}

/** Props for {@link SiteDialog}. */
export interface SiteDialogProps extends SiteDialogFrameProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * A modal question over the page: the framework dialog (its focus trap, Escape, the scrim and the
 * return of focus) drawn as a site card with {@link SiteDialogFrame} inside.
 */
export function SiteDialog({ open, onOpenChange, ...frame }: SiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...partAttributes(siteDialogStyle, {})} showCloseButton={false} flush>
        <SiteDialogFrame {...frame} />
      </DialogContent>
    </Dialog>
  );
}
