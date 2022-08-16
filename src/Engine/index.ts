import { now } from "tone";

import Module, {
  Connectable,
  Oscillator,
  Filter,
  AmpEnvelope,
  FreqEnvelope,
} from "./Module";
import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiEvent from "Engine/MidiEvent";

import { store } from "store";
import { modulesSelector, addModule } from "Engine/Module/modulesSlice";

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
    store.dispatch(addModule(modula));
    this.modules[modula.id] ??= modula;
    this.applyRoutes();
  }

  public dispose() {
    console.log("Engine disposed!");
    Object.values(this.modules).forEach((m) => m.dispose());
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

    oscs.forEach((osc) => this.chain(osc.id, [filter.id, ampEnv.id]));

    ampEnv.toDestination();
    console.log("connected");
    this.registerMidiEvents(
      oscs as Oscillator[],
      ampEnv as AmpEnvelope,
      filterEnv as FreqEnvelope
    );
  }

  private chain(sourceId: string, chainIds: string[]) {
    const state = store.getState();
    const source = modulesSelector.selectById(state, sourceId);
    const chains = chainIds.map((id) => {
      const m = modulesSelector.selectById(state, id);

      if (!m) throw Error(`Missing module with id ${id}`);

      return m;
    });

    if (!source) throw Error(`Missing module with id ${sourceId}`);

    source.chain(...chains);
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
