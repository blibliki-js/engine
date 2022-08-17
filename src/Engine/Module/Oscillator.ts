import { Oscillator as Osc, ToneOscillatorType } from "tone";

import Module, { ModuleType } from "../Module";
import Note from "../Note";

export interface OscillatorInterface {
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
  volume: -100,
};

export default class Oscillator extends Module<Osc, OscillatorInterface> {
  private _note: Note;

  constructor(name: string, code: string, props: Partial<OscillatorInterface>) {
    super(new Osc(), {
      name,
      code,
      props: { ...InitialProps, ...props },
      type: ModuleType.Oscillator,
    });
    this.note = new Note("C3");

    this.internalModule.sync();
    this.internalModule.start();
  }

  get note() {
    return this._note;
  }

  setNoteAt(value: Note, time: number) {
    this._note = value;
    this.updateFrequency(time);
  }

  set note(value: Note) {
    this._note = value;
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
}
