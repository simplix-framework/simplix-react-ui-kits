/** The mechanical things a form does to its values on the way to the DTO. */
export interface DeclaredFields {
  /** Text fields whose surrounding space is not part of the value. */
  readonly trim?: readonly string[];
  /**
   * Fields where an empty box means「not given」rather than the empty string.
   *
   * <p>Applied after {@link DeclaredFields.trim}, so a box holding only spaces is not given either.
   */
  readonly emptyToUndefined?: readonly string[];
  /** Form-only state — a picker's open tab, a confirmation checkbox — that is not a DTO field. */
  readonly omit?: readonly string[];
}

/**
 * The form's values as the DTO takes them, declared rather than retyped field by field.
 *
 * <p><b>Writing the field list a second time is how a value silently stops being sent.</b> A submit
 * handler that hands the mutation `{ holidayName: values.holidayName, … }` has restated every field
 * the record has, and a key left out of that literal is a value that never leaves the browser — the
 * request still answers 200 and the form, which reads its own state back, shows what the operator
 * typed. That is how a translation map came to be dropped on ten screens at once.
 *
 * <p><b>The CRUD forms declare this to `useCrudFormSubmit` and never call this.</b> What calls it is
 * a screen that writes through its mutation directly — a record page whose save is awaited, a
 * wizard step — where the framework's own declaration is out of reach. The shapes and the order
 * are the framework's, so the two say the same thing: tidy each value, then decide which empty
 * boxes mean「not given」, then drop the form's own state.
 *
 * <p>Everything not named passes through untouched, which is what makes the copies disappear rather
 * than move.
 *
 * @param values what the form holds
 * @param fields what happens to the ones that are not simply copied
 * @returns the values as the DTO takes them
 */
export function preparedValues(
  values: Record<string, unknown>,
  fields: DeclaredFields,
): Record<string, unknown> {
  const prepared: Record<string, unknown> = { ...values };
  for (const name of fields.trim ?? []) {
    const value = prepared[name];
    if (typeof value === "string") prepared[name] = value.trim();
  }
  for (const name of fields.emptyToUndefined ?? []) {
    if (prepared[name] === "" || prepared[name] === null) prepared[name] = undefined;
  }
  for (const name of fields.omit ?? []) delete prepared[name];
  return prepared;
}
