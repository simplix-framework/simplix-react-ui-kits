/**
 * The query meta of a record read whose failure the record itself draws.
 *
 * <p>A generated detail draws a failed read as its own danger notice, so the console's error dialog
 * leaves that read alone: told twice, the modal lands over the drawer saying what the notice under it
 * already says, and the reader dismisses one to reach the other. A read that has no state of its own
 * (an edit form's prefill, a figure, a picker's options) carries no such meta and keeps the dialog.
 * The query client reads `suppressErrorDialog`, the same flag a command that answers its own
 * refusal sets.
 */
export const RECORD_READ_META = { suppressErrorDialog: true } as const;
