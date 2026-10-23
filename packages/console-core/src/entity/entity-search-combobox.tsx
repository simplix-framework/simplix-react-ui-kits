import { FormFields, Text } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import type { EntitySearch } from "@simplix-react/ui";
import { entitySearchMoreStyle } from "./entity-search-combobox.style";
import { partAttributes } from "@simplix-react/ui/design";

interface EntitySearchComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The search state a {@link createEntitySearch} hook returns. */
  search: EntitySearch;
  error?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  /** Disables the picker, e.g. while a prerequisite selection is missing. */
  disabled?: boolean;
  /**
   * Control rendered on the trailing side of the input, on the same row. Use for
   * an action button paired with the picker — it stays aligned with the input
   * while description and error render below at full width.
   */
  suffixControl?: React.ReactNode;
  /** Layout class merged onto the field, e.g. a grid span in a two-column form. */
  className?: string;
}

/**
 * Searchable FK picker over a directory too large to batch-load: what the operator
 * types is debounced and answered by the server, so a row past the first page is
 * still reachable. When the server holds more matches than the page shows, the list
 * says so instead of ending silently — the failure this replaces was a picker that
 * simply had no entry for a row that exists.
 *
 * <p>Pair it with a {@link createEntitySearch} hook, which keeps the current value's
 * label resolved whether or not that row is in the latest result page. For a bounded
 * catalogue use {@link EntityCombobox} instead — one request, filtered in the browser.
 */
export function EntitySearchCombobox({ label, value, onChange, search, error, placeholder, description, required, disabled, suffixControl, className }: EntitySearchComboboxProps) {
  const { t } = useTranslation("simplix/ui");

  return (
    <FormFields.ComboboxField
      label={label}
      value={value || null}
      onChange={(v) => onChange(v ?? "")}
      options={search.options}
      serverSearch
      onSearch={search.onSearch}
      loading={search.loading}
      error={error}
      placeholder={placeholder}
      description={description}
      required={required}
      disabled={disabled}
      suffixControl={suffixControl}
      className={className}
      footer={
        search.hasMore ? (
          <Text as="span" size="caption" tone="muted" {...partAttributes(entitySearchMoreStyle, {})}>
            {t("field.moreResults")}
          </Text>
        ) : undefined
      }
    />
  );
}
