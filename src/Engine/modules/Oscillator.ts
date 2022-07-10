import { Oscillator as Osc, ToneOscillatorType, InputNode } from "tone";

import Module, { ModuleType } from "../Module";
import Note from "../Note";

export default class Oscillator extends Module {
  internalModule: Osc;

  private _note: Note;
  private _fine: number = 0;
  private _coarse: number = 0;
  private _wave: string = "sine";
  private _range: number = 1;
  private _volume: number = -100;

  constructor(name: string) {
    super({ name, type: ModuleType.Oscillator });

    this.internalModule = new Osc().sync();
  }

  get note() {
    return this._note;
  }

  set note(value: Note) {
    this._note = value;
    this.updateFrequency();
  }

  setNoteAt(value: Note, time: number) {
    this._note = value;
    this.updateFrequency(time);
  }

  get fine() {
    return this._fine;
  }

  set fine(value: number) {
    this._fine = Math.floor(value);
    this.internalModule.detune.value = this.fine;
  }

  get coarse() {
    return this._coarse;
  }

  set coarse(value: number) {
    this._coarse = Math.floor(value);
    this.updateFrequency();
  }

  get wave() {
    return this._wave;
  }

  set wave(value: string) {
    this.internalModule.type = value as ToneOscillatorType;
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;

    this.internalModule.volume.value = this.volume;
  }

  get range() {
    return this._range;
  }

  set range(value: number) {
    this._range = value;
    this.updateFrequency();
  }

  start() {
    this.internalModule.start();
  }

  connect(module: Module) {
    this.internalModule.connect(module.internalModule);
  }

  chain(...modules: Module[]) {
    this.internalModule.chain(
      ...modules.map((m: Module) => m.internalModule as InputNode)
    );
  }

  toDestination() {
    this.internalModule.toDestination();
  }

  private updateFrequency(time?: number) {
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
