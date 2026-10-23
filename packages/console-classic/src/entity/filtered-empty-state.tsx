import type { ReactNode } from "react";

import { Button, EmptyState } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";

interface FilteredEmptyStateProps {
  /** Illustration for the surface this list belongs to. */
  icon?: ReactNode;
  /** How many filters the reader applied — the screen's own scope does not count. */
  filterCount: number;
  /** Drops every filter the reader applied, leaving any scope the screen forces. */
  onClear: () => void;
}

/**
 * What a list says when the reader's filters matched nothing.
 *
 * @remarks
 * "No matching items" leaves two very different situations looking identical: a ledger that is
 * genuinely empty, and a full one narrowed by conditions the reader forgot they set. Naming the
 * conditions as the cause settles which one it is, and the clear button is the way back —
 * otherwise the reader has to find and remove each condition one at a time to discover the list
 * was never empty at all.
 */
export function FilteredEmptyState({ icon, filterCount, onClear }: FilteredEmptyStateProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return (
    <EmptyState
      icon={icon}
      title={t("filteredEmpty.title")}
      size="sm"
      description={t("filteredEmpty.narrowed", { count: filterCount })}
      action={
        <Button variant="primary" size="sm" onClick={onClear}>
          {t("filteredEmpty.clearAll")}
        </Button>
      }
    />
  );
}
