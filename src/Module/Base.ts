import { v4 as uuidv4 } from "uuid";
import { InputNode } from "tone";

import { Input, Output, IOInterface } from "./IO";
import MidiEvent from "../MidiEvent";
import { AudioModule } from "../Module";

export enum ModuleType {
  Oscillator = "monoOscillator",
  Envelope = "monoEnvelope",
  AmpEnvelope = "monoAmpEnvelope",
  FreqEnvelope = "monoFreqEnvelope",
  Filter = "monoFilter",
  Master = "master",
  Voice = "voice",
  MidiSelector = "midiSelector",
  Volume = "monoVolume",
}

export interface Connectable {
  connect: (inputNode: InputNode) => void;
  dispose: () => void;
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

export class DummnyInternalModule implements Connectable {
  connect(inputNode: InputNode) {
    throw Error("This module is not connectable");
  }

  dispose() {}
}

class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface
{
  internalModule: InternalModule;

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

  plug(audioModule: AudioModule, from: string, to: string) {
    const output = this.outputs.find((i) => i.name === from);
    if (!output) throw Error(`Output ${from} not exist`);

    console.log(`${this.name}:${from} => ${audioModule.name}:${to}`);

    const input = audioModule.inputs.find((i) => i.name === to);
    if (!input)
      throw Error(`Input ${to} in module ${audioModule.name} not exist`);

    output.plug(input);
  }

  unplugAll() {
    this.outputs.forEach((o) => o.unPlugAll());
  }

  connect(inputNode: InputNode) {
    this.internalModule.connect(inputNode);
  }

  dispose() {
    this.internalModule.dispose();
  }

  triggerAttack(midiEvent: MidiEvent) {
    throw Error("triggerAttack not implemented");
  }

  triggerRelease(midiEvent: MidiEvent) {
    throw Error("triggerRelease not implemented");
  }

  midiTriggered = (midiEvent: MidiEvent) => {
    switch (midiEvent.type) {
      case "noteOn":
        this.triggerAttack(midiEvent);
        break;
      case "noteOff":
        this.triggerRelease(midiEvent);
        break;
      default:
        throw Error("This type is not a note");
    }
  };

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
}

export default Module;
