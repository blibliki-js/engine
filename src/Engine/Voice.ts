import { now } from "tone";
import { store } from "store";
import { addActiveNote, removeActiveNote } from "globalSlice";

import Module, {
  Connectable,
  Triggerable,
  Oscillator,
  Filter,
  FreqEnvelope,
  createModule,
} from "./Module";

export default class Voice {
  modules: {
    [Identifier: string]: Module<Connectable, any>;
  };
  voiceNo: number;
  activeNote: string | null;
  activeAt: Date;
  autoNoteOfCallback: Function;

  constructor(voiceNo: number) {
    this.modules = {};
    this.voiceNo = voiceNo;
  }

  setAutoNoteOfCallback(callback: Function) {
    this.autoNoteOfCallback = callback;
  }

  registerModule(name: string, code: string, type: string, props: any) {
    const modula = createModule(name, code, type, props);
    this.modules[modula.id] ??= modula;
    this.applyRoutes();

    return modula;
  }

  updatePropsModule(code: string, props: any) {
    const modula = this.findByCode(code);
    if (!modula) throw Error("Module not found");

    modula.props = props;

    return modula;
  }

  dispose() {
    Object.values(this.modules).forEach((m) => m.dispose());
    console.log(`Voice ${this.voiceNo} disposed!`);
  }

  triggerKey(noteName: string, type: string) {
    const time = now();

    switch (type) {
      case "noteOn":
        const overridedNote = this.activeNote;
        this.activeNote = noteName;
        this.activeAt = new Date();
        this.oscillators.forEach((osc) => osc.setNoteAt(noteName, time));
        this.triggerables.forEach((triggerable) => {
          triggerable.triggerAttack(time);
        });

        if (overridedNote) store.dispatch(removeActiveNote(overridedNote));
        store.dispatch(addActiveNote(noteName));
        break;
      case "noteOff":
        this.triggerables.forEach((triggerable) =>
          triggerable.triggerRelease(noteName, time)
        );
        store.dispatch(removeActiveNote(noteName));
        this.activeNote = null;
        break;
      default:
        throw Error("This type is not a note");
    }
  }

  private findModule(id: string): Module<Connectable, any> | undefined {
    return Object.values(this.modules).find((modula) => modula.id === id);
  }

  private findByCode(code: string): Module<Connectable, any> | undefined {
    return Object.values(this.modules).find((modula) => modula.code === code);
  }

  private get oscillators(): Oscillator[] {
    return Object.values(this.modules).filter(
      (m: Module<Connectable, any>) => m.type === "oscillator"
    ) as Oscillator[];
  }

  private get triggerables(): Triggerable[] {
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
    console.log(`Voice ${this.voiceNo} connected`);
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
}
