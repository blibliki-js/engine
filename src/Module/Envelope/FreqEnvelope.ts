import { FrequencyEnvelope } from "tone";

import Filter from "../Filter";
import { Output } from "../IO";

import Base, { EnvelopeInterface, PolyBase } from "./Base";

interface FreqEnvelopeInterface extends Partial<EnvelopeInterface> {
  amount?: number;
}

const InitialProps: FreqEnvelopeInterface = {
  amount: 0,
};

export class MonoFreqEnvelope extends Base<FrequencyEnvelope> {
  private _frequency: number;
  private _amount: number;
  filter: Filter;

  constructor(name: string, props: EnvelopeInterface) {
    super(name, new FrequencyEnvelope(), {
      ...InitialProps,
      ...props,
    });
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
}

export default class FreqEnvelope extends PolyBase<MonoFreqEnvelope> {
  constructor(name: string, props: Partial<EnvelopeInterface>) {
    super(name, MonoFreqEnvelope, props);

    this.registerOutputs();
  }

  protected registerOutputs() {
    this.registerOutput({
      name: "frequency",
      pluggable: this,
      onPlug: (output: Output) => {
        this.connect(output.audioModule, output.pluggable);
      },
      onUnPlug: (output: Output) => {
        this.disconnect(output.audioModule, output.pluggable);
      },
    });
  }
}
