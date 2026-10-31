import { useCan } from "@simplix-react/access/react";

/** What an operation requires of the caller, in the shape SimpliX Meta's access output states it. */
export type OperationAccess =
  | { readonly kind: "permission"; readonly group: string; readonly action: string }
  | { readonly kind: "authenticated" }
  | { readonly kind: "public" }
  | { readonly kind: "expression"; readonly raw: string };

const HAS_PERMISSION = /hasPermission\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/;

/**
 * The permission an operation's rule names, or `undefined` where it names none.
 *
 * <p>An expression rule is read for its first `hasPermission('<group>', '<action>')` term: an
 * expression that also admits the record's owner admits every holder of that permission, so the
 * term is the floor a control can be gated on. An expression with no such term gates nothing here;
 * the server still refuses the call.
 */
export function permissionOf(rule: OperationAccess | undefined): { readonly group: string; readonly action: string } | undefined {
  if (!rule) return undefined;
  if (rule.kind === "permission") return { group: rule.group, action: rule.action };
  if (rule.kind !== "expression") return undefined;
  const match = HAS_PERMISSION.exec(rule.raw);
  return match ? { group: match[1] ?? "", action: match[2] ?? "" } : undefined;
}

/**
 * Whether the reader may call the operation a control leads to, from the operation's generated
 * access rule (`create<Entity>Access`), so a generated screen gates its controls on exactly what
 * the server enforces and never on a group typed into the screen.
 */
export function useAllowed(rule: OperationAccess | undefined): boolean {
  const permission = permissionOf(rule);
  const allowed = useCan(permission?.action ?? "view", permission?.group ?? "");
  return permission ? allowed : true;
}
