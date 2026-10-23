import { Outlet } from "@tanstack/react-router";
import { Flex, Stack } from "@simplix-react/ui";

import { useConsoleBrand } from "../identity/console-product";
import { DarkModeToggle } from "./dark-mode-toggle";
import { LocalePicker } from "./locale-picker";

/**
 * Chrome for sign-in, shared by every app in the installation.
 *
 * <p>Carries the product's mark, from {@link ConsoleProductProvider}, as the other unauthenticated
 * shells do: somebody typing a password needs to see whose server is asking for it before they
 * type it.
 *
 * <p>One implementation rather than one per app — three copies of a sign-in shell drift the first
 * time one of them is restyled, and the operator who signs into two of them sees two products.
 */
export function AuthLayout() {
  const brand = useConsoleBrand();
  return (
    <Flex align="center" justify="center" className="relative min-h-dvh bg-background px-4 py-8">
      <Flex gap="xs" align="center" className="absolute right-4 top-4 z-10">
        <LocalePicker />
        <DarkModeToggle />
      </Flex>
      <Stack gap="md" className="w-full max-w-sm">
        {/* The mark sits centred over the form whatever the product hands in. */}
        <span className="mx-auto text-foreground">{brand}</span>
        <Outlet />
      </Stack>
    </Flex>
  );
}
