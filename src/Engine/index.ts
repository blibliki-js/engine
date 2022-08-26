import { now } from "tone";

import Module, {
  Connectable,
  Triggerable,
  Oscillator,
  Filter,
  AmpEnvelope,
  FreqEnvelope,
  createModule,
} from "./Module";
import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiEvent from "Engine/MidiEvent";

import { store } from "store";
import { addActiveNote, removeActiveNote } from "globalSlice";
import { addModule, updateModule } from "Engine/Module/modulesSlice";

class Engine {
  modules: {
    [Identifier: string]: Module<Connectable, any>;
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

  public findModule(id: string): Module<Connectable, any> | undefined {
    return Object.values(this.modules).find((modula) => modula.id === id);
  }

  public registerModule(name: string, code: string, type: string, props: any) {
    const modula = createModule(name, code, type, props);
    store.dispatch(addModule(modula.serialize()));
    this.modules[modula.id] ??= modula;
    this.applyRoutes();

    return modula.id;
  }

  updatePropModule(id: string, props: any) {
    const modula = this.findModule(id);
    if (!modula) return;

    modula.props = props;
    store.dispatch(
      updateModule({ id, changes: { props: { ...modula.props } } })
    );
  }

  public dispose() {
    console.log("Engine disposed!");
    Object.values(this.modules).forEach((m) => m.dispose());
  }

  public triggerKey(noteName: string, type: string) {
    const time = now();

    switch (type) {
      case "noteOn":
        this.oscillators.forEach((osc) => osc.setNoteAt(noteName, time));
        this.triggerables.forEach((triggerable) =>
          triggerable.triggerAttack(noteName, time)
        );
        store.dispatch(addActiveNote(noteName));
        break;
      case "noteOff":
        this.triggerables.forEach((triggerable) =>
          triggerable.triggerRelease(noteName, time)
        );
        store.dispatch(removeActiveNote(noteName));
        break;
      default:
        throw Error("This type is not a note");
    }
  }

  public get oscillators(): Oscillator[] {
    return Object.values(this.modules).filter(
      (m: Module<Connectable, any>) => m.type === "oscillator"
    ) as Oscillator[];
  }

  public get triggerables(): Triggerable[] {
    return Object.values(this.modules).filter((m: Module<Connectable, any>) =>
      m.isTriggerable()
    ) as unknown[] as Triggerable[];
  }

  private applyRoutes() {
    const oscs = Object.values(this.modules).filter(
      (m: Module<Connectable, any>) => m.type === "oscillator"
    );
    const ampEnv = Object.values(this.modules).find(
      (m: Module<Connectable, any>) => m.type === "ampEnvelope"
    );

    const filter = Object.values(this.modules).find(
      (m: Module<Connectable, any>) => m.type === "filter"
    );
    const filterEnv = Object.values(this.modules).find(
      (m: Module<Connectable, any>) => m.type === "freqEnvelope"
    );

    if (oscs.length !== 3 || !ampEnv || !filter || !filterEnv) return;

    (filterEnv as FreqEnvelope).connectToFilter(filter as Filter);

    oscs.forEach((osc) => this.chain(osc.id, [filter.id, ampEnv.id]));

    ampEnv.toDestination();
    console.log("connected");
    this.registerMidiEvents();
  }

  private chain(sourceId: string, chainIds: string[]) {
    const source = this.findModule(sourceId);
    const chains = chainIds.map((id) => {
      const m = this.findModule(id);

      if (!m) throw Error(`Missing module with id ${id}`);

      return m;
    });

    if (!source) throw Error(`Missing module with id ${sourceId}`);

    source.chain(...chains);
  }

  private registerMidiEvents() {
    MidiDeviceManager.onNote((midiEvent: MidiEvent) => {
      const { note } = midiEvent;

      if (!note) return;

      this.triggerKey(note.fullName, midiEvent.type);
    });
  }
}

export default Engine.getInstance();
