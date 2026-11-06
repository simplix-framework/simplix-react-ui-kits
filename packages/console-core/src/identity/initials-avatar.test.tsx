import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { avatarInitials, avatarTone, InitialsAvatar } from "./initials-avatar";
import { UserAvatar, UserLabel } from "./user-avatar";

const html = (node: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(UIProvider, { children: node }));

describe("the letters an avatar shows", () => {
  it("draws a Korean name's given name", () => {
    expect(avatarInitials("김정우")).toBe("정우");
    expect(avatarInitials("남궁민수")).toBe("궁민");
  });

  it("draws the first letters of the first two words", () => {
    expect(avatarInitials("E2E Account")).toBe("EA");
    expect(avatarInitials("mira han")).toBe("MH");
  });

  it("draws the first two letters of a single word", () => {
    expect(avatarInitials("e2e-w10c-4e0462")).toBe("E2");
    expect(avatarInitials("정")).toBe("정");
  });
});

describe("one avatar for a person everywhere", () => {
  it("takes its tone from the seed, so one person has one colour", () => {
    expect(avatarTone("01a18f17-78af-7a04-89f1-d83ea4691214")).toBe(avatarTone("01a18f17-78af-7a04-89f1-d83ea4691214"));
    const one = html(createElement(InitialsAvatar, { name: "Mira Han", seed: "u-1" }));
    expect(one).toContain(`--avatar-${avatarTone("u-1")}`);
  });

  it("draws a user with no photo as their letters, never a stand-in picture", () => {
    const out = html(createElement(UserAvatar, { name: "Mira Han", userId: "u-1" }));
    expect(out).toContain('data-slot="console-initials-avatar"');
    expect(out).toContain("MH");
    expect(out).not.toContain("<img");
  });

  it("draws an uploaded photo when one is given", () => {
    const out = html(createElement(UserAvatar, { name: "Mira Han", src: "/photo.png" }));
    expect(out).toContain('<img src="/photo.png"');
  });

  it("draws a user label as the same avatar and the name", () => {
    const out = html(createElement(UserLabel, { name: "Mira Han", userId: "u-1" }));
    expect(out).toContain('data-slot="console-initials-avatar"');
    expect(out).toContain("Mira Han");
  });
});
