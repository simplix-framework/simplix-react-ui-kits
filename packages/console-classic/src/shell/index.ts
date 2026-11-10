import { CLASSIC_DESIGN, type Design } from "@simplix-react/ui/design";

export * from "@simplix-react-ui-kits/console-core/shell";

/**
 * The designs this kit offers: the classic design, which the shared parts' own declarations draw,
 * so a mockup's toolbar opens in the design the kit's screens are drawn in.
 */
export const KIT_DESIGNS: readonly Design[] = [CLASSIC_DESIGN];
