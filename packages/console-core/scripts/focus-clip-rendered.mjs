// The rendered check for the keyboard focus ring. `probe` runs inside a page (any driver's evaluate),
// focuses every focusable element in turn and judges two things:
//   1. the ring is drawn: focusing the control adds a box-shadow layer (outward or inset) or an outline
//      that the control did not draw before, in a colour that differs from the ground it is painted on,
//      on a control that is not transparent while focused. A control that draws none is a `ringless`
//      finding, with its cause, its part path and its styles before and after focus, unless it matches
//      an allowed equivalent (ALLOWED_EQUIVALENTS: another affordance that shows the focus, each with
//      its reason);
//   2. the ring fits: its rectangle is compared with every ancestor that clips (an element whose
//      `overflow` is not `visible`, `contain: paint`, the viewport) and with siblings painted over it.
//      A ring side that reaches past the clip rectangle by one pixel or more is a finding.
// `compare` turns a reading into report lines, `census` counts the findings by owner, and `ringlessTable`
// groups the ringless controls by part and cause. A product's runner signs in, opens each screen, calls
// them and prints the report; this file names no product and no route.
//
//   node scripts/focus-clip-rendered.mjs --selftest   (drives a fixture page through ego-browser)
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Affordances that show the keyboard focus without a ring on the focused control itself. Each is matched
 * by `selector` against the focused control (any control where it is absent) and, where `via` is given,
 * only when that affordance was measured on the page: `ancestor` means a box around the control gained a
 * visible ring on focus (`:focus-within`), `descendant` that a part inside the control did.
 */
export const ALLOWED_EQUIVALENTS = [
  {
    id: "frame-ring",
    via: "ancestor",
    reason: "the field's frame (a number stepper, a multi-select box, a search field) draws the ring around the whole field through :focus-within, so the ring encloses the focused input and the parts that belong to it",
  },
  {
    id: "palette-field",
    selector: "[data-slot=console-palette-field] input",
    reason: "the command palette's search field holds the keys for as long as the palette stands open, so the open panel and the caret say where focus is; a ring inside the panel reads as a second border (command-palette.style.ts)",
  },
];

/**
 * Runs in the page. Self-contained so a driver can serialise it. Press a real Tab first (the driver's
 * keyboard, not a synthetic event): only a trusted key press makes a later scripted `focus()` match
 * `:focus-visible`, and `focusVisibleHeld` in the result says whether it did.
 *
 * @param {{ tolerance?: number, root?: string, limit?: number, allow?: { id: string, selector?: string, via?: string, reason: string }[] }} options
 * `tolerance` is the overshoot in pixels that counts (default 1), `root` the selector of the parts the scan is
 * limited to (default the whole document), `limit` the findings kept (default 400), `allow` the equivalents
 * accepted in place of a ring (pass ALLOWED_EQUIVALENTS; none when absent).
 */
export function probe(options = {}) {
  const tolerance = options.tolerance ?? 1;
  const limit = options.limit ?? 400;
  const allow = options.allow ?? [];
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

  /** The part a control belongs to: the marked ancestors (data-slot, data-part) from the outside in, then the control. */
  const pathOf = (el) => {
    const marks = [];
    for (let n = el.parentElement; n && n !== document.body && marks.length < 5; n = n.parentElement) {
      const mark = n.getAttribute("data-slot") || n.getAttribute("data-part");
      if (mark && marks[0] !== mark) marks.unshift(mark);
    }
    return marks;
  };
  const selfMark = (el) => {
    const slot = el.getAttribute("data-slot") || el.getAttribute("data-part");
    const variant = el.getAttribute("data-variant");
    const role = el.getAttribute("role");
    return `${el.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${variant ? `[${variant}]` : ""}${!slot && role ? `[role=${role}]` : ""}`;
  };
  const IMPLICIT_ROLES = { BUTTON: "button", A: "link", SELECT: "combobox", TEXTAREA: "textbox", SUMMARY: "button" };
  const roleOf = (el) => {
    const explicit = el.getAttribute("role");
    if (explicit) return explicit;
    if (el.tagName === "INPUT") return { checkbox: "checkbox", radio: "radio", range: "slider", button: "button", submit: "button", search: "searchbox" }[el.type] ?? "textbox";
    return IMPLICIT_ROLES[el.tagName] ?? el.tagName.toLowerCase();
  };
  const nameOf = (el) => {
    const byId = (el.getAttribute("aria-labelledby") || "")
      .split(/\s+/)
      .map((id) => (id ? document.getElementById(id)?.textContent : ""))
      .join(" ")
      .trim();
    const label = el.labels?.[0]?.textContent;
    return (el.getAttribute("aria-label") || byId || label || el.getAttribute("title") || el.getAttribute("placeholder") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48);
  };

  /** The style a ring can be drawn with, as text, for the before and after columns of the report. */
  const look = (cs) => ({ boxShadow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, borderColor: cs.borderTopColor, background: cs.backgroundColor });

  /** The layers a style draws around or inside its box: each shadow and the outline, with colour and reach. */
  const layersOf = (cs) => {
    const layers = [];
    if (cs.boxShadow && cs.boxShadow !== "none") {
      let depth = 0;
      let from = 0;
      const text = cs.boxShadow;
      const parts = [];
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "(") depth++;
        else if (text[i] === ")") depth--;
        else if (text[i] === "," && depth === 0) {
          parts.push(text.slice(from, i).trim());
          from = i + 1;
        }
      }
      parts.push(text.slice(from).trim());
      for (const shadow of parts) {
        const color = (shadow.match(/(?:rgba?|hsla?|oklab|oklch|lab|lch|color)\([^)]*\)/i) || [])[0] || "currentcolor";
        const lengths = (shadow.replace(/[a-z-]+\([^)]*\)/gi, "").match(/-?\d*\.?\d+(?=px)/g) || []).map(Number);
        const [, , blur = 0, spread = 0] = lengths;
        layers.push({ key: shadow, kind: /\binset\b/.test(shadow) ? "inset" : "shadow", color, reach: Math.max(0, blur + spread) });
      }
    }
    if (cs.outlineStyle !== "none" && cs.outlineStyle !== "auto" && px(cs.outlineWidth) > 0) layers.push({ key: `outline ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} ${cs.outlineOffset}`, kind: "outline", color: cs.outlineColor, reach: px(cs.outlineWidth) });
    return layers;
  };
  /** The layers a node draws itself and through its ::before and ::after (a grip, a track), where those are shown. */
  const layersAll = (node) => [
    ...layersOf(getComputedStyle(node)),
    ...["::before", "::after"].flatMap((pseudo) => {
      const ps = getComputedStyle(node, pseudo);
      if (ps.content === "none" || ps.content === "normal" || ps.display === "none" || parseFloat(ps.opacity) < 0.5) return [];
      return layersOf(ps).map((layer) => ({ ...layer, key: `${pseudo} ${layer.key}`, pseudo }));
    }),
  ];

  /**
   * The style rules that match a focused control and set its ring (box-shadow, outline or the halo
   * variable), in cascade order as the sheets list them, so a ringless control names the rule that took
   * its ring away. A sheet from another origin cannot be read and is skipped.
   */
  const RING_PROPS = ["box-shadow", "--tw-shadow", "--tw-ring-shadow", "outline", "outline-style", "outline-width", "--focus-halo"];
  const ringRules = (el) => {
    const found = [];
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule && !matchMedia(rule.conditionText).matches) continue;
        if (rule instanceof CSSStyleRule) {
          let matches = false;
          try {
            matches = !rule.selectorText.includes("&") && el.matches(rule.selectorText);
          } catch (error) {
            if (!(error instanceof DOMException)) throw error;
          }
          if (matches && !/^\*/.test(rule.selectorText)) {
            const set = RING_PROPS.filter((prop) => rule.style.getPropertyValue(prop) !== "").map((prop) => `${prop}: ${rule.style.getPropertyValue(prop).trim()}${rule.style.getPropertyPriority(prop) ? " !important" : ""}`);
            if (set.length) found.push({ selector: rule.selectorText.slice(0, 160), set: set.join("; ").slice(0, 200) });
          }
        }
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      let rules = null;
      try {
        rules = sheet.cssRules;
      } catch (error) {
        if (!(error instanceof DOMException)) throw error;
      }
      if (rules) walk(rules);
    }
    return found;
  };
  /** The cause a ringless control's own rules give: a focus rule that lost, a rule that removes the shadow or the outline. */
  const causeFromRules = (all) => {
    // The universal rule that seeds every element's shadow variables is the default, not a cause.
    const rules = all.filter((r) => !/^\*/.test(r.selector) && !/^:root/.test(r.selector));
    const focusRule = rules.find((r) => /:focus/.test(r.selector) && /box-shadow|--tw-shadow|--tw-ring-shadow|outline-width|outline:/.test(r.set) && !/box-shadow: none|--tw-shadow: 0 0 #0000|outline: none|outline-style: none/.test(r.set));
    const removing = rules.filter((r) => /box-shadow: none|--tw-shadow: 0 0 #0000/.test(r.set));
    if (focusRule && removing.length) return `a focus ring rule loses to "${removing[removing.length - 1].selector}"`;
    if (removing.length) return `shadow-none removes the halo ("${removing[removing.length - 1].selector}")`;
    const outline = rules.find((r) => /outline: none|outline-style: none|outline: 2px solid transparent/.test(r.set));
    if (outline && !focusRule) return `outline removed, no ring in its place ("${outline.selector}")`;
    return null;
  };

  // One pixel to composite colours on, so a ring colour of any syntax (oklab, color-mix, alpha) is
  // compared with the ground it is painted on as the pixel the reader sees.
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ink = canvas.getContext("2d", { willReadFrequently: true });
  const paint = (colors) => {
    ink.globalCompositeOperation = "copy";
    ink.fillStyle = "#ffffff";
    ink.fillRect(0, 0, 1, 1);
    ink.globalCompositeOperation = "source-over";
    for (const color of colors) {
      ink.fillStyle = "#ffffff";
      ink.fillStyle = color;
      ink.fillRect(0, 0, 1, 1);
    }
    return [...ink.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const luminance = ([r, g, b]) => {
    const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  /** The backgrounds under a point of `node`, from the page up to `node` itself, as colours to composite. */
  const groundsUnder = (node, includeSelf) => {
    const stack = [];
    for (let n = includeSelf ? node : node.parentElement; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        stack.unshift(bg);
        if (!/rgba|\/|transparent/.test(bg)) break;
      }
    }
    return stack;
  };
  /** A layer is seen when the pixel it paints differs from the ground beneath it. */
  const judgeLayer = (node, layer) => {
    // An inset ring and a ring a pseudo-element draws are painted over the node's own background.
    const ground = groundsUnder(node, layer.kind === "inset" || Boolean(layer.pseudo));
    const base = paint(ground);
    const ring = paint([...ground, layer.color]);
    const diff = Math.max(...base.map((c, i) => Math.abs(c - ring[i])));
    return { seen: layer.reach >= 1 && diff >= 12, contrast: contrast(base, ring) };
  };
  const opacityOf = (el) => {
    let value = 1;
    for (let n = el; n; n = n.parentElement) value *= parseFloat(getComputedStyle(n).opacity);
    return value;
  };
  // A control a script or a pointer reaches but Tab does not is not judged, except inside a group that
  // moves focus with the arrow keys (Radix tabs, radio groups, toolbars, menus give the inactive members
  // tabindex -1): those members are reached by the keyboard and need a ring like any other.
  const ROVING = "[role=tablist], [role=radiogroup], [role=toolbar], [role=listbox], [role=menu], [role=menubar], [role=grid], [role=tree]";

  const out = { scanned: 0, noRing: 0, allowed: [], notTabbable: 0, ringKinds: {}, tokenOnly: 0, focusVisibleHeld: null, ring: { left: 0, right: 0, top: 0, bottom: 0 }, findings: [], truncated: false };
  const initial = document.activeElement;
  const tokenRing = (() => {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;box-shadow:var(--focus-halo, none)";
    document.body.appendChild(holder);
    const ring = ringOf(getComputedStyle(holder));
    holder.remove();
    return ring;
  })();
  // Transitions would hand back their starting values (a ring fading in, a strip revealed by
  // :focus-within); every style is read settled while the probe runs.
  const settled = document.createElement("style");
  settled.textContent = "*, *::before, *::after { transition: none !important; }";
  document.head.appendChild(settled);

  for (const el of new Set(scopes.flatMap((scope) => [...scope.querySelectorAll(FOCUSABLE), ...(scope instanceof Element && scope.matches(FOCUSABLE) ? [scope] : [])]))) {
    if (el.disabled || el.getAttribute("aria-disabled") === "true" || el.inert) continue;
    if (typeof el.checkVisibility === "function" && !el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })) continue;
    // A control hidden from assistive technology (a measuring copy) is not one the keyboard reaches.
    if (el.closest("[aria-hidden=true]")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    if (el.tabIndex < 0 && !el.closest(ROVING)) {
      out.notTabbable += 1;
      continue;
    }
    // The styles before focus, of the control, the boxes around it and the parts inside it.
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    const around = [];
    for (let n = el.parentElement; n && n !== document.body && around.length < 3; n = n.parentElement) around.push(n);
    const inside = [...el.querySelectorAll("*")].slice(0, 24);
    const beforeLook = look(getComputedStyle(el));
    const beforeKeys = new Set(layersAll(el).map((l) => l.key));
    const keysAround = around.map((n) => new Set(layersAll(n).map((l) => l.key)));
    const keysInside = inside.map((n) => new Set(layersAll(n).map((l) => l.key)));
    el.focus({ preventScroll: true });
    if (document.activeElement !== el) continue;
    const focusVisible = el.matches(":focus-visible");
    if (out.focusVisibleHeld === null) out.focusVisibleHeld = focusVisible;
    const cs = getComputedStyle(el);
    let ring = ringOf(cs);
    if (!focusVisible) {
      ring = tokenRing;
      out.tokenOnly += 1;
    }
    out.scanned += 1;

    // Judge the ring the focus added: a layer the control did not draw before, seen against its ground.
    if (focusVisible) {
      const added = layersAll(el).filter((layer) => !beforeKeys.has(layer.key));
      const judged = added.map((layer) => ({ layer, ...judgeLayer(el, layer) }));
      const seen = judged.filter((j) => j.seen);
      const opacity = opacityOf(el);
      const gained = (nodes, keys) => nodes.find((n, i) => layersAll(n).some((layer) => !keys[i].has(layer.key) && judgeLayer(n, layer).seen));
      const ancestor = seen.length === 0 ? gained(around, keysAround) : undefined;
      const descendant = seen.length === 0 && !ancestor ? gained(inside, keysInside) : undefined;
      if (seen.length > 0 && opacity >= 0.5) {
        for (const kind of new Set(seen.map((j) => j.layer.kind))) out.ringKinds[kind] = (out.ringKinds[kind] ?? 0) + 1;
      } else {
        const via = opacity < 0.5 ? undefined : ancestor ? "ancestor" : descendant ? "descendant" : undefined;
        const equivalent = allow.find((entry) => (!entry.selector || el.matches(entry.selector)) && (!entry.via || entry.via === via) && (entry.selector || entry.via));
        if (equivalent) {
          out.allowed.push({ element: describe(el), equivalent: equivalent.id, by: via === "ancestor" ? selfMark(ancestor) : via === "descendant" ? selfMark(descendant) : null });
          out.ringKinds[`equivalent:${equivalent.id}`] = (out.ringKinds[`equivalent:${equivalent.id}`] ?? 0) + 1;
        } else if (cs.outlineStyle === "auto" && added.length === 0) {
          // No design ring, so the browser draws its default one: it follows no token and is cut by any clip too.
          if (out.findings.length < limit) out.findings.push({ kind: "unstyled", element: describe(el), id: el.id || null, side: "all", overshoot: 0, owner: ownerKey(el), ownerText: describe(el), ownerOverflow: "", ownerClass: (el.getAttribute("class") || "").slice(0, 160) });
          continue;
        } else {
          const cls = el.getAttribute("class") || "";
          const rules = ringRules(el);
          const cause =
            opacity < 0.5
              ? "transparent while focused"
              : judged.length > 0
                ? "ring colour equals the ground"
                : via
                  ? `ring drawn on the ${via} only`
                  : causeFromRules(rules) ?? (/(^|\s)(?:[\w-]+:)*shadow-none(\s|$)/.test(cls)
                    ? "shadow-none removes the halo"
                    : /(^|\s)(?:[\w-]+:)*outline-(?:none|hidden)(\s|$)/.test(cls)
                      ? "outline removed, no ring in its place"
                      : "no focus style");
          out.noRing += 1;
          const path = pathOf(el);
          const finding = {
            kind: "ringless",
            element: describe(el),
            id: el.id || null,
            side: "all",
            overshoot: 0,
            cause,
            part: `${path.slice(-2).join(" > ")}${path.length ? " > " : ""}${selfMark(el)}`,
            path: [...path, selfMark(el)].join(" > "),
            name: nameOf(el),
            role: roleOf(el),
            opacity: Math.round(opacity * 100) / 100,
            contrast: judged.length ? Math.max(...judged.map((j) => j.contrast)) : null,
            before: beforeLook,
            after: look(cs),
            rules: rules.slice(-6),
            owner: selfMark(el),
            ownerText: describe(el),
            ownerOverflow: "",
            ownerClass: cls.slice(0, 200),
          };
          if (out.findings.length >= limit) out.truncated = true;
          else out.findings.push(finding);
          continue;
        }
      }
    }
    if (ring.left + ring.right + ring.top + ring.bottom < 0.5) continue;
    for (const side of Object.keys(out.ring)) out.ring[side] = Math.max(out.ring[side], ring[side]);
    const edges = clipsOf(el, cs);
    const halo = { left: rect.left - ring.left, right: rect.right + ring.right, top: rect.top - ring.top, bottom: rect.bottom + ring.bottom };
    const sides = [];
    // A side counts only where the element itself is inside the clip (an element scrolled out is not a ring
    // problem) and where the part that clips cannot scroll further that way: a control resting on the edge
    // of a scroll box with more content past it shows its whole ring once the box is scrolled.
    const scrollsOn = (node, side) => {
      const box = node === document.documentElement ? document.scrollingElement ?? node : node;
      const ns = getComputedStyle(box);
      const scrolls = (axis) => box === document.scrollingElement || /auto|scroll/.test(axis === "x" ? ns.overflowX : ns.overflowY);
      if (side === "top") return scrolls("y") && box.scrollTop > 0.5;
      if (side === "bottom") return scrolls("y") && box.scrollHeight - box.clientHeight - box.scrollTop > 0.5;
      if (side === "left") return scrolls("x") && box.scrollLeft > 0.5;
      return scrolls("x") && box.scrollWidth - box.clientWidth - box.scrollLeft > 0.5;
    };
    if (rect.left >= edges.left.at - 0.5 && edges.left.at - halo.left >= tolerance && !scrollsOn(edges.left.by, "left")) sides.push(["left", edges.left.at - halo.left, edges.left.by]);
    if (rect.right <= edges.right.at + 0.5 && halo.right - edges.right.at >= tolerance && !scrollsOn(edges.right.by, "right")) sides.push(["right", halo.right - edges.right.at, edges.right.by]);
    if (rect.top >= edges.top.at - 0.5 && edges.top.at - halo.top >= tolerance && !scrollsOn(edges.top.by, "top")) sides.push(["top", edges.top.at - halo.top, edges.top.by]);
    if (rect.bottom <= edges.bottom.at + 0.5 && halo.bottom - edges.bottom.at >= tolerance && !scrollsOn(edges.bottom.by, "bottom")) sides.push(["bottom", halo.bottom - edges.bottom.at, edges.bottom.by]);
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
        // A point the parts around the control clip away is not painted over by anything: it is not drawn.
        if (x < edges.left.at || x > edges.right.at || y < edges.top.at || y > edges.bottom.at) continue;
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
  settled.remove();
  if (initial && initial !== document.body && initial.isConnected) initial.focus({ preventScroll: true });
  return out;
}

/** Report lines for one reading; an empty array means every control draws a ring and every ring fits. */
export function compare(reading) {
  if (!reading) return ["no reading"];
  if (reading.missing) return [`the scan root ${reading.missing} is not on the page`];
  const lines = [];
  if (reading.scanned > 0 && reading.focusVisibleHeld !== true) lines.push("the scripted focus did not match :focus-visible, so no ring was read (press a real key before the probe)");
  for (const f of reading.findings ?? [])
    lines.push(
      f.kind === "unstyled"
        ? `${f.element}: draws the browser default focus ring, no design ring`
        : f.kind === "ringless"
          ? `${f.element}: no visible focus ring (${f.cause}) at ${f.path}`
          : f.kind === "covered"
            ? `${f.element}: ring painted over on the ${f.side} by ${f.owner} (${f.ownerText})`
            : `${f.element}: ring cut on the ${f.side} by ${f.overshoot}px by ${f.owner} (${f.ownerText})`,
    );
  if (reading.truncated) lines.push("more findings than the probe keeps");
  return lines;
}

/**
 * The ringless controls of several readings grouped by part and cause, largest group first, each with
 * the names and roles it holds and the styles of its first control before and after focus.
 * @param {{ label?: string, reading: any }[]} readings
 */
export function ringlessTable(readings) {
  const groups = new Map();
  for (const { label, reading } of readings) {
    for (const f of reading?.findings ?? []) {
      if (f.kind !== "ringless") continue;
      const key = `${f.part}\u0000${f.cause}`;
      const group = groups.get(key) ?? { part: f.part, cause: f.cause, count: 0, where: new Set(), controls: new Set(), path: f.path, before: f.before, after: f.after, contrast: f.contrast, opacity: f.opacity, ownerClass: f.ownerClass, rules: f.rules ?? [] };
      group.count += 1;
      if (label) group.where.add(label);
      group.controls.add(`${f.role} "${f.name}"`);
      groups.set(key, group);
    }
  }
  return [...groups.values()].map((g) => ({ ...g, where: [...g.where], controls: [...g.controls] })).sort((a, b) => b.count - a.count);
}

/** The ringless table as printable lines, unfiltered. */
export function ringlessLines(table) {
  const lines = [];
  for (const g of table) {
    lines.push(`${g.count}x  ${g.part}  [${g.cause}]`);
    lines.push(`      path    ${g.path}`);
    lines.push(`      controls ${g.controls.join(", ")}`);
    if (g.where.length) lines.push(`      where   ${g.where.join(", ")}`);
    lines.push(`      before  shadow ${g.before.boxShadow} | outline ${g.before.outline} | border ${g.before.borderColor} | bg ${g.before.background}`);
    lines.push(`      after   shadow ${g.after.boxShadow} | outline ${g.after.outline} | border ${g.after.borderColor} | bg ${g.after.background}`);
    if (g.contrast !== null || g.opacity < 1) lines.push(`      ring contrast ${g.contrast ?? "-"} | opacity ${g.opacity}`);
    lines.push(`      class   ${g.ownerClass}`);
    for (const rule of g.rules) lines.push(`      rule    ${rule.selector} { ${rule.set} }`);
  }
  return lines;
}

/** Findings counted by the part that clips and the side, so the owners are visible: [[key, count, sides]] by count. */
export function census(readings) {
  const owners = new Map();
  for (const reading of readings) {
    for (const f of reading?.findings ?? []) {
      const key = f.kind === "covered" ? `over:${f.owner}` : f.kind === "unstyled" ? `unstyled:${f.owner}` : f.kind === "ringless" ? `ringless:${f.part} [${f.cause}]` : f.owner;
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
    .row.flat button:focus-visible { box-shadow: none; }
    .row.ground { background: #dddddd; }
    .row.ground button { background: #dddddd; border-color: #dddddd; }
    .row.ground button:focus-visible { box-shadow: 0 0 0 3px #dddddd; }
    .row.soft button:focus-visible { box-shadow: inset 0 0 0 3px #0b7a73; }
    .row.reveal { opacity: 0; transition: opacity 2s; }
    .row.reveal:focus-within { opacity: 1; }
    .row.frame { border: 1px solid #888; }
    .row.frame input { width: 120px; border: 0; }
    .row.frame input:focus-visible { box-shadow: none; }
    .row.frame:focus-within { box-shadow: 0 0 0 3px #0b7a73; }
    .row .grip { position: relative; }
    .row .grip:focus-visible { box-shadow: none; }
    .row .grip::before { content: ""; position: absolute; inset: 8px; opacity: 0; }
    .row .grip:focus-visible::before { opacity: 1; box-shadow: 0 0 0 3px #0b7a73; }
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
    <div class="row"><button id="rl-none" style="outline:none;box-shadow:none">n</button><button id="rl-kit">k</button></div>
    <div class="row flat"><button id="rl-flat">f</button></div>
    <div class="row"><button id="rl-standing" style="box-shadow:0 0 0 3px #0b7a73">s</button></div>
    <div class="row ground"><button id="rl-ground">g</button></div>
    <div class="row soft"><button id="rl-inset">i</button></div>
    <div class="row" style="opacity:0"><button id="rl-hidden">h</button></div>
    <div class="row reveal"><button id="rl-reveal">r</button></div>
    <div class="row frame"><input id="rl-frame"></div>
    <div class="row"><input id="rl-allowed" data-slot="probe-fixture-allowed" style="box-shadow:none"></div>
    <div class="row"><button id="rl-grip" class="grip">p</button></div>
    <div class="box" style="overflow:auto;height:60px;padding:0 4px"><div style="height:200px;padding-top:28px"><button id="sc-more">m</button></div></div>
    <div class="box" style="overflow:auto;height:60px;padding:0 4px"><div style="height:60px;padding-top:28px;box-sizing:border-box"><button id="sc-end">e</button></div></div>
    <div style="position:fixed;right:20px;top:20px;display:flex;flex-direction:column;width:120px"><div style="overflow:auto;height:40px;padding:0 4px"><div style="height:120px;padding-top:14px"><button id="sc-under">u</button></div></div><div style="height:20px;background:#ccc"></div></div>
    <div class="row"><button id="rl-untabbable" tabindex="-1" style="box-shadow:none">u</button></div>
    <div class="row" role="tablist"><button role="tab" id="rl-tab" tabindex="-1" style="box-shadow:none">t</button></div>
  `,
  allow: [{ id: "fixture-allowed", selector: "[data-slot=probe-fixture-allowed]", reason: "the self-test's own equivalent, matched by selector" }],
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
    // The ring judgement: a control that draws no ring, or one nobody sees, is a hit.
    "rl-none": ["ringless-all"],
    "rl-kit": [],
    "rl-flat": ["ringless-all"],
    "rl-standing": ["ringless-all"],
    "rl-ground": ["ringless-all"],
    "rl-inset": [],
    "rl-hidden": ["ringless-all"],
    "rl-reveal": [],
    "rl-frame": [],
    "rl-allowed": [],
    "rl-grip": [],
    // A ring at the edge of a scroll box with more content past it is reached by scrolling; at the end it is cut.
    "sc-more": [],
    "sc-end": ["bottom"],
    "sc-under": [],
    "rl-untabbable": [],
    "rl-tab": ["ringless-all"],
  },
  // The cause each ringless case must be given (its start: a rule's cause goes on to name the rule).
  causes: {
    "rl-none": "no focus style",
    "rl-flat": "a focus ring rule loses to",
    "rl-standing": "no focus style",
    "rl-ground": "ring colour equals the ground",
    "rl-hidden": "transparent while focused",
    "rl-tab": "no focus style",
  },
};

function selftest() {
  const script = `
const task = await taskSpace("focus-clip-selftest-" + ${process.pid});
const page = task.page("p1");
await page.goto("about:blank");
await page.evaluate(({ css, html }) => { document.head.innerHTML = "<style>" + css + "</style>"; document.body.innerHTML = html; }, ${JSON.stringify({ css: FIXTURE.css, html: FIXTURE.html })});
await page.keyboard.press("Tab");
const reading = await page.evaluate((${probe.toString()}), ${JSON.stringify({ allow: [...ALLOWED_EQUIVALENTS, ...FIXTURE.allow] })});
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
  for (const f of reading.findings) sidesBy.set(f.id, [...(sidesBy.get(f.id) ?? []), f.kind === "clipped" ? f.side : `${f.kind}-${f.side}`]);
  for (const [id, sides] of expected) {
    const got = (sidesBy.get(id) ?? []).sort();
    if (JSON.stringify(got) !== JSON.stringify(sides)) problems.push(`${id}: expected sides [${sides}], got [${got}]`);
  }
  for (const [id, cause] of Object.entries(FIXTURE.causes)) {
    const got = reading.findings.find((f) => f.id === id && f.kind === "ringless")?.cause;
    if (!got?.startsWith(cause)) problems.push(`${id}: expected the cause "${cause}", got "${got}"`);
  }
  // Every control was read in its focus-visible state, not only the first.
  if (reading.tokenOnly !== 0) problems.push(`${reading.tokenOnly} control(s) were focused without matching :focus-visible`);
  if (reading.notTabbable !== 1) problems.push(`expected 1 control left out as unreachable by Tab, got ${reading.notTabbable}`);
  const allowedIds = reading.allowed.map((a) => a.equivalent).sort();
  if (JSON.stringify(allowedIds) !== JSON.stringify(["fixture-allowed", "frame-ring"])) problems.push(`expected the frame ring and the fixture's selector to stand in for a ring, got ${JSON.stringify(reading.allowed)}`);
  const ok = problems.length === 0;
  console.log(ok ? `focus-clip selftest: ${expected.filter(([, s]) => s.length).length} hit and ${expected.filter(([, s]) => !s.length).length} miss cases hold` : `focus-clip selftest FAILED\n${problems.join("\n")}`);
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes("--selftest")) selftest();
