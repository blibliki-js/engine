import { describe, it, expect } from "vitest";

import { Oscillator } from "../../src/modules";

describe("Oscillator", () => {
  it("has proper module name", () => {
    expect(Oscillator.moduleName).toBe("Oscillator");
  });
});
