import { Filter as InternalFilter } from "tone";

import { FreqEnvelope } from "./Envelope";
import Module, { ModuleType } from "./Base";
import PolyModule, { PolyModuleType } from "./PolyModule";
import { PolyFreqEnvelope } from "./Envelope/FreqEnvelope";

interface FilterInterface {
  cutoff: number;
  resonance: number;
  envelopeAmount: number;
  voiceNo?: number;
}

interface FilterProps extends Partial<FilterInterface> {}

const InitialProps: FilterInterface = {
  cutoff: 20000,
  resonance: 0,
  envelopeAmount: 0,
};

export default class Filter extends Module<InternalFilter, FilterInterface> {
  private _envelope: FreqEnvelope;

  constructor(name: string, props: FilterProps) {
    super(new InternalFilter({ type: "lowpass" }), {
      name,
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
    this._envelope.frequency = this.cutoff;
  }
}

export class PolyFilter extends PolyModule<Filter, FilterInterface> {
  constructor(name: string, props: Partial<FilterInterface>) {
    super(PolyModuleType.Filter, {
      name,
      props: { ...InitialProps, ...props },
      type: ModuleType.Filter,
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
    this.registerInputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "frequency",
      pluggable: "frequency",
      onPlug: (output) => {
        this.conntectedEnvelope(output.pluggable);
      },
    });
  }

  conntectedEnvelope(polyFreqEnvelope: PolyFreqEnvelope) {
    polyFreqEnvelope.audioModules.forEach((envelope) => {
      if (envelope.voiceNo === undefined) return;

      const filter = this.findVoice(envelope.voiceNo);
      filter.conntectedEnvelope(envelope);
    });
  }
}
