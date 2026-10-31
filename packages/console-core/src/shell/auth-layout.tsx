import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { Flex, Stack } from "@simplix-react/ui";

import { useConsoleBrand } from "../identity/console-product";
import { DarkModeToggle } from "./dark-mode-toggle";
import { LocalePicker } from "./locale-picker";
import { authBrandStyle, authPageStyle } from "./auth-layout.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * Chrome for sign-in, shared by every app in the installation.
 *
 * <p>Carries the product's mark, from {@link ConsoleProductProvider}, as the other unauthenticated
 * shells do: somebody typing a password needs to see whose server is asking for it before they
 * type it.
 *
 * <p>One implementation rather than one per app: three copies of a sign-in shell drift the first
 * time one of them is restyled, and the operator who signs into two of them sees two products.
 *
 * <p>Draws the route's page, or `children` where there is no router (a design reference frame).
 */
export function AuthLayout({ children }: { readonly children?: ReactNode } = {}) {
  const brand = useConsoleBrand();
  return (
    <Flex
      align="center"
      justify="center"
      className="relative min-h-dvh"
      {...partAttributes(authPageStyle, {})}
    >
      <Flex gap="xs" align="center" className="absolute right-4 top-4 z-10">
        <LocalePicker />
        <DarkModeToggle />
      </Flex>
      <Stack gap="md" className="w-full max-w-sm">
        {/* The mark sits centred over the form whatever the product hands in. */}
        <span {...slotAttributes(authBrandStyle, {})}>{brand}</span>
        {children ?? <Outlet />}
      </Stack>
    </Flex>
  );
}
