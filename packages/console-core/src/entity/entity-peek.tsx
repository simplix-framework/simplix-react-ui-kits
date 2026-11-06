import { Suspense, type ComponentType } from "react";
import { QueryFallback } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { DetailPeekDialog } from "../layout/detail-peek-dialog";
import type { PeekRenderProps, PeekRenderer, PeekTarget } from "../peek";

import { PACKAGE_NAMESPACE } from "./locales";

/** How one kind of record opens in a peek: its own detail screen, and the page it lives on. */
export interface EntityPeekSpec {
  /**
   * The entity's detail component, the one its own screen draws in its drawer or panel, so the
   * peek is that screen: its head, figures, sections and tabs. Pass a `lazy` import so the
   * entity's module loads when the first peek of it opens.
   */
  readonly detail: ComponentType<Record<string, string>>;
  /** The detail component's prop that takes the record's id (`creditAccountId`). */
  readonly idProp: string;
  /**
   * The route of the entity's list, which opens the record by `?id=`. Absent for an entity with no
   * page of its own: the footer then holds the close action alone.
   */
  readonly route?: string;
  /**
   * What the detail is given beside the id when it is read in a peek: the switches that withhold
   * the verbs a dialog over another screen must not offer (an account's credit adjustment).
   */
  readonly props?: Readonly<Record<string, unknown>>;
}

/** The page a record opens on: its list's route with the record opened. */
export function entityPageHref(route: string, id: string): string {
  return `${route}?id=${encodeURIComponent(id)}`;
}

function EntityPeekDialog({ spec, target, open, onOpenChange }: { readonly spec: EntityPeekSpec; readonly target: PeekTarget } & PeekRenderProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const Detail = spec.detail;
  const detailProps = { ...spec.props, [spec.idProp]: target.id } as Record<string, string>;
  return (
    <DetailPeekDialog
      open={open}
      onOpenChange={onOpenChange}
      title={target.name ?? ""}
      {...(spec.route ? { goToHref: entityPageHref(spec.route, target.id), goToLabel: t("entityPeek.goToPage") } : {})}
      closeLabel={t("entityPeek.close")}
    >
      {open ? (
        <Suspense fallback={<QueryFallback isLoading />}>
          <Detail {...detailProps} />
        </Suspense>
      ) : null}
    </DetailPeekDialog>
  );
}

/**
 * The peek of one kind of record, built from the entity's own detail screen. Every kind is opened
 * the same way: the full detail of the record in a dialog over the screen the reader is on, with
 * 「Close」 and, where the entity has a page, 「Go to page」. A change to an entity's detail screen
 * reaches its peek with nothing else to edit, since there is no second copy of it. A reference
 * inside the peek opens the next peek over this one, and closing comes back one step.
 *
 * <p>Registered by the app, which is the one place that imports every module:
 * `registerPeek("creditAccount", entityPeek({ detail: lazy(...), idProp: "creditAccountId", route: "/credit-accounts" }))`.
 * A record the peek is asked for by another field than its id (`target.by`) is not this shape;
 * such a kind keeps a dialog of its own.
 *
 * @param spec the entity's detail component, its id prop and its page
 */
export function entityPeek(spec: EntityPeekSpec): PeekRenderer {
  return (target, props) => <EntityPeekDialog spec={spec} target={target} open={props.open} onOpenChange={props.onOpenChange} />;
}
