import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";
import { KIT_NAME } from "../../../../testing/template-harness/lib/kit";

/**
 * A board draws every screen with the UI kit and nothing else: it imports the kit, React and
 * Storybook, and lays itself out with kit parts, never `className` or `style`. The error page frame
 * is customised to the failure the page draws, and a failure the shell draws in place of itself
 * needs an icon, a button and a window-height mount, so the kit has to offer each as a part a frame
 * may import. These tests render the frame template and compile a customised frame built only from
 * the parts the template's header names.
 */

const KIT = KIT_NAME;
const allowedImport = (specifier: string) =>
  specifier === "react" || specifier.startsWith("@storybook/") || specifier === KIT || specifier.startsWith(`${KIT}/`);

function importsOf(source: string): string[] {
  return [...source.matchAll(/^\s*import\b[^"']*?from\s*["']([^"']+)["']/gm)].map((match) => match[1] ?? "");
}

const context = { NamePascal: "Failure", storyTitle: "Failure" };

describe("the generated error page board frame", () => {
  const source = render("error-page.stories.hbs", context);

  it("imports only the kit, React and Storybook", () => {
    const imports = importsOf(source);
    expect(imports.length).toBeGreaterThan(0);
    expect(imports.filter((specifier) => !allowedImport(specifier))).toEqual([]);
  });

  it("lays itself out with no className or style", () => {
    expect(source).not.toMatch(/\b(className|style)\s*=/);
  });

  it("names the parts a customised frame is drawn with", () => {
    for (const part of ["FailurePage", "Icon", "Button", "WindowScreen", "consoleFrame"]) {
      expect(source).toContain(part);
    }
  });
});

describe("a frame for a failure the shell draws in place of itself", () => {
  const frame = join(virtualRoot, "screens", "refusal.stories.tsx");
  const customised = `
import { WindowScreen, FailurePage } from "${KIT}/error";
import { Button, Icon } from "${KIT}/screen";

export function Screen() {
  return (
    <WindowScreen>
      <FailurePage
        code="409"
        icon={<Icon name="user-x" />}
        tint="slate"
        title="Title"
        description="Description"
        actions={
          <Button>
            <Icon name="log-out" />
            Sign out
          </Button>
        }
      />
    </WindowScreen>
  );
}
`;

  it("compiles from kit parts alone", () => {
    expect(importsOf(customised).filter((specifier) => !allowedImport(specifier))).toEqual([]);
    expect(customised).not.toMatch(/\b(className|style)\s*=/);
    expect(typecheck({ [frame]: customised }, [frame])).toEqual([]);
  });
});
