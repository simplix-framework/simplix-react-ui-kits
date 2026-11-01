// The rendered half of the list column rule (README, "List columns"). `probe` runs inside a page
// (any driver's evaluate) and reads a list table as painted: the drawn headers in order, the one
// the rows are sorted by, and whether the table is wider than its pane. `probeMenu` reads the open
// columns menu. `compare` judges one reading against the rule. A product's runner signs in, opens
// a list at each width, opens the columns menu, and passes the column the list is sorted by (a
// dropped column carries no mark, so the page cannot say it); this file names no product, route or
// column.
//   node scripts/list-columns-rendered.mjs --selftest

/**
 * Runs in the page. Returns { mode, headers, sorted, overflow }: `mode` is "table" or "cards",
 * `headers` the labels of the drawn columns in order (the action column has none), `sorted` the
 * labels of the columns marked as the sort, and `overflow` whether the table is wider than the
 * element that holds it. Self-contained so a driver can serialise it.
 */
export function probe(root = "main") {
  const scope = document.querySelector(root);
  if (!scope) return { missing: root };
  const table = scope.querySelector("table");
  if (!table) return { mode: "cards", headers: [], sorted: [], overflow: false };
  const heads = [...table.querySelectorAll("thead th")];
  const label = (th) => th.innerText.trim();
  const host = table.parentElement;
  return {
    mode: "table",
    headers: heads.map(label).filter(Boolean),
    sorted: heads.filter((th) => th.querySelector("[data-sorted=true]")).map(label),
    overflow: host ? host.scrollWidth > host.clientWidth + 1 : false,
  };
}

/** Runs in the page with the columns menu open. Returns [{ label, checked }] in the menu's order. */
export function probeMenu() {
  return [...document.querySelectorAll("[role=menuitemcheckbox]")].map((item) => ({
    label: item.innerText.trim(),
    checked: item.getAttribute("aria-checked") === "true",
  }));
}

/**
 * The ways one reading breaks the column rule, as strings; empty when it holds.
 * `reading` is { name, width, mode, headers, sorted, overflow, menu, sortLabel }.
 *
 * The rule: the leading column and the column the rows are sorted by are always drawn, the row
 * actions belong to the table, the other columns drop from the end as the pane narrows, and the
 * columns menu offers every column, drawn or not.
 */
export function compare(reading) {
  const { name, width, mode, headers, sorted, overflow, menu, sortLabel } = reading;
  const at = `${name} at ${width}px`;
  if (mode !== "table") return [];
  const problems = [];
  const labels = menu.map((entry) => entry.label);
  const lead = labels[0];
  if (lead !== undefined && headers[0] !== lead) problems.push(`${at}: the leading column "${lead}" is not the first one drawn`);
  if (sortLabel) {
    if (!labels.includes(sortLabel)) problems.push(`${at}: the list is sorted by "${sortLabel}", which the columns menu does not offer`);
    if (!headers.includes(sortLabel)) problems.push(`${at}: the list is sorted by "${sortLabel}", which is not drawn`);
    else if (!sorted.includes(sortLabel)) problems.push(`${at}: "${sortLabel}" is drawn but not marked as the sort`);
  }
  for (const header of headers) if (!labels.includes(header)) problems.push(`${at}: "${header}" is drawn but the columns menu does not offer it`);
  for (const entry of menu) {
    const drawn = headers.includes(entry.label);
    if (entry.checked !== drawn) problems.push(`${at}: "${entry.label}" is ${drawn ? "drawn" : "not drawn"} and the columns menu shows it ${entry.checked ? "checked" : "unchecked"}`);
  }
  // Past the lead and the sort column, what is drawn is a prefix of the field order.
  const rest = menu.filter((entry, index) => index > 0 && entry.label !== sortLabel);
  const firstDropped = rest.findIndex((entry) => !headers.includes(entry.label));
  if (firstDropped >= 0) {
    const later = rest.slice(firstDropped).find((entry) => headers.includes(entry.label));
    if (later) problems.push(`${at}: "${later.label}" is drawn after "${rest[firstDropped].label}" was dropped, so the columns do not drop from the end`);
  }
  if (overflow) problems.push(`${at}: the table is wider than its pane`);
  return problems;
}

if (process.argv.includes("--selftest")) {
  const menu = (drawn, labels = ["Name", "Kind", "Vendor", "Model", "Credits", "Cost", "Outcome", "Occurred"]) => labels.map((label) => ({ label, checked: drawn.includes(label) }));
  const reading = (drawn, over = {}) => ({
    name: "list",
    width: 1024,
    mode: "table",
    headers: drawn,
    sorted: drawn.includes("Occurred") ? ["Occurred"] : [],
    overflow: false,
    menu: menu(drawn),
    sortLabel: "Occurred",
    ...over,
  });
  const good = [
    reading(["Name", "Kind", "Vendor", "Model", "Occurred"]),
    reading(["Name", "Kind", "Vendor", "Model", "Credits", "Cost", "Occurred"]),
    reading(["Name", "Kind", "Vendor", "Model", "Credits", "Cost", "Outcome", "Occurred"]),
    reading([], { mode: "cards", headers: [], menu: [] }),
    reading(["Name", "Kind", "Vendor", "Model", "Credits"], { sortLabel: undefined, sorted: [] }),
  ];
  // A hit per way the rule can break; each is the form `compare` must refuse.
  const bad = {
    "the sort column dropped": reading(["Name", "Kind", "Vendor", "Model", "Credits", "Cost"], { sorted: [] }),
    "the sort column not marked": reading(["Name", "Kind", "Vendor", "Model", "Occurred"], { sorted: [] }),
    "the sort column absent from the menu": reading(["Name", "Kind", "Vendor", "Model"], { sorted: [], menu: menu(["Name", "Kind", "Vendor", "Model"], ["Name", "Kind", "Vendor", "Model", "Credits"]) }),
    "a drawn column the menu does not offer": reading(["Name", "Kind", "Vendor", "Model", "Occurred"], { menu: menu(["Name", "Kind", "Vendor", "Model"], ["Name", "Kind", "Vendor", "Model", "Occurred"].filter((label) => label !== "Vendor")) }),
    "a drawn column the menu shows unchecked": reading(["Name", "Kind", "Occurred"], { menu: menu(["Name", "Kind"]) }),
    "a dropped column the menu shows checked": reading(["Name", "Kind", "Occurred"], { menu: menu(["Name", "Kind", "Cost", "Occurred"]) }),
    "the lead dropped": reading(["Kind", "Vendor", "Model", "Occurred"]),
    "columns not dropped from the end": reading(["Name", "Kind", "Vendor", "Model", "Cost", "Occurred"]),
    "a table wider than its pane": reading(["Name", "Kind", "Vendor", "Model", "Occurred"], { overflow: true }),
  };
  const missed = good.flatMap((r) => compare(r).map((p) => `miss: ${p}`));
  const hits = Object.entries(bad).filter(([, r]) => compare(r).length === 0).map(([label]) => `no hit for ${label}`);
  const ok = missed.length === 0 && hits.length === 0;
  console.log(ok ? `list-columns-rendered selftest: hit ${Object.keys(bad).length}, miss 0` : `list-columns-rendered selftest FAILED\n${[...missed, ...hits].join("\n")}`);
  process.exit(ok ? 0 : 1);
}
