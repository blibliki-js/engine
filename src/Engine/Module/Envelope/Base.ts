import { Envelope as Env } from "tone";

import Module, { ModuleType, Triggerable } from "Engine/Module";
import PolyModule, { PolyModuleType } from "../PolyModule";
import MidiEvent from "Engine/MidiEvent";

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
    code: string,
    type: ModuleType,
    internalModule: EnvelopeLike,
    props: EnvelopeInterface
  ) {
    super(internalModule, {
      name,
      code,
      type,
      props: { ...InitialProps, ...props },
    });

    this.registerInputs();
    this.registerOutputs();
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

  triggerAttack(time: number) {
    this.internalModule.triggerRelease();
    this.internalModule.triggerAttack(time);
  }

  triggerRelease(time: number) {
    this.internalModule.triggerRelease(time);
  }

  private registerInputs() {
    this.registerInput({
      name: "input",
      pluggable: this.internalModule,
    });

    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }

  protected registerOutputs() {
    this.registerOutput({
      name: "output",
      pluggable: this.internalModule,
      onPlug: (input) => {
        this.connect(input.pluggable);
      },
    });
  }

  private midiTriggered = (midiEvent: MidiEvent, voiceNo?: number) => {
    if (voiceNo !== undefined && this.voiceNo === undefined)
      throw Error("Module not supporting polyphony");

    if (this.voiceNo !== voiceNo) return;

    switch (midiEvent.type) {
      case "noteOn":
        this.triggerAttack(midiEvent.triggeredAt);
        break;
      case "noteOff":
        this.triggerRelease(midiEvent.triggeredAt);
        break;
      default:
        throw Error("This type is not a note");
    }
  };

  private maxTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MAX_VALUE : MAX_TIME;
  }

  private minTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MIN_VALUE : MIN_TIME;
  }
}

export class Envelope extends EnvelopeModule<Env> {
  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.Envelope, new Env(), props);
  }
}

export class PolyEnvelope extends PolyModule<EnvelopeInterface> {
  constructor(name: string, code: string, props: Partial<EnvelopeInterface>) {
    super(PolyModuleType.Envelope, {
      name,
      code,
      props: { ...InitialProps, ...props },
      type: ModuleType.Envelope,
    });
  }
}
