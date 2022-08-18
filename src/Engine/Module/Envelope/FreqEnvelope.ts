import { FrequencyEnvelope } from "tone";

import { ModuleType } from "../Base";
import Filter from "../Filter";

import Base, { EnvelopeInterface } from "./Base";

export default class FreqEnvelope extends Base<FrequencyEnvelope> {
  private _frequency: number;
  private _amount: number;
  filter: Filter;

  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.FreqEnvelope, new FrequencyEnvelope(), props);

    this.internalModule.octaves = 4;
  }

  get frequency() {
    return this._frequency;
  }

  set frequency(value: number) {
    this._frequency = value;
    this.internalModule.baseFrequency = value;
  }

  get amount() {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;

    this.internalModule.octaves = value;
  }

  connectToFilter(filter: Filter) {
    this.internalModule.connect(filter.frequency);
    this.filter = filter;
    this.filter.conntectedEnvelope(this);
  }
}
