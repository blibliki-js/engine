import { describe, expect, it, beforeEach } from "@jest/globals";
import { MonoMocking, PolyMocking } from "../MockingModules";
import {
  ForwardInput,
  ForwardOutput,
  MidiInput,
  MidiOutput,
} from "../../src/core/IO";

describe("IO", () => {
  let monoModule1: MonoMocking, monoModule2: MonoMocking;
  let polyModule: PolyMocking;
  let midiIn: MidiInput, midiOut: MidiOutput;
  let forwardMidiIn: ForwardInput, forwardMidiOut: ForwardOutput;

  beforeEach(() => {
    monoModule1 = new MonoMocking({ name: "module1", props: {} });
    monoModule2 = new MonoMocking({ name: "module2", props: {} });
    polyModule = new PolyMocking({ name: "polyModule", props: {} });

    midiIn = monoModule1.inputs.findByName("midi in") as MidiInput;
    midiOut = monoModule2.outputs.findByName("midi out") as MidiOutput;
    forwardMidiIn = polyModule.inputs.findByName("midi in") as ForwardInput;
    forwardMidiOut = polyModule.outputs.findByName("midi out") as ForwardOutput;
  });

  describe("plug midi with midi", () => {
    beforeEach(() => {
      midiOut.plug(midiIn);
    });

    it("has one connection", () => {
      expect(midiIn.connections.length).toBe(1);
      expect(midiOut.connections.length).toBe(1);
    });

    it("has midi in connected with midi out", () => {
      expect(
        midiIn.connections.find((con) => con.id === midiOut.id)
      ).toBeDefined();
    });

    it("has midi out connected with midi in", () => {
      expect(
        midiOut.connections.find((con) => con.id === midiIn.id)
      ).toBeDefined();
    });

    describe("unplug midi", () => {
      beforeEach(() => {
        midiOut.unPlug(midiIn);
      });

      it("unplugged midi in from midi out", () => {
        expect(
          midiIn.connections.find((con) => con.id === midiOut.id)
        ).toBeUndefined();
      });

      it("unplugged midi out from midi in", () => {
        expect(
          midiOut.connections.find((con) => con.id === midiIn.id)
        ).toBeUndefined();
      });
    });

    describe("unplug all", () => {
      beforeEach(() => {
        midiOut.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(midiIn.connections.length).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(midiOut.connections.length).toBe(0);
      });
    });
  });

  describe("plug midi out with forward in", () => {
    beforeEach(() => {
      midiOut.plug(forwardMidiIn);
    });

    it("has one connection", () => {
      expect(forwardMidiIn.connections.length).toBe(1);
      expect(midiOut.connections.length).toBe(2);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        midiOut.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(forwardMidiIn.connections.length).toBe(0);
        expect(
          forwardMidiIn.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(midiOut.connections.length).toBe(0);
      });
    });
  });

  describe("plug forwardMidiOut with midiIn", () => {
    beforeEach(() => {
      forwardMidiOut.plug(midiIn);
    });

    it("has one connection", () => {
      expect(forwardMidiOut.connections.length).toBe(1);
      expect(midiIn.connections.length).toBe(2);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        forwardMidiOut.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(forwardMidiOut.connections.length).toBe(0);
        expect(
          forwardMidiOut.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(midiIn.connections.length).toBe(0);
      });
    });
  });

  describe("plug forwardMidiOut with forwardMidiIn", () => {
    beforeEach(() => {
      forwardMidiOut.plug(forwardMidiIn);
    });

    it("has one connection", () => {
      expect(forwardMidiOut.connections.length).toBe(1);
      expect(forwardMidiIn.connections.length).toBe(1);
    });

    describe("unplug all", () => {
      beforeEach(() => {
        forwardMidiOut.unPlugAll();
      });

      it("unplugged midi in from midi out", () => {
        expect(forwardMidiOut.connections.length).toBe(0);
        expect(
          forwardMidiOut.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });

      it("unplugged midi out from midi in", () => {
        expect(forwardMidiIn.connections.length).toBe(0);
        expect(
          forwardMidiIn.subIOs.map((io) => io.connections).flat().length
        ).toBe(0);
      });
    });
  });
});
