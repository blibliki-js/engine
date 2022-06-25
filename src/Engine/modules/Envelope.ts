import { AmplitudeEnvelope as Envelope, Time } from "tone";

import Module, { ModuleType } from "../Module";

export const enum EnvelopeStages {
  Attack = "attack",
  Decay = "decay",
  Sustain = "sustain",
  Release = "release",
}

const MAX_TIME = 2;
const MIN_TIME = 0.00001;
const SUSTAIN_MAX_VALUE = 1;

export default class EnvelopeModule extends Module {
  internalModule: Envelope;

  constructor(name: string) {
    super({ name, type: ModuleType.Envelope });

    this.internalModule = new Envelope({
      attack: MIN_TIME,
      decay: MIN_TIME,
      sustain: SUSTAIN_MAX_VALUE,
      release: MIN_TIME,
    });
  }

  setStage(stage: EnvelopeStages, value: number) {
    this.internalModule[stage] =
      value === 0 ? MIN_TIME : this.maxTime(stage) * value;
  }

  getStage(stage: EnvelopeStages): number {
    return Time(this.internalModule[stage]).toSeconds() / this.maxTime(stage);
  }

  triggerAttack() {
    this.internalModule.triggerAttack();
  }

  triggerRelease() {
    this.internalModule.triggerRelease();
  }

  toDestination() {
    this.internalModule.toDestination();
  }

  private maxTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MAX_VALUE : MAX_TIME;
  }
}
