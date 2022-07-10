import { Filter as InternalFilter } from "tone";

import Module, { ModuleType } from "../Module";

export default class Filter extends Module {
  internalModule: InternalFilter;
  private _cutoff: number;
  private _resonance: number;

  constructor(name: string) {
    super({ name, type: ModuleType.Filter });

    this.internalModule = new InternalFilter({ type: "lowpass" });
  }

  get cutoff() {
    return this._cutoff;
  }

  set cutoff(value: number) {
    this._cutoff = value;
    this.internalModule.frequency.value = value;
  }

  get resonance() {
    return this._resonance;
  }

  set resonance(value: number) {
    this._resonance = value;
    this.internalModule.Q.value = value;
  }
}
