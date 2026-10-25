// The mockup's global settings: what the Storybook toolbar switches for every screen at once.
import { createContext, useContext } from "react";

/** Whether a screen is drawn inside the console's window (bars, menu, status strip) or alone. */
export type FrameMode = "full" | "content";

/** Where a list screen opens the record a reader picked. */
export type DetailPresentation = "panel" | "drawer" | "dialog" | "page";

export interface MockupSettings {
  /** `panel`, `drawer` and `dialog` are the framework's installation default (UIProvider defaults); `page` is a screen's own variant. */
  detailPresentation: DetailPresentation;
  /** Sets the detail presentation for every screen, as the toolbar does; a screen's own switch writes through it. */
  setDetailPresentation: (value: DetailPresentation) => void;
  colorTheme: string;
  mode: "light" | "dark";
  locale: string;
  /** `full` draws the UI kit's window chrome around the screen; `content` draws the screen alone. */
  frame: FrameMode;
}

export const MockupSettingsContext = createContext<MockupSettings | null>(null);

/** The settings the toolbar has chosen; a screen reads `detailPresentation` to pick its layout. */
export function useMockupSettings(): MockupSettings {
  const settings = useContext(MockupSettingsContext);
  if (!settings) throw new Error("useMockupSettings is used outside the mockup preview's decorator");
  return settings;
}
