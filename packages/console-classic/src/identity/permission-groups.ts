import { useCallback } from "react";

import { useOptionalTranslation } from "../i18n";
import { PACKAGE_NAMESPACE } from "./locales";

/**
 * Resolves a permission group to the name this console calls it by.
 *
 * <p>The server names its groups as constants — `PAYMENT_LEDGER`, `BACKOFFICE_ACCESS` — because
 * that is what `@PreAuthorize` compares. Those constants reached the screens verbatim: a refused
 * page told the operator it needed `PAYMENT_LEDGER · 목록 조회`, and the permission catalogue
 * listed the same constant as the row's own name. An operator cannot ask an administrator for a
 * constant they have never seen anywhere else in the product.
 *
 * <p>Every surface that shows a group reads it through here, so the catalogue, the role grid, and
 * the refusal page cannot end up calling one group three things.
 *
 * @returns a resolver taking the group constant and, optionally, the name the catalogue stored for
 *          it — used for a group this build has no word for, such as one an operator added
 */
export function usePermissionGroupName() {
  const { tOr } = useOptionalTranslation(PACKAGE_NAMESPACE + "/features");

  return useCallback(
    (code: string | null | undefined, stored?: string | null) => {
      if (!code) return stored ?? "";
      // A group with no entry here is one this build does not know — an operator-defined row, or a
      // group added to the server since. Its stored name is the only word anybody chose for it,
      // and the constant the server compares is better than a label invented on the spot.
      return tOr(`permissionGroup.${code}`, stored && stored !== code ? stored : code);
    },
    [tOr],
  );
}
