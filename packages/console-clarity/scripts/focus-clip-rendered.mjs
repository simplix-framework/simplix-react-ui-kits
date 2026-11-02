// The rendered check for a clipped focus ring. `probe` runs inside a page (any driver's evaluate),
// focuses every focusable element in turn, reads the ring it draws (box-shadow and outline while
// `:focus-visible`) and compares the ring's rectangle with every ancestor that clips: an element whose
// `overflow` is not `visible`, `contain: paint`, and the viewport. A ring side that reaches past the
// clip rectangle by one pixel or more is a finding. `compare` turns a reading into report lines and
// `census` counts the findings by the part that clips, so the owner of each is visible. A product's
// runner signs in, opens each screen, calls both and prints the report; this file names no product and
// no route.
//
//   node scripts/focus-clip-rendered.mjs --selftest   (drives a fixture page through ego-browser)
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Runs in the page. Self-contained so a driver can serialise it. Press a real Tab first (the driver's
 * keyboard, not a synthetic event): only a trusted key press makes a later scripted `focus()` match
 * `:focus-visible`, and `focusVisibleHeld` in the result says whether it did.
 *
 * @param {{ tolerance?: number, root?: string, limit?: number }} options
 * `tolerance` is the overshoot in pixels that counts (default 1), `root` the selector of the parts the scan is
 * limited to (default the whole document), `limit` the findings kept (default 400).
 */
export function probe(options = {}) {
  const tolerance = options.tolerance ?? 1;
  const limit = options.limit ?? 400;
  const scopes = options.root ? [...document.querySelectorAll(options.root)] : [document];
  if (scopes.length === 0) return { missing: options.root };

  const FOCUSABLE = [
    "button",
    "a[href]",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[contenteditable=true]",
    "[tabindex]:not([tabindex='-1'])",
    "[role=button]",
    "[role=tab]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=option]",
    "[role=switch]",
    "[role=checkbox]",
    "[role=radio]",
    "[role=link]",
    "[role=combobox]",
    "[role=treeitem]",
  ].join(",");

  const px = (value) => parseFloat(value) || 0;
  const describe = (el) => {
    const slot = el.getAttribute("data-slot");
    const label = el.getAttribute("aria-label") || (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24);
    const role = el.getAttribute("role");
    const type = el.tagName === "INPUT" && el.type !== "text" ? `:${el.type}` : "";
    return `${el.tagName.toLowerCase()}${type}${slot ? `[${slot}]` : role ? `[role=${role}]` : ""}${label ? ` "${label}"` : ""}`;
  };
  const ownerKey = (el) => {
    if (el === document.documentElement) return "viewport";
    const slot = el.getAttribute("data-slot");
    if (slot) return slot;
    const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2).join(".");
    return el.tagName.toLowerCase() + (cls ? `.${cls}` : "");
  };

  /** The ring a focused element draws, as the distance past each side of its border box. */
  const ringOf = (cs) => {
    const ext = { left: 0, right: 0, top: 0, bottom: 0 };
    const topLevel = (text) => {
      const parts = [];
      let depth = 0;
      let from = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "(") depth++;
        else if (text[i] === ")") depth--;
        else if (text[i] === "," && depth === 0) {
          parts.push(text.slice(from, i));
          from = i + 1;
        }
      }
      parts.push(text.slice(from));
      return parts.map((part) => part.trim()).filter(Boolean);
    };
    if (cs.boxShadow && cs.boxShadow !== "none") {
      for (const shadow of topLevel(cs.boxShadow)) {
        if (/\binset\b/.test(shadow)) continue;
        // A shadow whose colour is fully transparent draws nothing.
        if (/(rgba|hsla)\([^)]*,\s*0\)/.test(shadow) || /\/\s*0\)/.test(shadow)) continue;
        const lengths = (shadow.replace(/[a-z-]+\([^)]*\)/gi, "").match(/-?\d*\.?\d+(?=px)/g) || []).map(Number);
        const [x = 0, y = 0, blur = 0, spread = 0] = lengths;
        const reach = blur + spread;
        ext.left = Math.max(ext.left, reach - x);
        ext.right = Math.max(ext.right, reach + x);
        ext.top = Math.max(ext.top, reach - y);
        ext.bottom = Math.max(ext.bottom, reach + y);
      }
    }
    // The browser's own `auto` outline is judged as a missing design, not as a ring with a width.
    if (cs.outlineStyle !== "none" && cs.outlineStyle !== "auto" && px(cs.outlineWidth) > 0) {
      const reach = Math.max(0, px(cs.outlineWidth) + px(cs.outlineOffset));
      for (const side of Object.keys(ext)) ext[side] = Math.max(ext[side], reach);
    }
    return ext;
  };

  /** Whether `node` is the containing block of an absolutely positioned descendant. */
  const holdsAbsolute = (cs) =>
    cs.position !== "static" || cs.transform !== "none" || cs.filter !== "none" || cs.perspective !== "none" || /paint|layout|strict|content/.test(cs.contain || "");

  /** The clip box one ancestor gives, per axis, or null where it clips nothing. */
  const clipBox = (node, cs) => {
    const clipsX = cs.overflowX !== "visible";
    const clipsY = cs.overflowY !== "visible";
    const paints = /paint|strict|content/.test(cs.contain || "");
    if (!clipsX && !clipsY && !paints) return null;
    const rect = node.getBoundingClientRect();
    let left = rect.left + node.clientLeft;
    let top = rect.top + node.clientTop;
    let right = left + node.clientWidth;
    let bottom = top + node.clientHeight;
    // overflow: clip draws up to its margin past the padding box (or the box the keyword names).
    if (cs.overflowX === "clip" || cs.overflowY === "clip") {
      const margin = px((cs.overflowClipMargin || "").split(/\s+/).find((word) => /^-?[\d.]+px$/.test(word)));
      if (/border-box/.test(cs.overflowClipMargin || "")) {
        left = rect.left;
        top = rect.top;
        right = rect.right;
        bottom = rect.bottom;
      }
      if (cs.overflowX === "clip") {
        left -= margin;
        right += margin;
      }
      if (cs.overflowY === "clip") {
        top -= margin;
        bottom += margin;
      }
    }
    return { left, top, right, bottom, x: clipsX || paints, y: clipsY || paints };
  };

  const viewport = { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: document.documentElement.clientHeight };

  /** The tightest clip edge per side that the element sits inside, and the part that gives it. */
  const clipsOf = (el, cs) => {
    const edges = {
      left: { at: viewport.left, by: document.documentElement },
      right: { at: viewport.right, by: document.documentElement },
      top: { at: viewport.top, by: document.documentElement },
      bottom: { at: viewport.bottom, by: document.documentElement },
    };
    if (cs.position === "fixed") return edges;
    let needsHolder = cs.position === "absolute";
    for (let node = el.parentElement; node && node !== document.documentElement; node = node.parentElement) {
      const nodeStyle = getComputedStyle(node);
      if (needsHolder && !holdsAbsolute(nodeStyle)) continue;
      const box = clipBox(node, nodeStyle);
      if (box) {
        if (box.x) {
          if (box.left > edges.left.at) edges.left = { at: box.left, by: node };
          if (box.right < edges.right.at) edges.right = { at: box.right, by: node };
        }
        if (box.y) {
          if (box.top > edges.top.at) edges.top = { at: box.top, by: node };
          if (box.bottom < edges.bottom.at) edges.bottom = { at: box.bottom, by: node };
        }
      }
      if (needsHolder) needsHolder = nodeStyle.position === "absolute";
      if (nodeStyle.position === "fixed") break;
    }
    return edges;
  };

  const out = { scanned: 0, noRing: 0, ringless: [], tokenOnly: 0, focusVisibleHeld: null, ring: { left: 0, right: 0, top: 0, bottom: 0 }, findings: [], truncated: false };
  const initial = document.activeElement;
  const tokenRing = (() => {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;box-shadow:var(--focus-halo, none)";
    document.body.appendChild(holder);
    const ring = ringOf(getComputedStyle(holder));
    holder.remove();
    return ring;
  })();

  for (const el of new Set(scopes.flatMap((scope) => [...scope.querySelectorAll(FOCUSABLE), ...(scope instanceof Element && scope.matches(FOCUSABLE) ? [scope] : [])]))) {
    if (el.disabled || el.getAttribute("aria-disabled") === "true" || el.inert) continue;
    if (typeof el.checkVisibility === "function" && !el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })) continue;
    // A control hidden from assistive technology (a measuring copy) is not one the keyboard reaches.
    if (el.closest("[aria-hidden=true]")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    // The ring's transition would hand back its starting value; read it settled.
    const kept = el.style.transition;
    el.style.transition = "none";
    el.focus({ preventScroll: true });
    if (document.activeElement !== el) {
      el.style.transition = kept;
      continue;
    }
    const focusVisible = el.matches(":focus-visible");
    if (out.focusVisibleHeld === null) out.focusVisibleHeld = focusVisible;
    const cs = getComputedStyle(el);
    let ring = ringOf(cs);
    if (!focusVisible) {
      ring = tokenRing;
      out.tokenOnly += 1;
    }
    el.style.transition = kept;
    out.scanned += 1;
    if (ring.left + ring.right + ring.top + ring.bottom < 0.5) {
      if (cs.outlineStyle === "auto") {
        // No design ring, so the browser draws its default one: it follows no token and is cut by any clip too.
        if (out.findings.length < limit) out.findings.push({ kind: "unstyled", element: describe(el), id: el.id || null, side: "all", overshoot: 0, owner: ownerKey(el), ownerText: describe(el), ownerOverflow: "", ownerClass: (el.getAttribute("class") || "").slice(0, 160) });
        continue;
      }
      out.noRing += 1;
      if (out.ringless.length < 40) out.ringless.push(describe(el));
      continue;
    }
    for (const side of Object.keys(out.ring)) out.ring[side] = Math.max(out.ring[side], ring[side]);
    const edges = clipsOf(el, cs);
    const halo = { left: rect.left - ring.left, right: rect.right + ring.right, top: rect.top - ring.top, bottom: rect.bottom + ring.bottom };
    const sides = [];
    // A side counts only where the element itself is inside the clip: an element scrolled out is not a ring problem.
    if (rect.left >= edges.left.at - 0.5 && edges.left.at - halo.left >= tolerance) sides.push(["left", edges.left.at - halo.left, edges.left.by]);
    if (rect.right <= edges.right.at + 0.5 && halo.right - edges.right.at >= tolerance) sides.push(["right", halo.right - edges.right.at, edges.right.by]);
    if (rect.top >= edges.top.at - 0.5 && edges.top.at - halo.top >= tolerance) sides.push(["top", edges.top.at - halo.top, edges.top.by]);
    if (rect.bottom <= edges.bottom.at + 0.5 && halo.bottom - edges.bottom.at >= tolerance) sides.push(["bottom", halo.bottom - edges.bottom.at, edges.bottom.by]);
    const push = (finding) => {
      if (out.findings.length >= limit) out.truncated = true;
      else out.findings.push(finding);
    };
    for (const [side, by, node] of sides) {
      const nodeStyle = getComputedStyle(node);
      push({
        kind: "clipped",
        element: describe(el),
        id: el.id || null,
        side,
        overshoot: Math.round(by * 10) / 10,
        owner: ownerKey(node),
        ownerText: describe(node),
        ownerOverflow: `${nodeStyle.overflowX}/${nodeStyle.overflowY}`,
        ownerClass: (node.getAttribute("class") || "").slice(0, 160),
      });
    }
    // The ring is also lost where a later or higher sibling paints a background over it. A control
    // that is itself under something (scrolled below a fixed bar) has no ring to judge.
    const centre = document.elementFromPoint(
      Math.min(Math.max(rect.left + rect.width / 2, 0), viewport.right - 1),
      Math.min(Math.max(rect.top + rect.height / 2, 0), viewport.bottom - 1),
    );
    const visibleItself = centre !== null && (el.contains(centre) || centre.contains(el));
    for (const side of visibleItself ? ["left", "right", "top", "bottom"] : []) {
      if (ring[side] < 1) continue;
      const reach = ring[side];
      const at = (d) => {
        if (side === "left") return [rect.left - d, rect.top + rect.height / 2];
        if (side === "right") return [rect.right + d, rect.top + rect.height / 2];
        if (side === "top") return [rect.left + rect.width / 2, rect.top - d];
        return [rect.left + rect.width / 2, rect.bottom + d];
      };
      for (const d of [Math.min(1, reach / 2), reach - 0.5]) {
        const [x, y] = at(d);
        if (x < 0 || y < 0 || x >= viewport.right || y >= viewport.bottom) continue;
        const hit = document.elementFromPoint(x, y);
        if (!hit || el.contains(hit) || hit.contains(el)) continue;
        const common = (() => {
          for (let n = el.parentElement; n; n = n.parentElement) if (n.contains(hit)) return n;
          return document.documentElement;
        })();
        // The first node on the way up from the hit that paints a background is what covers the ring.
        let painter = null;
        for (let n = hit; n && n !== common; n = n.parentElement) {
          const s = getComputedStyle(n);
          const alpha = (s.backgroundColor.match(/rgba?\([^)]*?,\s*([\d.]+)\)$/) || [])[1];
          if ((s.backgroundColor !== "rgba(0, 0, 0, 0)" && (alpha === undefined || parseFloat(alpha) >= 0.05)) || s.backgroundImage !== "none") {
            painter = n;
            break;
          }
        }
        // A tooltip or popover opened by the focus itself is anchored on the control and draws over its edge by design.
        if (!painter || painter.closest("[role=tooltip], [data-slot^=tooltip], [data-radix-popper-content-wrapper]")) continue;
        const stackOf = (node) => {
          let z = 0;
          for (let n = node; n && n !== common; n = n.parentElement) {
            const s = getComputedStyle(n);
            // A parent drawn with `display: contents` hands its children to the grandparent's layout.
            let holder = n.parentElement;
            while (holder && getComputedStyle(holder).display === "contents") holder = holder.parentElement;
            const placed = s.position !== "static" || (holder !== null && /flex|grid/.test(getComputedStyle(holder).display));
            if (s.zIndex !== "auto" && placed) z = parseInt(s.zIndex, 10) || 0;
          }
          return z;
        };
        const above = stackOf(painter) > stackOf(el) || (stackOf(painter) === stackOf(el) && Boolean(el.compareDocumentPosition(painter) & Node.DOCUMENT_POSITION_FOLLOWING));
        if (!above) continue;
        push({ kind: "covered", element: describe(el), id: el.id || null, side, overshoot: Math.round((reach - d) * 10) / 10, owner: ownerKey(painter), ownerText: describe(painter), ownerOverflow: "", ownerClass: (painter.getAttribute("class") || "").slice(0, 160) });
        break;
      }
    }
  }
  const active = document.activeElement;
  if (active && active !== document.body) active.blur();
  if (initial && initial !== document.body && initial.isConnected) initial.focus({ preventScroll: true });
  return out;
}

/** Report lines for one reading; an empty array means every ring fits. */
export function compare(reading) {
  if (!reading) return ["no reading"];
  if (reading.missing) return [`the scan root ${reading.missing} is not on the page`];
  const lines = [];
  for (const f of reading.findings ?? []) lines.push(f.kind === "unstyled" ? `${f.element}: draws the browser default focus ring, no design ring` : f.kind === "covered" ? `${f.element}: ring painted over on the ${f.side} by ${f.owner} (${f.ownerText})` : `${f.element}: ring cut on the ${f.side} by ${f.overshoot}px by ${f.owner} (${f.ownerText})`);
  if (reading.truncated) lines.push("more findings than the probe keeps");
  return lines;
}

/** Findings counted by the part that clips and the side, so the owners are visible: [[key, count, sides]] by count. */
export function census(readings) {
  const owners = new Map();
  for (const reading of readings) {
    for (const f of reading?.findings ?? []) {
      const key = f.kind === "covered" ? `over:${f.owner}` : f.kind === "unstyled" ? `unstyled:${f.owner}` : f.owner;
      const entry = owners.get(key) ?? { count: 0, sides: {}, sample: f.element };
      entry.count += 1;
      entry.sides[f.side] = (entry.sides[f.side] ?? 0) + 1;
      owners.set(key, entry);
    }
  }
  return [...owners.entries()].map(([key, v]) => [key, v.count, v.sides, v.sample]).sort((a, b) => b[1] - a[1]);
}

/** The fixture the self-test drives: each case names the finding sides it must produce, `[]` for a miss. */
const FIXTURE = {
  css: `
    body { margin: 40px; font: 14px sans-serif; }
    .box { width: 220px; height: 60px; margin: 20px 0; background: #eee; }
    input, button { box-sizing: border-box; width: 100%; height: 32px; border: 1px solid #888; outline: none; }
    input:focus-visible, button:focus-visible { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #0b7a73; }
    .inset:focus-visible { box-shadow: inset 0 0 0 2px #0b7a73; }
    .row { display: flex; gap: 2px; margin: 20px 0; }
    .row button { width: 60px; background: #ddd; }
    .row.ghost button { background: transparent; }
    .row.raise button:focus-visible { position: relative; z-index: 1; }
  `,
  html: `
    <div class="box" style="overflow:auto"><input id="auto-flush"></div>
    <div class="box" style="overflow:auto;padding:4px"><input id="auto-gutter"></div>
    <div class="box" style="overflow:hidden;padding:2px"><input id="hidden-partial"></div>
    <div class="box" style="overflow:clip;overflow-clip-margin:4px"><input id="clip-margin"></div>
    <div class="box" style="overflow:hidden;position:relative"><button id="abs-inside" style="position:absolute;left:0;top:14px;width:100px">a</button></div>
    <div class="box" style="overflow:hidden"><div style="position:relative"><button id="abs-in-holder" style="position:absolute;left:20px;top:14px;width:100px">a</button></div></div>
    <div class="box" style="overflow:hidden"><div><button id="abs-escapes" style="position:absolute;left:300px;top:100px;width:100px">a</button></div></div>
    <div class="box" style="overflow:hidden;padding:0"><input class="inset" id="inset-ring"></div>
    <div class="box" style="overflow:hidden;padding:4px 0"><input id="x-only"></div>
    <div class="row"><button id="cv-a">a</button><button id="cv-b">b</button></div>
    <div class="row ghost"><button id="gh-a">a</button><button id="gh-b">b</button></div>
    <div class="row"><a href="#u" id="ua-ring" style="outline:auto;display:inline-block">u</a></div>
    <div class="row raise"><button id="rz-a">a</button><button id="rz-b">b</button></div>
    <div class="row raise"><span style="display:contents"><button id="dc-a">a</button></span><span style="display:contents"><button id="dc-b">b</button></span></div>
  `,
  expect: {
    "auto-flush": ["left", "right", "top"],
    "auto-gutter": [],
    "hidden-partial": ["left", "right", "top"],
    "clip-margin": [],
    "abs-inside": ["left"],
    "abs-in-holder": [],
    "abs-escapes": [],
    "inset-ring": [],
    "x-only": ["left", "right"],
    "cv-a": ["covered-right"],
    "cv-b": [],
    "gh-a": [],
    "gh-b": [],
    "ua-ring": ["unstyled-all"],
    "rz-a": [],
    "rz-b": [],
    "dc-a": [],
    "dc-b": [],
  },
};

function selftest() {
  const script = `
const task = await taskSpace("focus-clip-selftest-" + ${process.pid});
const page = task.page("p1");
await page.goto("about:blank");
await page.evaluate(({ css, html }) => { document.head.innerHTML = "<style>" + css + "</style>"; document.body.innerHTML = html; }, ${JSON.stringify({ css: FIXTURE.css, html: FIXTURE.html })});
await page.keyboard.press("Tab");
const reading = await page.evaluate((${probe.toString()}), {});
await task.finish({ keep: [] });
console.log("FOCUS_CLIP_SELFTEST " + JSON.stringify(reading));
`;
  const run = spawnSync("ego-browser", ["nodejs"], { input: script, encoding: "utf8" });
  const marker = "FOCUS_CLIP_SELFTEST ";
  const printed = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const at = printed.indexOf(marker);
  if (run.status !== 0 || at < 0) {
    console.error(`focus-clip selftest FAILED: the browser run did not finish (exit ${run.status})\n${printed.slice(0, 1200)}`);
    process.exit(2);
  }
  const reading = JSON.parse(printed.slice(at + marker.length).split("\n")[0]);
  const problems = [];
  if (reading.focusVisibleHeld !== true) problems.push(`the scripted focus did not match :focus-visible (focusVisibleHeld ${reading.focusVisibleHeld}), so the ring was not read`);
  const expected = Object.entries(FIXTURE.expect);
  const sidesBy = new Map();
  for (const f of reading.findings) sidesBy.set(f.id, [...(sidesBy.get(f.id) ?? []), f.kind === "covered" || f.kind === "unstyled" ? `${f.kind}-${f.side}` : f.side]);
  for (const [id, sides] of expected) {
    const got = (sidesBy.get(id) ?? []).sort();
    if (JSON.stringify(got) !== JSON.stringify(sides)) problems.push(`${id}: expected sides [${sides}], got [${got}]`);
  }
  const ok = problems.length === 0;
  console.log(ok ? `focus-clip selftest: ${expected.filter(([, s]) => s.length).length} hit and ${expected.filter(([, s]) => !s.length).length} miss cases hold` : `focus-clip selftest FAILED\n${problems.join("\n")}`);
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes("--selftest")) selftest();
