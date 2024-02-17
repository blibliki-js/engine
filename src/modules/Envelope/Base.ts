import { Envelope as Env } from "tone";

import Module, {
  PolyModule,
  Connectable,
  Triggerable,
} from "../../core/Module";
import Note from "../../core/Note";

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

export interface EnvelopeInterface {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
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

  constructor(params: {
    id?: string;
    name: string;
    internalModule: EnvelopeLike;
    props: EnvelopeInterface;
  }) {
    const { id, name, props, internalModule } = params;

    super(internalModule, {
      id,
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
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
  EnvelopeModule extends Module<Connectable, EnvelopeInterface>
> extends PolyModule<EnvelopeModule, EnvelopeInterface> {
  constructor(params: {
    id?: string;
    name: string;
    child: new (params: {
      id?: string;
      name: string;
      props: EnvelopeInterface;
    }) => EnvelopeModule;
    props: Partial<EnvelopeInterface>;
  }) {
    const { id, name, child, props } = params;
    super({
      id,
      name,
      child,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicInputs();
    this.registerBasicOutputs();
  }
}

class MonoEnvelope extends EnvelopeModule<Env> {
  constructor(params: { id?: string; name: string; props: EnvelopeInterface }) {
    const { id, name, props } = params;
    super({ id, name, internalModule: new Env(), props });
  }
}

export class Envelope extends PolyBase<MonoEnvelope> {
  static moduleName = "Envelope";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<EnvelopeInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      child: MonoEnvelope,
      props: {
        ...InitialProps,
        ...props,
      },
    });
  }
}
