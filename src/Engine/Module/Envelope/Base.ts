import { Envelope as Env } from "tone";

import Note from "Engine/Note";
import Module, { ModuleType } from "Engine/Module";

export const enum EnvelopeStages {
  Attack = "attack",
  Decay = "decay",
  Sustain = "sustain",
  Release = "release",
}

const MAX_TIME = 2;
const MIN_TIME = 0.01;
const SUSTAIN_MAX_VALUE = 1;

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

export default abstract class EnvelopeModule<
  EnvelopeLike extends Env
> extends Module<EnvelopeLike, EnvelopeInterface> {
  activeNotes: Note[];

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

    this.activeNotes = [];
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
      value === 0 ? MIN_TIME : this.maxTime(stage) * value;
    this._props = { ...this.props, [stage]: value };
    this.internalModule[stage] = calculatedValue;
  }

  triggerAttack(note: Note, time: number) {
    this.internalModule.triggerRelease();
    this.addNote(note);
    this.internalModule.triggerAttack(time);
  }

  triggerRelease(note: Note) {
    this.removeNote(note);
    if (this.activeNotes.length) return;

    this.internalModule.triggerRelease();
  }

  toDestination() {
    this.internalModule.toDestination();
  }

  private maxTime(stage: EnvelopeStages): number {
    return stage === EnvelopeStages.Sustain ? SUSTAIN_MAX_VALUE : MAX_TIME;
  }

  private addNote(note: Note) {
    this.activeNotes.push(note);
  }

  private removeNote(note: Note) {
    this.activeNotes = this.activeNotes.filter(
      (n) => n.fullName !== note.fullName
    );
  }
}

export class Envelope extends EnvelopeModule<Env> {
  constructor(name: string, code: string, props: EnvelopeInterface) {
    super(name, code, ModuleType.Envelope, new Env(), props);
  }
}
