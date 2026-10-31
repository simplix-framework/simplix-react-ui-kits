import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { writeRememberedWidths } from "./detail-width-memory";
import { memoryPresentationStorage, writeRememberedPresentation, useDetailPresentationSetting, type DetailPresentationSetting, type PresentationStorage } from "./presentation-memory";

/** Renders the hook once under an installation default and returns what it handed the page. */
function settingUnder(detailPresentation: "panel" | "drawer" | "dialog", storage: PresentationStorage): DetailPresentationSetting {
  let seen: DetailPresentationSetting | undefined;
  function Probe() {
    seen = useDetailPresentationSetting({ storage });
    return null;
  }
  renderToStaticMarkup(createElement(UIProvider, { defaults: { detailPresentation }, children: createElement(Probe) }));
  if (!seen) throw new Error("the probe did not render");
  return seen;
}

describe("useDetailPresentationSetting", () => {
  it("starts from the installation default when the browser remembers nothing", () => {
    const setting = settingUnder("drawer", memoryPresentationStorage());
    expect(setting.presentation).toBe("drawer");
    expect(setting.presentationSwitch.value).toBe("drawer");
  });

  it("starts from the remembered choice over the installation default", () => {
    const storage = memoryPresentationStorage();
    writeRememberedPresentation(storage, "dialog");
    const setting = settingUnder("drawer", storage);
    expect(setting.presentation).toBe("dialog");
    expect(setting.presentationSwitch.remember).toBe(true);
  });

  it("does not report remembering when nothing was saved", () => {
    expect(settingUnder("panel", memoryPresentationStorage()).presentationSwitch.remember).toBe(false);
  });

  it("hands the page the widths the reader chose when the browser remembers their presentation", () => {
    const storage = memoryPresentationStorage();
    writeRememberedPresentation(storage, "drawer");
    writeRememberedWidths(storage, { drawer: 840 });
    expect(settingUnder("panel", storage).detailWidths.widths).toEqual({ drawer: 840 });
  });

  it("starts every presentation at its theme's width when the browser remembers nothing", () => {
    const storage = memoryPresentationStorage();
    writeRememberedWidths(storage, { drawer: 840 });
    expect(settingUnder("panel", storage).detailWidths.widths).toEqual({});
  });
});
