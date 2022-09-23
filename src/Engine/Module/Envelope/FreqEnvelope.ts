import { FrequencyEnvelope } from "tone";

import { ModuleType } from "../Base";
import Filter from "../Filter";
import PolyModule, { PolyModuleType } from "../PolyModule";

import Base, { EnvelopeInterface } from "./Base";

interface FreqEnvelopeInterface extends Partial<EnvelopeInterface> {
  amount?: number;
}

const InitialProps: FreqEnvelopeInterface = {
  amount: 0,
};

export default class FreqEnvelope extends Base<FrequencyEnvelope> {
  private _frequency: number;
  private _amount: number;
  filter: Filter;

  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.FreqEnvelope, new FrequencyEnvelope(), {
      ...InitialProps,
      ...props,
    });

    this.registerOutputs();
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

  protected registerOutputs() {
    super.registerOutputs();

    this.registerOutput({
      name: "frequency",
      pluggable: this,
      onPlug: (input) => {
        this.connect(input.pluggable);
      },
    });
  }
}

export class PolyFreqEnvelope extends PolyModule<EnvelopeInterface> {
  constructor(name: string, code: string, props: Partial<EnvelopeInterface>) {
    super(PolyModuleType.FreqEnvelope, {
      name,
      code,
      props: { ...InitialProps, ...props },
      type: ModuleType.FreqEnvelope,
    });
  }
}
