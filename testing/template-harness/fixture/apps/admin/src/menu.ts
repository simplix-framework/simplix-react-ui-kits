import { FileTextIcon, type LucideIcon } from "lucide-react";

/** The permission a menu entry is drawn under. */
export interface MenuGate {
  readonly action: string;
  readonly subject: string;
}

/** One destination in the fixture app's menu, the shape a generated menu entry is written in. */
export interface MenuEntry {
  readonly key: string;
  readonly href?: string;
  readonly icon: LucideIcon;
  readonly gate: MenuGate | undefined;
}

/** The fixture app's menu: a generated list screen adds its entry before the marker. */
export const ADMIN_MENU: readonly MenuEntry[] = [
  { key: "home", href: "/", icon: FileTextIcon, gate: undefined },
  // @simplix-menu admin
];
