import { Filter as InternalFilter } from "tone";

import { FreqEnvelope } from "./Envelope";
import Module, { ModuleType } from "./Base";

interface FilterInterface {
  cutoff: number;
  resonance: number;
  envelopeAmount: number;
}

interface FilterProps extends Partial<FilterInterface> {}

const InitialProps: FilterInterface = {
  cutoff: 5000,
  resonance: 0,
  envelopeAmount: 0,
};

export default class Filter extends Module<InternalFilter, FilterInterface> {
  private _envelope: FreqEnvelope;

  constructor(name: string, code: string, props: FilterProps) {
    super(new InternalFilter({ type: "lowpass" }), {
      name,
      code,
      props: { ...InitialProps, ...props },
      type: ModuleType.Filter,
    });
  }

  get cutoff() {
    return this._props["cutoff"];
  }

  set cutoff(value: number) {
    this._props = { ...this.props, cutoff: value };

    if (this._envelope) {
      this._envelope.frequency = value;
    } else {
      this.internalModule.frequency.value = value;
    }
  }

  get frequency() {
    return this.internalModule.frequency;
  }

  get resonance() {
    return this._props["resonance"];
  }

  set resonance(value: number) {
    this._props = { ...this.props, resonance: value };

    this.internalModule.Q.value = value;
  }

  get envelopeAmount() {
    return this._props["envelopeAmount"];
  }

  set envelopeAmount(value: number) {
    this._props = { ...this.props, envelopeAmount: value };

    if (!this._envelope) return;

    this._envelope.amount = value;
  }

  conntectedEnvelope(envelope: FreqEnvelope) {
    this._envelope = envelope;
  }
}
