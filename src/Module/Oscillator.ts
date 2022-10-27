import MidiEvent from "../MidiEvent";
import { Oscillator as Osc, ToneOscillatorType } from "tone";

import Note from "../Note";
import Module, { Voicable } from "./Base";
import PolyModule from "./PolyModule";

export interface OscillatorInterface extends Voicable {
  noteName: string;
  fine: number;
  coarse: number;
  wave: string;
  volume: number;
  range: number;
}

const InitialProps: OscillatorInterface = {
  noteName: "C3",
  fine: 0,
  coarse: 0,
  wave: "sine",
  range: 0,
  volume: 0,
};

class MonoOscillator extends Module<Osc, OscillatorInterface> {
  private _note: Note;

  constructor(name: string, props: Partial<OscillatorInterface>) {
    super(new Osc(), {
      name,
      props: { ...InitialProps, ...props },
    });

    this.note = new Note("C3");

    this.internalModule.sync();
    this.internalModule.start();
  }

  get note(): Note {
    return this._note;
  }

  setNoteAt(value: Note | string, time: number) {
    this._note = this.getNote(value);
    this.updateFrequency(time);
  }

  set note(value: Note | string) {
    this._note = this.getNote(value);
    this.updateFrequency();
  }

  get noteName() {
    return this._props["noteName"];
  }

  set noteName(value: string) {
    this._props = { ...this.props, noteName: value };
    this.note = new Note(this.noteName);
  }

  get fine() {
    return this._props["fine"];
  }

  set fine(value: number) {
    this._props = { ...this.props, fine: Math.floor(value) };
    this.internalModule.detune.value = this.fine;
  }

  get coarse() {
    return this._props["coarse"];
  }

  set coarse(value: number) {
    this._props = { ...this.props, coarse: Math.floor(value) };

    this.updateFrequency();
  }

  get wave() {
    return this._props["wave"];
  }

  set wave(value: string) {
    this._props = { ...this.props, wave: value };
    this.internalModule.type = this.wave as ToneOscillatorType;
  }

  get volume() {
    return this._props["volume"];
  }

  set volume(value: number) {
    this._props = { ...this.props, volume: value };

    this.internalModule.volume.value = this.volume;
  }

  get range() {
    return this._props["range"];
  }

  set range(value: number) {
    this._props = { ...this.props, range: value };
    this.updateFrequency();
  }

  start() {
    this.internalModule.start();
  }

  triggerAttack(midiEvent: MidiEvent) {
    if (!midiEvent.note) return;
    this.setNoteAt(midiEvent.note, midiEvent.triggeredAt);
  }

  triggerRelease(midiEvent: MidiEvent) {
    // Do nothing
  }

  private updateFrequency(time?: number) {
    if (!this.note) return;

    const freq = this.note.frequency(this.range, this.coarse);

    if (time) {
      this.internalModule.restart(time);
      this.internalModule.frequency.setValueAtTime(freq, time);
    } else {
      this.internalModule.restart();
      this.internalModule.frequency.value = freq;
    }
  }

  private getNote(note: Note | string): Note {
    return note instanceof Note ? note : new Note(note);
  }
}

export default class Oscillator extends PolyModule<
  MonoOscillator,
  OscillatorInterface
> {
  static moduleName = "Oscillator";

  constructor(name: string, props: Partial<OscillatorInterface>) {
    super({
      name,
      child: MonoOscillator,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicOutputs();
    this.registerInputs();
  }

  private registerInputs() {
    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }
}
