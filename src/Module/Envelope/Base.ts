import { Envelope as Env } from "tone";

import Module, { Connectable, Triggerable, Voicable } from "../Base";
import PolyModule from "../PolyModule";
import Note from "../../Note";

export const enum EnvelopeStages {
  Attack = "attack",
  Decay = "decay",
  Sustain = "sustain",
  Release = "release",
}

const MAX_TIME = 2;
const MIN_TIME = 0.01;
const SUSTAIN_MAX_VALUE = 1;
const SUSTAIN_MIN_VALUE = 0;

export interface EnvelopeInterface extends Voicable {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  voiceNo?: number;
}

const InitialProps: EnvelopeInterface = {
  attack: MIN_TIME,
  decay: MIN_TIME,
  sustain: SUSTAIN_MAX_VALUE,
  release: MIN_TIME,
};

export default abstract class EnvelopeModule<EnvelopeLike extends Env>
  extends Module<EnvelopeLike, EnvelopeInterface>
  implements Triggerable
{
  activeNote?: string;
  triggeredAt: number;

  constructor(
    name: string,
    internalModule: EnvelopeLike,
    props: EnvelopeInterface
  ) {
    super(internalModule, {
      name,
      props: { ...InitialProps, ...props },
    });
  }

  get attack() {
    return this._props["attack"];
  }

  set attack(value: number) {
    this.setStage(EnvelopeStages.Attack, value);
  }

  get decay() {
    return this._props["decay"];
  }

  set decay(value: number) {
    this.setStage(EnvelopeStages.Decay, value);
  }

  get sustain() {
    return this._props["sustain"];
  }

  set sustain(value: number) {
    this.setStage(EnvelopeStages.Sustain, value);
  }

  get release() {
    return this._props["release"];
  }

  set release(value: number) {
    this.setStage(EnvelopeStages.Release, value);
  }

  setStage(stage: EnvelopeStages, value: number) {
    const calculatedValue =
      value === 0 ? this.minTime(stage) : this.maxTime(stage) * value;
    this._props = { ...this.props, [stage]: value };
    this.internalModule[stage] = calculatedValue;
  }

  triggerAttack = (note: Note, triggeredAt: number) => {
    this.activeNote = note.fullName;
    this.triggeredAt = triggeredAt;

    this.internalModule.triggerAttack(triggeredAt, note.velocity);
  };

  triggerRelease = (note: Note, triggeredAt: number) => {
    this.internalModule.triggerRelease(triggeredAt);
  };

  private maxTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MAX_VALUE : MAX_TIME;
  }

  private minTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MIN_VALUE : MIN_TIME;
  }
}

export abstract class PolyBase<
  EnvelopeModule extends Module<Connectable, any>
> extends PolyModule<EnvelopeModule, EnvelopeInterface> {
  constructor(
    name: string,
    child: new (name: string, props: EnvelopeInterface) => EnvelopeModule,
    props: Partial<EnvelopeInterface>
  ) {
    super({
      name,
      child,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}

class MonoEnvelope extends EnvelopeModule<Env> {
  constructor(name: string, props: EnvelopeInterface) {
    super(name, new Env(), props);
  }
}

export class Envelope extends PolyBase<MonoEnvelope> {
  static moduleName = "Envelope";

  constructor(name: string, props: Partial<EnvelopeInterface>) {
    super(name, MonoEnvelope, {
      ...InitialProps,
      ...props,
    });
  }
}
