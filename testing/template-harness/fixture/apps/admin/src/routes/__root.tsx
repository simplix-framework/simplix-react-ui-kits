import { createRootRoute, Outlet } from "@tanstack/react-router";

/** The fixture app's root: every generated route is drawn under it. */
export const Route = createRootRoute({ component: Outlet });
