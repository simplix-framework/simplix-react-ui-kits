import { useMemo } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";

/** What a generated screen calls its entity and the verbs it draws, in the reader's language. */
export interface ScreenWords {
  /** The entity's name, singular, as SimpliX Meta states it (`entity/<entity>` `_label`). */
  readonly label: string;
  /** The entity's name, plural (`entity/<entity>` `_plural`): the page title. */
  readonly plural: string;
  readonly view: string;
  readonly edit: string;
  readonly save: string;
  /** The first tab of a record that has more than one. */
  readonly overview: string;
  /** The create verb, naming the entity (「Add Job Position」). */
  readonly add: string;
  /** The edit form's title, naming the entity. */
  readonly editTitle: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly delete: string;
  /** The delete confirmation's title, naming the entity. */
  readonly deleteTitle: string;
  /** The delete confirmation's sentence, naming the record. */
  readonly deleteDescription: (name: string) => string;
  readonly cancel: string;
  readonly deleting: string;
}

/**
 * The words a generated screen draws before any screen-specific copy exists: the entity's names
 * from its domain catalog, and the kit's verbs around them.
 *
 * <p>The names are read from the namespace the field labels already live in, which the domain's
 * codegen writes from SimpliX Meta, so a screen generated for a new entity is titled in every
 * language the moment its domain is generated, and no module catalog holds a copy of the name.
 *
 * @param entity the entity as the contract names it (`jobPosition`)
 */
export function useScreenWords(entity: string): ScreenWords {
  const { t: name } = useTranslation(`entity/${entity}`);
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return useMemo(() => {
    const label = name("_label");
    const plural = name("_plural");
    return {
      label,
      plural,
      view: t("screen.view"),
      edit: t("screen.edit"),
      overview: t("screen.overview"),
      save: t("screen.save"),
      add: t("screen.add", { entity: label }),
      editTitle: t("screen.editTitle", { entity: label }),
      emptyTitle: t("screen.emptyTitle", { entities: plural }),
      emptyDescription: t("screen.emptyDescription"),
      delete: t("screen.delete"),
      deleteTitle: t("screen.deleteTitle", { entity: label }),
      deleteDescription: (record: string) => t("screen.deleteDescription", { name: record }),
      cancel: t("screen.cancel"),
      deleting: t("screen.deleting"),
    };
  }, [name, t]);
}
