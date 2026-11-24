// The readers of a product's menu module: its string tables, its relative imports and the menu
// constant itself, read as syntax and never executed.
import ts from "typescript";

/** Parses TypeScript source into a syntax tree, without type information. */
export function parse(text, name) {
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** A readable `file:line` for a node, for the error naming what could not be read. */
export function where(node, name) {
  const { line } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  return `${name}:${line + 1}`;
}

/** The expression under any `as` / `satisfies` / parentheses wrapper. */
export function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

/** The name an object property is written under, or undefined for a computed one. */
export function propertyName(property) {
  const name = property.name;
  return name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
}

/** The properties of an object literal by name; throws on a spread or a computed name. */
export function propertiesOf(node, name) {
  const object = unwrap(node);
  if (!object || !ts.isObjectLiteralExpression(object)) {
    throw new Error(`${where(node, name)}: expected an object literal`);
  }
  const found = new Map();
  for (const property of object.properties) {
    const key = ts.isPropertyAssignment(property) ? propertyName(property) : undefined;
    if (key === undefined) {
      throw new Error(`${where(property, name)}: only plain \`name: value\` properties are read`);
    }
    found.set(key, property.initializer);
  }
  return found;
}

/**
 * A string property, or undefined when absent. The value is a string literal, or `TABLE.key` where
 * `constants` holds the string values of an imported object constant `TABLE`; anything else throws.
 */
function stringProperty(properties, key, node, name, constants = new Map()) {
  const value = properties.get(key);
  if (value === undefined) return undefined;
  const literal = unwrap(value);
  if (ts.isStringLiteralLike(literal)) return literal.text;
  if (
    ts.isPropertyAccessExpression(literal) &&
    ts.isIdentifier(literal.expression) &&
    ts.isIdentifier(literal.name)
  ) {
    const found = constants.get(literal.expression.text)?.get(literal.name.text);
    if (found !== undefined) return found;
    throw new Error(
      `${where(value, name)}: \`${key}\` reads ${literal.expression.text}.${literal.name.text}, which no imported constant table holds`,
    );
  }
  throw new Error(`${where(value, name)}: \`${key}\` must be a string literal`);
}

/**
 * The exported object constants of a module whose every value is a string literal, by name:
 * `export const ROUTES = { users: "/users" } as const` reads as `ROUTES -> { users -> "/users" }`.
 * Constants holding anything else are left out.
 *
 * @param {string} text the module's source
 * @param {string} name the file name, for messages
 */
export function readStringTables(text, name) {
  const source = parse(text, name);
  const tables = new Map();
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    for (const declaration of statement.declarationList.declarations) {
      const object = unwrap(declaration.initializer);
      if (!ts.isIdentifier(declaration.name) || !object || !ts.isObjectLiteralExpression(object)) continue;
      const values = new Map();
      let plain = true;
      for (const property of object.properties) {
        const key = ts.isPropertyAssignment(property) ? propertyName(property) : undefined;
        const literal = key === undefined ? undefined : unwrap(property.initializer);
        if (key === undefined || !literal || !ts.isStringLiteralLike(literal)) {
          plain = false;
          break;
        }
        values.set(key, literal.text);
      }
      if (plain) tables.set(declaration.name.text, values);
    }
  }
  return tables;
}

/**
 * The relative modules a source imports names from, as `{ from, names }` with each local name and
 * the name it is exported under, so a caller can read those modules and hand their tables back.
 *
 * @param {string} text the module's source
 * @param {string} name the file name, for messages
 */
export function readRelativeImports(text, name) {
  const source = parse(text, name);
  const found = [];
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const from = statement.moduleSpecifier.text;
    const bindings = statement.importClause?.namedBindings;
    if (!from.startsWith(".") || !bindings || !ts.isNamedImports(bindings)) continue;
    if (statement.importClause.isTypeOnly) continue;
    const names = bindings.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => ({
        local: element.name.text,
        exported: (element.propertyName ?? element.name).text,
      }));
    if (names.length > 0) found.push({ from, names });
  }
  return found;
}

/** An identifier property (an icon), or undefined when absent. */
function identifierProperty(properties, key, name) {
  const value = properties.get(key);
  if (value === undefined) return undefined;
  const identifier = unwrap(value);
  if (!ts.isIdentifier(identifier)) {
    throw new Error(`${where(value, name)}: \`${key}\` must be an identifier`);
  }
  return identifier.text;
}

/** The initializer of a top-level `const <variable>`. */
function constInitializer(source, variable, name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === variable &&
        declaration.initializer
      ) {
        return declaration.initializer;
      }
    }
  }
  throw new Error(`${name}: no \`const ${variable}\``);
}

/**
 * The app's menu: its groups with their entries, and the account entry drawn after them.
 *
 * @param {string} text the menu module's source
 * @param {string} name the file name, for messages
 * @param {{ menu: string, account: string }} variables the names of the two constants
 * @param {Map<string, Map<string, string>>} constants string tables of imported object constants, by
 *   local name, for an `href` written as `TABLE.key`
 */
export function readMenu(
  text,
  name,
  variables = { menu: "ADMIN_MENU", account: "ACCOUNT_ENTRY" },
  constants = new Map(),
) {
  const source = parse(text, name);
  const list = unwrap(constInitializer(source, variables.menu, name));
  if (!ts.isArrayLiteralExpression(list)) {
    throw new Error(`${where(list, name)}: \`${variables.menu}\` must be an array literal`);
  }
  const groups = list.elements.map((groupNode) => {
    const group = propertiesOf(groupNode, name);
    const entries = unwrap(group.get("entries") ?? groupNode);
    if (!ts.isArrayLiteralExpression(entries)) {
      throw new Error(`${where(groupNode, name)}: a group needs an \`entries\` array literal`);
    }
    return {
      key:
        stringProperty(group, "key", groupNode, name) ??
        fail(groupNode, name, "a group needs a `key`"),
      icon:
        identifierProperty(group, "icon", name) ?? fail(groupNode, name, "a group needs an `icon`"),
      entries: entries.elements.map((entryNode) => {
        const entry = propertiesOf(entryNode, name);
        return {
          key:
            stringProperty(entry, "key", entryNode, name) ??
            fail(entryNode, name, "an entry needs a `key`"),
          icon:
            identifierProperty(entry, "icon", name) ??
            fail(entryNode, name, "an entry needs an `icon`"),
          href: stringProperty(entry, "href", entryNode, name, constants),
        };
      }),
    };
  });
  const account = propertiesOf(constInitializer(source, variables.account, name), name);
  return {
    groups,
    account: {
      key:
        stringProperty(account, "key", undefined, name) ??
        fail(list, name, "the account entry needs a `key`"),
      icon:
        identifierProperty(account, "icon", name) ??
        fail(list, name, "the account entry needs an `icon`"),
    },
  };
}

function fail(node, name, message) {
  throw new Error(`${where(node, name)}: ${message}`);
}
