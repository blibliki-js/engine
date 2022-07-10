import { Filter as InternalFilter } from "tone";

import Module, { ModuleType } from "../Module";

export default class Filter extends Module<InternalFilter> {
  private _cutoff: number;
  private _resonance: number;

  constructor(name: string, code: string) {
    super(new InternalFilter({ type: "lowpass" }), {
      name,
      code,
      type: ModuleType.Filter,
    });
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
