import { AmplitudeEnvelope as Envelope, Time } from "tone";

import Note from "Engine/Note";
import Module, { ModuleType } from "../Module";

export const enum EnvelopeStages {
  Attack = "attack",
  Decay = "decay",
  Sustain = "sustain",
  Release = "release",
}

const MAX_TIME = 2;
const MIN_TIME = 0.01;
const SUSTAIN_MAX_VALUE = 1;

export default class EnvelopeModule extends Module {
  internalModule: Envelope;
  activeNotes: Note[];

  constructor(name: string) {
    super({ name, type: ModuleType.Envelope });

    this.internalModule = new Envelope({
      attack: MIN_TIME,
      decay: MIN_TIME,
      sustain: SUSTAIN_MAX_VALUE,
      release: MIN_TIME,
    });

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
