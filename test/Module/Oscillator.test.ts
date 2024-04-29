import { describe, it, expect, beforeEach } from "vitest";

import { MonoOscillator, Oscillator } from "../../src/modules";

describe("Oscillator", () => {
  let oscillator: Oscillator;
  let monoOscillator: MonoOscillator;

  it("has proper module name", () => {
    expect(Oscillator.moduleName).toBe("Oscillator");
  });

  describe("Initialize", () => {
    beforeEach(() => {
      oscillator = new Oscillator({ name: "osc", props: {} });
      monoOscillator = oscillator.audioModules[0];
    });

    describe("fine prop", () => {
      it("has default value", () => {
        expect(oscillator.props["fine"]).toEqual(0);
        expect(monoOscillator.props["fine"]).toEqual(0);
      });

      it("updates value", () => {
        oscillator.props = { ...oscillator.props, fine: 0.2 };

        expect(oscillator.props["fine"]).toEqual(0.2);
        expect(monoOscillator.props["fine"]).toEqual(0.2);
      });
    });
  });
});
