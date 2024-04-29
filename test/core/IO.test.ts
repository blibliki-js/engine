import { describe, expect, it, beforeEach } from "@jest/globals";
import { MonoMocking, PolyMocking } from "../MockingModules";
import {
  AudioInput,
  AudioOutput,
  ForwardAudioInput,
  ForwardAudioOutput,
} from "../../src/core/IO";

describe("IO", () => {
  let monoModule1: MonoMocking, monoModule2: MonoMocking;
  let polyModule: PolyMocking;
  let input: AudioInput, output: AudioOutput;
  let polyInput: ForwardAudioInput, polyOutput: ForwardAudioOutput;

  beforeEach(() => {
    monoModule1 = new MonoMocking({ name: "module1", props: {} });
    monoModule2 = new MonoMocking({ name: "module2", props: {} });
    polyModule = new PolyMocking({ name: "polyModule", props: {} });

    input = monoModule1.inputs.findByName("input") as AudioInput;
    output = monoModule2.outputs.findByName("output") as AudioOutput;
    polyInput = polyModule.inputs.findByName("input") as ForwardAudioInput;
    polyOutput = polyModule.outputs.findByName("output") as ForwardAudioOutput;
  });

  describe("plug midi with midi", () => {
    beforeEach(() => {
      output.plug(input);
    });

    it("has one connection", () => {
      expect(input.connections.length).toBe(1);
      expect(output.connections.length).toBe(1);
    });

    it("has midi in connected with midi out", () => {
      expect(
        input.connections.find((con) => con.id === output.id)
      ).toBeDefined();
    });

    it("has midi out connected with midi in", () => {
      expect(
        output.connections.find((con) => con.id === input.id)
      ).toBeDefined();
    });

    describe("unplug midi", () => {
      beforeEach(() => {
        output.unPlug(input);
      });

      it("unplugged midi in from midi out", () => {
        expect(
          input.connections.find((con) => con.id === output.id)
        ).toBeUndefined();
      });

      it("unplugged midi out from midi in", () => {
        expect(
          output.connections.find((con) => con.id === input.id)
        ).toBeUndefined();
      });
    });

    describe("unplug all", () => {
      beforeEach(() => {
        output.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(input.connections.length).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(output.connections.length).toBe(0);
      });
    });
  });

  describe("plug midi out with forward in", () => {
    beforeEach(() => {
      output.plug(polyInput);
    });

    it("has one connection", () => {
      expect(polyInput.connections.length).toBe(1);
      expect(output.connections.length).toBe(2);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        output.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(polyInput.connections.length).toBe(0);
        expect(polyInput.subIOs.map((io) => io.connections).flat().length).toBe(
          0
        );
      });

      it("unplugged midi out from midi in", () => {
        expect(output.connections.length).toBe(0);
      });
    });
  });

  describe("plug polyOutput with input", () => {
    beforeEach(() => {
      polyOutput.plug(input);
    });

    it("has one connection", () => {
      expect(polyOutput.connections.length).toBe(1);
      expect(input.connections.length).toBe(2);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        polyOutput.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(polyOutput.connections.length).toBe(0);
        expect(
          polyOutput.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(input.connections.length).toBe(0);
      });
    });
  });

  describe("plug polyOutput with polyInput", () => {
    beforeEach(() => {
      polyOutput.plug(polyInput);
    });

    it("has one connection", () => {
      expect(polyOutput.connections.length).toBe(1);
      expect(polyInput.connections.length).toBe(1);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        polyOutput.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(polyOutput.connections.length).toBe(0);
        expect(
          polyOutput.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(polyInput.connections.length).toBe(0);
        expect(polyInput.subIOs.map((io) => io.connections).flat().length).toBe(
          0
        );
      });
    });
  });
});
