import type { ReactNode } from "react";

interface WideFieldProps {
  /** The one field that takes the whole row. */
  readonly children: ReactNode;
}

/**
 * A field that takes both columns of a {@link SettingsSection}.
 *
 * <p><b>For a value whose length has nothing to do with the field beside it</b> — an address, a
 * list of scopes, a reason. Laid in half a row it truncates at a width chosen for a checkbox, and
 * the reader opens the record to read a value the form was already showing.
 */
export function WideField({ children }: WideFieldProps) {
  return <div className="col-span-full">{children}</div>;
}
