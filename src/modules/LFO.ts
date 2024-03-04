import { now, LFO as LFOInternal, ToneOscillatorType } from "tone";
import Engine from "../Engine";
import Module, { PolyModule, Startable } from "../core/Module";
import { TWave } from "./Oscillator";
import Note from "../core/Note";

export interface LFOInterface {
  wave: TWave;
  frequency: number;
  min: number;
  max: number;
  amount: number;
}

const InitialProps: LFOInterface = {
  wave: "sine",
  frequency: 0.1,
  min: 0,
  max: 1,
  amount: 1,
};

class MonoLFO extends Module<LFOInternal, LFOInterface> implements Startable {
  constructor(params: {
    id?: string;
    name: string;
    props: Partial<LFOInterface>;
  }) {
    const { id, name, props } = params;

    super(new LFOInternal(), {
      id,
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicOutputs();
    this.registerInputs();
    this.start(now());
  }

  get wave() {
    return this._props["wave"];
  }

  set wave(value: TWave) {
    this._props = { ...this.props, wave: value };
    this.internalModule.type = this.wave as ToneOscillatorType;
  }

  get min() {
    return this._props["min"];
  }

  set min(value: number) {
    this._props = { ...this.props, min: value };
    this.internalModule.min = this.min;
  }

  get max() {
    return this._props["max"];
  }

  set max(value: number) {
    this._props = { ...this.props, max: value };
    this.internalModule.max = this.max;
  }

  get frequency() {
    return this._props["frequency"];
  }

  set frequency(value: number) {
    this._props = { ...this.props, frequency: value };
    this.internalModule.frequency.value = this.frequency;
  }

  get amount() {
    return this._props["amount"];
  }

  set amount(value: number) {
    this._props = { ...this.props, amount: value };
    this.internalModule.amplitude.value = this.amount;
  }

  start(time: number) {
    if (!Engine.isStarted) return;

    const oscState = this.internalModule.state;

    if (oscState === "started") {
      this.internalModule.stop(time - 2);
      this.internalModule.start(time);
    } else {
      this.internalModule.start(time);
    }
  }

  stop(time?: number) {
    this.internalModule.stop(time);
  }

  triggerAttack = (_: Note, triggeredAt: number) => {
    this.start(triggeredAt);
  };

  triggerRelease = () => {
    // Do nothing
  };

  private registerInputs() {
    this.registerDefaultMidiInput();
    this.registerAudioInput({
      name: "amount",
      internalModule: this.internalModule.amplitude,
    });
  }
}

export default class LFO extends PolyModule<MonoLFO, LFOInterface> {
  static moduleName = "LFO";

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<LFOInterface>;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      child: MonoLFO,
      props: { ...InitialProps, ...props },
    });

    this.registerBasicOutputs();
    this.registerInput({ name: "midi in" });
    this.registerInput({ name: "amount" });
  }

  start(time: number) {
    this.audioModules.forEach((audioModule) => audioModule.start(time));
  }

  stop(time?: number) {
    this.audioModules.forEach((audioModule) => audioModule.stop(time));
  }
}
