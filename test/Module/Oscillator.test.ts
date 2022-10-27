import { describe, expect, it } from "@jest/globals";

import { Oscillator } from "../../src/Module";

describe("Oscillator", () => {
  it("has proper module name", () => {
    expect(Oscillator.moduleName).toBe("Oscillator");
  });
});
