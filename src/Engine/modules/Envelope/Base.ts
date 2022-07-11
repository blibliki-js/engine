import { Envelope as Env, Time } from "tone";

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

export default abstract class EnvelopeModule<
  EnvelopeLike extends Env
> extends Module<EnvelopeLike> {
  activeNotes: Note[];

  constructor(
    name: string,
    code: string,
    type: ModuleType,
    internalModule: EnvelopeLike
  ) {
    super(internalModule, { name, code, type });

    this.internalModule.attack = MIN_TIME;
    this.internalModule.decay = MIN_TIME;
    this.internalModule.sustain = SUSTAIN_MAX_VALUE;
    this.internalModule.release = MIN_TIME;

    this.activeNotes = [];
  }

  setStage(stage: EnvelopeStages, value: number) {
    this.internalModule[stage] =
      value === 0 ? MIN_TIME : this.maxTime(stage) * value;
  }

  getStage(stage: EnvelopeStages): number {
    return Time(this.internalModule[stage]).toSeconds() / this.maxTime(stage);
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
  constructor(name: string, code: string) {
    super(name, code, ModuleType.Envelope, new Env());
  }
}
