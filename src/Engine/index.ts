import { now } from "tone";

import Module, { Connectable } from "./Module";
import Oscillator from "./modules/Oscillator";
import Filter from "./modules/Filter";
import { AmpEnvelope, FreqEnvelope } from "./modules/Envelope";
import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiEvent from "Engine/MidiEvent";

class Engine {
  modules: {
    [Identifier: string]: Module<Connectable>;
  };

  private static instance: Engine;

  private constructor() {
    this.modules = {};
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  public registerModule<InternalModule extends Connectable>(
    modula: Module<InternalModule>
  ) {
    this.modules[modula.id] ??= modula;
    this.applyRoutes();
  }

  public getModuleByName(name: string): Module<Connectable> | undefined {
    return Object.values(this.modules).find((modula) => modula.name === name);
  }

  private applyRoutes() {
    const oscs = Object.values(this.modules).filter((m: Module<Connectable>) =>
      m.code.startsWith("osc")
    );
    const ampEnv = Object.values(this.modules).find(
      (m: Module<Connectable>) => m.code === "ampEnvelope"
    );

    const filter = Object.values(this.modules).find(
      (m: Module<Connectable>) => m.code === "filter"
    );
    const filterEnv = Object.values(this.modules).find(
      (m: Module<Connectable>) => m.code === "freqEnvelope"
    );

    if (oscs.length !== 3 || !ampEnv || !filter || !filterEnv) return;

    (filterEnv as FreqEnvelope).connectToFilter(filter as Filter);

    oscs.forEach((osc) => osc.chain(filter, ampEnv));
    ampEnv.toDestination();
    console.log("connected");
    this.registerMidiEvents(
      oscs as Oscillator[],
      ampEnv as AmpEnvelope,
      filterEnv as FreqEnvelope
    );
  }

  private registerMidiEvents(
    oscs: Array<Oscillator>,
    ampEnv: AmpEnvelope,
    filterEnv: FreqEnvelope
  ) {
    MidiDeviceManager.fetchDevices().then((devices) => {
      const device = devices[1];
      device.connect();

      device.onNote((midiEvent: MidiEvent) => {
        const { note } = midiEvent;
        if (!note) return;

        switch (midiEvent.type) {
          case "noteOn":
            const time = now();
            oscs.forEach((osc) => osc.setNoteAt(note, time));
            ampEnv.triggerAttack(note, time);
            filterEnv.triggerAttack(note, time);
            break;
          case "noteOff":
            ampEnv.triggerRelease(note);
            filterEnv.triggerRelease(note);
            break;
        }
      });
    });
  }
}

export default Engine.getInstance();
