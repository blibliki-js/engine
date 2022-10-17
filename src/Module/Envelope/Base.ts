import { Envelope as Env } from "tone";

import Module, { ModuleType, Connectable, Triggerable } from "../index";
import PolyModule, { PolyModuleType } from "../PolyModule";
import MidiEvent from "../../MidiEvent";
import { Output } from "../IO";

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
  constructor(
    name: string,
    type: ModuleType,
    internalModule: EnvelopeLike,
    props: EnvelopeInterface
  ) {
    super(internalModule, {
      name,
      type,
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

  triggerAttack(midiEvent: MidiEvent) {
    this.internalModule.triggerAttack(midiEvent.triggeredAt);
  }

  triggerRelease(midiEvent: MidiEvent) {
    this.internalModule.triggerRelease(midiEvent.triggeredAt);
  }

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
    type: ModuleType,
    polyType: PolyModuleType,
    props: Partial<EnvelopeInterface>
  ) {
    super(polyType, {
      name,
      type,
      props: { ...InitialProps, ...props },
    });

    this.registerInputs();
    this.registerOutputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "input",
      onPlug: (output: Output) => {
        this.audioModules.forEach((m) =>
          output.pluggable(m.internalModule, m.voiceNo)
        );
      },
    });

    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }

  protected registerOutputs() {
    this.registerOutput({
      name: "output",
      pluggable: this.connect,
    });
  }
}

export class Envelope extends EnvelopeModule<Env> {
  constructor(name: string, props: EnvelopeInterface) {
    super(name, ModuleType.Envelope, new Env(), props);
  }
}

export class PolyEnvelope extends PolyBase<Envelope> {
  constructor(name: string, props: Partial<EnvelopeInterface>) {
    super(name, ModuleType.Envelope, PolyModuleType.Envelope, {
      ...InitialProps,
      ...props,
    });
  }
}
