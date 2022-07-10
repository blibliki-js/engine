import { FrequencyEnvelope as Envelope } from "tone";

import Base from "./Base";
import Filter from "../Filter";

export default class FreqEnvelope extends Base {
  internalModule: Envelope;

  constructor(name: string) {
    super(name, Envelope);

    this.internalModule.baseFrequency = "C4";
    this.internalModule.octaves = 6;
    this.internalModule.exponent = 2;
  }

  connect(module: Filter) {
    this.internalModule.connect(module.internalModule.frequency);
  }
}
