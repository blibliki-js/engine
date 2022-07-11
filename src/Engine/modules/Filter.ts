import { Filter as InternalFilter } from "tone";

import { FreqEnvelope } from "Engine/modules/Envelope";
import Module, { ModuleType } from "../Module";

export default class Filter extends Module<InternalFilter> {
  private _cutoff: number;
  private _resonance: number;
  private _envelopeAmount: number;
  private _envelope: FreqEnvelope;

  constructor(name: string, code: string) {
    super(new InternalFilter({ type: "lowpass" }), {
      name,
      code,
      type: ModuleType.Filter,
    });
  }

  get cutoff() {
    return this._cutoff;
  }

  set cutoff(value: number) {
    this._cutoff = value;

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
    return this._resonance;
  }

  set resonance(value: number) {
    this._resonance = value;
    this.internalModule.Q.value = value;
  }

  get envelopeAmount() {
    return this._envelopeAmount;
  }

  set envelopeAmount(value: number) {
    this._envelopeAmount = value;

    if (!this._envelope) return;

    this._envelope.amount = value;
  }

  conntectedEnvelope(envelope: FreqEnvelope) {
    this._envelope = envelope;
  }
}
