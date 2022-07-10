import { FrequencyEnvelope } from "tone";

import { ModuleType } from "Engine/Module";
import Filter from "Engine/modules/Filter";

import Base from "./Base";

export default class FreqEnvelope extends Base {
  constructor(name: string, code: string) {
    super(name, code, ModuleType.FreqEnvelope);

    if (!(this.internalModule instanceof FrequencyEnvelope)) return;

    this.internalModule.baseFrequency = "C4";
    this.internalModule.octaves = 6;
    this.internalModule.exponent = 2;
  }

  connectToFilter(filter: Filter) {
    this.internalModule.connect(filter.internalModule.frequency);
  }
}
