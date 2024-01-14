import { now, Oscillator as Osc, ToneOscillatorType } from "tone";
import Engine from "../Engine";

import Note from "../Note";
import Module, { Startable, Voicable } from "./Base";
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

class MonoOscillator
  extends Module<Osc, OscillatorInterface>
  implements Startable
{
  private _note: Note;

  constructor(name: string, props: Partial<OscillatorInterface>) {
    super(new Osc(), {
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicOutputs();
    this.start(now());
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

  start(time: number) {
    if (!Engine.isStarted) return;

    const oscState = this.internalModule.state;

    if (oscState === "started") {
      this.internalModule.restart(time);
    } else {
      this.internalModule.start(time);
    }
  }

  stop(time?: number) {
    this.internalModule.stop(time);
  }

  triggerAttack = (note: Note, triggeredAt: number) => {
    this.setNoteAt(note, triggeredAt);
    this.start(triggeredAt);
  };

  triggerRelease = () => {
    // Do nothing
  };

  private updateFrequency(time?: number) {
    if (!this.note) return;

    const freq = this.note.adjustFrequency(this.range, this.coarse);

    if (time) {
      this.internalModule.frequency.linearRampToValueAtTime(freq, time);
    } else {
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
  }

  start(time: number) {
    this.audioModules.forEach((audioModule) => audioModule.start(time));
  }

  stop(time?: number) {
    this.audioModules.forEach((audioModule) => audioModule.stop(time));
  }
}
