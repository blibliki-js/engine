import { FrequencyEnvelope } from "tone";

import Filter from "../Filter";
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

  constructor(params: { id?: string; name: string; props: EnvelopeInterface }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      internalModule: new FrequencyEnvelope(),
      props: {
        ...InitialProps,
        ...props,
      },
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
  static moduleName = "FreqEnvelope";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<EnvelopeInterface>;
  }) {
    const { id, name, props } = params;
    super({ id, name, child: MonoFreqEnvelope, props });
  }
}
