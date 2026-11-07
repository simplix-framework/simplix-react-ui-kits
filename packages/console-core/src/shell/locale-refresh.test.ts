import { describe, expect, it, vi } from "vitest";

import { refreshOnLocaleChange } from "./console-providers";

function targets(signedIn: boolean) {
  const handlers = new Set<(locale: string) => void>();
  return {
    handlers,
    i18nAdapter: {
      onLocaleChange: (handler: (locale: string) => void) => {
        handlers.add(handler);
        return () => void handlers.delete(handler);
      },
    },
    queryClient: { invalidateQueries: vi.fn(async () => {}) },
    auth: { isAuthenticated: () => signedIn, getAccessToken: () => (signedIn ? "token" : null) },
    accessPolicy: { update: vi.fn(async () => {}) },
  };
}

describe("refreshOnLocaleChange", () => {
  it("reads every cached query and the signed-in reader's access again when the language changes", () => {
    const fake = targets(true);
    refreshOnLocaleChange(fake);
    for (const handler of fake.handlers) handler("ko");
    expect(fake.queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(fake.accessPolicy.update).toHaveBeenCalledWith("token");
  });

  it("leaves the access read alone while nobody is signed in", () => {
    const fake = targets(false);
    refreshOnLocaleChange(fake);
    for (const handler of fake.handlers) handler("ko");
    expect(fake.queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(fake.accessPolicy.update).not.toHaveBeenCalled();
  });

  it("stops listening when the stack goes, so a remount leaves one listener", () => {
    const fake = targets(true);
    const stop = refreshOnLocaleChange(fake);
    stop();
    refreshOnLocaleChange(fake);
    expect(fake.handlers.size).toBe(1);
  });
});
