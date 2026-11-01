import type { ReactNode } from "react";
import { Stack } from "@simplix-react/ui";

/**
 * A page drawn at the height of the window, for a mount with no console around it to give the page
 * a height: the root route's error boundary, the page a shell draws in place of itself, and a
 * board frame that stands outside the console window.
 *
 * <p>A failure page centres inside the height it is given, so the mount has to supply one. This is
 * the one place that does, which keeps the app and the board frame measured against it drawing the
 * same box.
 */
export function WindowScreen({ children }: { readonly children: ReactNode }) {
  return <Stack className="min-h-dvh">{children}</Stack>;
}
