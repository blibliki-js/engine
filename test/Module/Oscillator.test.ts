import { describe, expect, it } from "@jest/globals";

import { Oscillator } from "../../src/modules";

describe("Oscillator", () => {
  it("has proper module name", () => {
    expect(Oscillator.moduleName).toBe("Oscillator");
  });
});
