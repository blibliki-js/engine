import { Filter as InternalFilter, FilterRollOff } from "tone";

import { FreqEnvelope, MonoFreqEnvelope } from "./Envelope";
import Module, { Voicable } from "./Base";
import PolyModule from "./PolyModule";

interface FilterInterface extends Voicable {
  cutoff: number;
  filterType: BiquadFilterType;
  resonance: number;
  slope: FilterRollOff;
  envelopeAmount: number;
  voiceNo?: number;
}

type FilterProps = Partial<FilterInterface>

const InitialProps: FilterInterface = {
  cutoff: 20000,
  resonance: 0,
  envelopeAmount: 0,
  slope: -24,
  filterType: "lowpass",
};

class MonoFilter extends Module<InternalFilter, FilterInterface> {
  private _envelope: MonoFreqEnvelope;

  constructor(name: string, props: FilterProps) {
    super(new InternalFilter({ type: "lowpass" }), {
      name,
      props: { ...InitialProps, ...props },
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

  get filterType() {
    return this._props["filterType"];
  }

  set filterType(value: BiquadFilterType) {
    this._props = { ...this.props, filterType: value };
    this.internalModule.type = value;
  }

  get slope() {
    return this._props["slope"];
  }

  set slope(value: FilterRollOff) {
    this._props = { ...this.props, slope: value };
    this.internalModule.rolloff = value;
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

  conntectedEnvelope(envelope: MonoFreqEnvelope) {
    this._envelope = envelope;
    this._envelope.frequency = this.cutoff;
    this._envelope.amount = this.envelopeAmount;
  }
}

export default class Filter extends PolyModule<MonoFilter, FilterInterface> {
  static moduleName = "Filter";

  constructor(name: string, props: Partial<FilterInterface>) {
    super({
      name,
      child: MonoFilter,
      props: { ...InitialProps, ...props },
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
        this.conntectedEnvelope(output.audioModule as FreqEnvelope);
      },
    });
  }

  conntectedEnvelope(freqEnvelope: FreqEnvelope) {
    freqEnvelope.audioModules.forEach((envelope) => {
      if (envelope.voiceNo === undefined) return;

      const filter = this.findVoice(envelope.voiceNo);
      filter?.conntectedEnvelope(envelope);
    });
  }
}
