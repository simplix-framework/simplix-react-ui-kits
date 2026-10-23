/**
 * The window widths this console draws differently at.
 *
 * <p>Here rather than beside the phone shell that reads them, because both layers ask: the shell
 * decides which chrome a window gets, and a layout pattern decides whether the shape it draws has
 * room. Written twice they would drift, and the symptom would be a screen whose chrome says phone
 * while its content says desktop.
 */

/**
 * The width at or below which the console is on a phone.
 *
 * <p>Below the board's tablet, which is 768 wide. A window narrower than that cannot hold the area
 * row, the menu column and a screen beside each other — what it gets instead is the same console
 * with one screen at a time and the areas along the bottom, which is what the phone frames draw.
 */
export const PHONE_WINDOW = "(max-width: 767px)";

/** A reader who has asked for less movement. */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
