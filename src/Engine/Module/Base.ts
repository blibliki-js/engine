import { v4 as uuidv4 } from "uuid";

import { Input, Output, IOInterface } from "./IO";
import PolyModule from "./PolyModule";

export enum ModuleType {
  Oscillator = "monoOscillator",
  Envelope = "monoEnvelope",
  AmpEnvelope = "monoAmpEnvelope",
  FreqEnvelope = "monoFreqEnvelope",
  Filter = "monoFilter",
  Master = "master",
  VoiceScheduler = "voiceScheduler",
  MidiSelector = "midiSelector",
}

export interface Connectable {
  connect: Function;
  chain: Function;
  toDestination: Function;
  dispose: Function;
}

export interface Triggerable {
  triggerAttack: Function;
  triggerRelease: Function;
}

export interface ModuleInterface {
  name: string;
  code: string;
  type: ModuleType;
  props?: any;
  voiceNo?: number;
}

class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface
{
  protected internalModule: InternalModule;

  readonly id: string;
  name: string;
  code: string;
  inputs: Input[] = [];
  outputs: Output[] = [];
  type: ModuleType;
  readonly voiceNo?: number;
  updatedAt: Date;
  _props: PropsInterface;

  constructor(internalModule: InternalModule, props: Partial<ModuleInterface>) {
    this.internalModule = internalModule;
    this.id = uuidv4();

    Object.assign(this, props);
  }

  set props(value: PropsInterface) {
    if (!value) return;
    if (!this._props) this._props = value;

    this.updatedAt = new Date();

    Object.assign(this, value);
  }

  get props() {
    return this._props;
  }

  plug(
    audioModule: Module<Connectable, any> | PolyModule<any>,
    from: string,
    to: string
  ) {
    const output = this.outputs.find((i) => i.name === from);
    if (!output) throw Error(`Output ${from} not exist`);

    const log = `${this.name}:${this.voiceNo}`;

    if (audioModule instanceof Module) {
      console.log(`${log} to mono inputs ${audioModule.name}:${to}`);
      this.plugMono(output, audioModule, to);
      return;
    }

    if (this.voiceNo === undefined) {
      console.log(`${log} to all poly inputs ${audioModule.name}:${to}`);
      audioModule.audioModules.forEach((m) => this.plugMono(output, m, to));
    } else {
      const currentVoiceModule = audioModule.audioModules.find(
        (m) => m.voiceNo === this.voiceNo
      );

      if (!currentVoiceModule) {
        throw Error(
          `Audio module ${audioModule.name} missing voice ${this.voiceNo}`
        );
      }

      console.log(
        `${log} to poly voice ${currentVoiceModule.voiceNo} input ${audioModule.name}:${to}`
      );

      this.plugMono(output, currentVoiceModule, to);
    }
  }

  unplugAll() {
    this.outputs.forEach((o) => o.unPlugAll());
  }

  dispose() {
    this.internalModule.dispose();
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      props: this.props,
      inputs: this.inputs.map((i) => i.serialize()),
      outputs: this.outputs.map((i) => i.serialize()),
    };
  }

  protected connect(pluggable: any) {
    this.internalModule.connect(pluggable);
  }

  protected registerInput(props: IOInterface): Input {
    const input = new Input(this, props);
    this.inputs.push(input);

    return input;
  }

  protected registerOutput(props: IOInterface): Output {
    const output = new Output(this, props);
    this.outputs.push(output);

    return output;
  }

  private plugMono(
    output: Output,
    audioModule: Module<Connectable, any>,
    to: string
  ) {
    const input = audioModule.inputs.find((i) => i.name === to);
    if (!input)
      throw Error(`Input ${to} in module ${audioModule.name} not exist`);

    output.plug(input);
  }
}

export default Module;
