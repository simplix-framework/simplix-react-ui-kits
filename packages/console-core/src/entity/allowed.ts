import { useCanWith } from "@simplix-react/access/react";

/** One `hasPermission('<group>', '<action>')` term of an access expression. */
export interface PermissionTerm {
  readonly group: string;
  readonly action: string;
}

/**
 * What an operation requires of the caller, in the shape SimpliX Meta's access output states it.
 *
 * <p>An expression that is a flat chain of one `operator` also carries its `permissions` terms and
 * `residual` when a term only the server can decide (a bean call) is left over. Without them the
 * expression is opaque here.
 */
export type OperationAccess =
  | { readonly kind: "permission"; readonly group: string; readonly action: string }
  | { readonly kind: "authenticated" }
  | { readonly kind: "public" }
  | {
      readonly kind: "expression";
      readonly raw: string;
      readonly operator?: "or" | "and";
      readonly permissions?: ReadonlyArray<PermissionTerm>;
      readonly residual?: boolean;
    };

type Can = (action: string, subject: string) => boolean;

/**
 * Whether a control leading to the operation is drawn, deciding only what can be decided here.
 *
 * <ul>
 *   <li>An `or` chain is allowed when one of its permission terms holds. When none holds and a
 *   residual term is left (an ownership check, say), the control is drawn and the server decides,
 *   because that term may grant it and hiding a verb the reader is granted is the worse failure.</li>
 *   <li>An `and` chain needs every permission term; a residual term there can only narrow, and the
 *   server decides it.</li>
 *   <li>An expression without terms is opaque: the control is drawn and the server decides.</li>
 * </ul>
 */
export function decideAccess(rule: OperationAccess | undefined, can: Can): boolean {
  if (!rule) return true;
  if (rule.kind === "permission") return can(rule.action, rule.group);
  if (rule.kind !== "expression") return true;
  const terms = rule.permissions ?? [];
  if (rule.operator === "or") {
    return terms.some((term) => can(term.action, term.group)) || rule.residual !== false;
  }
  if (rule.operator === "and") return terms.every((term) => can(term.action, term.group));
  return true;
}

/**
 * The one permission a route can be guarded on, or `undefined` where the rule names none.
 *
 * <p>Only a rule that stands or falls with a single permission names one: the permission itself,
 * an `and` chain's sole term, or an `or` chain whose sole term has nothing beside it. An `or` chain
 * with a residual term may admit a reader without the permission, so it guards nothing here.
 */
export function permissionOf(rule: OperationAccess | undefined): PermissionTerm | undefined {
  if (!rule) return undefined;
  if (rule.kind === "permission") return { group: rule.group, action: rule.action };
  if (rule.kind !== "expression") return undefined;
  const terms = rule.permissions ?? [];
  if (terms.length !== 1) return undefined;
  if (rule.operator === "and" || (rule.operator === "or" && rule.residual === false)) return terms[0];
  return undefined;
}

/**
 * Whether the reader may call the operation a control leads to, from the operation's generated
 * access rule (`create<Entity>Access`), so a generated screen gates its controls on exactly what
 * the server enforces and never on a group typed into the screen.
 */
export function useAllowed(rule: OperationAccess | undefined): boolean {
  return useCanWith((can) => decideAccess(rule, can));
}
