import { Filter as InternalFilter, FilterRollOff, Add, Multiply } from "tone";
import Module, { PolyModule } from "../core/Module";

interface FilterInterface {
  cutoff: number;
  filterType: BiquadFilterType;
  resonance: number;
  slope: FilterRollOff;
  envelopeAmount: number;
}

type FilterProps = Partial<FilterInterface>;

const MAX_FREQ = 20000;

const InitialProps: FilterInterface = {
  cutoff: MAX_FREQ,
  resonance: 0,
  envelopeAmount: 0,
  slope: -24,
  filterType: "lowpass",
};

class MonoFilter extends Module<InternalFilter, FilterInterface> {
  private _cutoff: Add;
  private _amount: Multiply;

  constructor(params: { id?: string; name: string; props: FilterProps }) {
    const { id, name, props } = params;

    super(new InternalFilter({ type: "lowpass" }), {
      id,
      name,
      props: { ...InitialProps, ...props },
    });

    this._cutoff = new Add();
    this._cutoff.connect(this.internalModule.frequency);

    this._amount = new Multiply();
    this._amount.connect(this._cutoff);
    this.updateAmountFactor();

    this.registerBasicInputs();
    this.registerOutputs();
  }

  get cutoff() {
    return this._props["cutoff"];
  }

  set cutoff(value: number) {
    if (this._cutoff) {
      this._cutoff.addend.value = value;
    }

    this._props = { ...this.props, cutoff: value };
    this.updateAmountFactor();
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
    this.updateAmountFactor();
  }

  private registerOutputs() {
    this.registerBasicOutputs();

    this.registerAudioInput({
      name: "cutoff",
      internalModule: this._amount,
    });
  }

  private updateAmountFactor() {
    if (!this._amount) return;

    const value =
      this.envelopeAmount > 0
        ? this.envelopeAmount * Math.abs(MAX_FREQ - this.cutoff)
        : this.envelopeAmount * Math.abs(1 - this.cutoff);

    this._amount.factor.value = value;
  }
}

export default class Filter extends PolyModule<MonoFilter, FilterInterface> {
  static moduleName = "Filter";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<FilterInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      child: MonoFilter,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerOutputs();
  }

  private registerOutputs() {
    this.registerBasicOutputs();
    this.registerForwardAudioInput({ name: "cutoff" });
  }
}
