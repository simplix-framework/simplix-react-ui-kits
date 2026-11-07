import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { figureValue } from "./record-contract";
import { excerptLine } from "./record-excerpt";
import { bytesText, durationText, figureSign, ratioText, signedText, withoutByteUnit } from "./record-figure";
import { RecordValueView } from "./record-value";

describe("bytesText", () => {
  it("keeps a size under a kilobyte in bytes", () => {
    expect(bytesText(512, "en")).toBe("512 byte");
  });
  it("steps up by 1024 with one decimal", () => {
    expect(bytesText(1536 * 1024, "en")).toBe("1.5 MB");
  });
  it("reads a stored string", () => {
    expect(bytesText("2048", "en")).toBe("2 kB");
  });
  it("keeps a space between the figure and its unit in Korean", () => {
    expect(bytesText(244, "ko")).toBe("244 byte");
    expect(bytesText(1536 * 1024, "ko")).toBe("1.5 MB");
  });
  it("keeps the sign of a negative size in front of the figure", () => {
    expect(bytesText(-512, "en")).toBe("-512 byte");
  });
});

describe("withoutByteUnit", () => {
  it("drops the unit a size label names in parentheses", () => {
    expect(withoutByteUnit("Size (bytes)")).toBe("Size");
    expect(withoutByteUnit("크기(바이트)")).toBe("크기");
    expect(withoutByteUnit("Payload size (KB)")).toBe("Payload size");
  });
  it("leaves a label that names no unit, or names another, as it is", () => {
    expect(withoutByteUnit("Size")).toBe("Size");
    expect(withoutByteUnit("Duration (ms)")).toBe("Duration (ms)");
    expect(withoutByteUnit("Bytes sent")).toBe("Bytes sent");
    expect(withoutByteUnit("(bytes)")).toBe("(bytes)");
  });
});

describe("durationText", () => {
  it("writes a span under a second in milliseconds", () => {
    expect(durationText(850, "en")).toBe("850 ms");
  });
  it("writes a span under a minute in seconds with one decimal", () => {
    expect(durationText(12_340, "en")).toBe("12.3 sec");
  });
  it("writes minutes and seconds past a minute", () => {
    expect(durationText(125_000, "en")).toBe("2 min 5 sec");
  });
  it("writes hours and minutes past an hour", () => {
    expect(durationText(3_660_000, "en")).toBe("1 hr 1 min");
  });
});

describe("a signed ledger amount", () => {
  it("has the sign of its value and none at zero", () => {
    expect(figureSign(500)).toBe("positive");
    expect(figureSign("-20")).toBe("negative");
    expect(figureSign(0)).toBeUndefined();
  });
  it("writes a plus on a credit", () => {
    expect(signedText("500", "positive")).toBe("+500");
    expect(signedText("-500", "negative")).toBe("-500");
  });
  it("is drawn tinted by its sign", () => {
    expect(figureValue({ signed: true }, -500, "-500")).toEqual({ figure: "-500", sign: "negative" });
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { figure: "+500", sign: "positive" } }));
    expect(html).toContain('data-sign="positive"');
    expect(html).toContain("+500");
  });
  it("stays plain text where the field is not signed", () => {
    expect(figureValue({}, 500, "500")).toBe("500");
  });
});

describe("an excerpt", () => {
  it("is cut to its first line", () => {
    expect(excerptLine("IllegalStateException: boom\n\tat Foo.bar(Foo.java:1)")).toBe("IllegalStateException: boom");
  });
  it("keeps a one-line message whole", () => {
    expect(excerptLine("  E_TIMEOUT  ")).toBe("E_TIMEOUT");
  });
});

describe("ratioText", () => {
  it("writes a part of a total as a percentage with one decimal at most", () => {
    expect(ratioText(1, 8, "en")).toBe("12.5%");
    expect(ratioText(3, 4, "en")).toBe("75%");
  });
  it("reads stored strings", () => {
    expect(ratioText("2", "4", "en")).toBe("50%");
  });
  it("writes nothing when the total is zero or a value is not a number", () => {
    expect(ratioText(0, 0, "en")).toBe("");
    expect(ratioText(null, 5, "en")).toBe("");
    expect(ratioText(2, undefined, "en")).toBe("");
  });
  it("keeps a true zero share", () => {
    expect(ratioText(0, 6, "en")).toBe("0%");
  });
});
