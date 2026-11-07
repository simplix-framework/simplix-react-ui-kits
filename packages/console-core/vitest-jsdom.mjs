import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { populateGlobal } from "vitest/runtime";

// The environment of the `*.dom.test.*` files (vitest.config.ts). The kit installs no DOM of its own: the framework checkout carries `jsdom` for its own list tests, and this package
// already reads React from that checkout (see vitest.config.ts), so the DOM is read from there too.
const frameworkUi = realpathSync(fileURLToPath(new URL("../../node_modules/@simplix-react/ui", import.meta.url)));
const { JSDOM } = createRequire(join(frameworkUi, "package.json"))("jsdom");

// Web APIs the DOM would replace with its own, which a library that reaches for them at import time
// (a map renderer's `URL.createObjectURL(new Blob())`) cannot mix with Node's. They stay Node's.
const NODE_APIS = ["Blob", "File", "FormData", "Headers", "Request", "Response", "URL", "URLSearchParams", "fetch", "AbortController", "AbortSignal", "TextEncoder", "TextDecoder", "structuredClone"];

export default {
  name: "framework-jsdom",
  viteEnvironment: "client",
  setup(global) {
    const node = Object.fromEntries(NODE_APIS.filter((name) => name in global).map((name) => [name, global[name]]));
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost:3000/", pretendToBeVisual: true });
    const { keys, originals } = populateGlobal(global, dom.window, { bindFunctions: true });
    Object.assign(global, node);
    return {
      teardown(target) {
        dom.window.close();
        for (const key of keys) delete target[key];
        for (const [key, value] of originals) target[key] = value;
      },
    };
  },
};
