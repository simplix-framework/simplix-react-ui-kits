import { describe, expect, it } from "vitest";

import { KOREAN_PARTICLES, koreanParticle, localeParticle } from "./index";

// UnreadableRecord picks the object particle of the record's noun and LiveBoard picks the "with"
// particle of the stalled source's name, both through these re-exports. A noun or source name can
// end in a Latin letter or a digit, and the framework helper decides by the sound of that last
// character, so the call sites' sentences depend on these answers.
describe("particles the console call sites pick", () => {
  it("picks the object particle of a Hangul noun by its last sound", () => {
    expect(koreanParticle("사용자", KOREAN_PARTICLES.object)).toBe("를");
    expect(koreanParticle("계정", KOREAN_PARTICLES.object)).toBe("을");
  });

  it("reads a Latin-letter name by the sound of its last letter name", () => {
    expect(koreanParticle("PDF", KOREAN_PARTICLES.object)).toBe("를");
    expect(koreanParticle("API", KOREAN_PARTICLES.with)).toBe("와");
  });

  it("reads a digit by its Korean reading", () => {
    expect(koreanParticle("3", KOREAN_PARTICLES.object)).toBe("을");
    expect(koreanParticle("3", KOREAN_PARTICLES.with)).toBe("과");
  });

  it("picks a particle only for Korean: any other locale gets an empty string", () => {
    expect(localeParticle("ko", "PDF", KOREAN_PARTICLES.with)).toBe("와");
    expect(localeParticle("en", "PDF", KOREAN_PARTICLES.with)).toBe("");
  });
});
