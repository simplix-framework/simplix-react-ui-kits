import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";

/**
 * How a picker names a record that has none.
 *
 * <p><b>Never the identifier.</b> A name is nullable in most DTOs, the compiler asks for a
 * fallback, and the nearest value certainly present is the key — so a nameless row puts
 * `01a007c8-d9b3-…` in a dropdown and the reader is asked to choose between one name and one
 * UUID. The key answers nothing they can act on: they cannot tell which record it is, and picking
 * it is a guess.
 *
 * <p>Saying it has no name is honest and is something they can act on — they go and give it one.
 * The other honest answer is to leave a nameless row out of the options entirely, which is right
 * where a record without a name is not a legitimate choice; this is for the rest.
 *
 * @returns a function turning a possibly-absent name into what the option reads
 */
export function useOptionLabel(): (name: string | undefined | null) => string {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return (name) => (name && name.trim().length > 0 ? name : t("option.unnamed"));
}
