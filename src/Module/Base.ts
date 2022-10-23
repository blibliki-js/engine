import { v4 as uuidv4 } from "uuid";
import { InputNode } from "tone";

import { Input, Output, IOInterface } from "./IO";
import MidiEvent from "../MidiEvent";
import { AudioModule, PolyModule } from "../Module";

export enum ModuleType {
  Oscillator = "monoOscillator",
  Envelope = "monoEnvelope",
  AmpEnvelope = "monoAmpEnvelope",
  FreqEnvelope = "monoFreqEnvelope",
  Filter = "monoFilter",
  Master = "master",
  Voice = "voice",
  MidiSelector = "midiSelector",
  VirtualMidi = "virtualMidi",
  Volume = "monoVolume",
  Reverb = "reverb",
  Delay = "delay",
}

export interface Connectable {
  connect: (inputNode: InputNode) => void;
  disconnect: (inputNode?: InputNode) => void;
  dispose: () => void;
}

export interface Triggerable {
  triggerAttack: Function;
  triggerRelease: Function;
}

export interface ModuleInterface {
  name: string;
  type: ModuleType;
  props?: { [key: string]: any };
  voiceNo?: number;
}

export class DummnyInternalModule implements Connectable {
  connect(inputNode: InputNode) {
    throw Error("This module is not connectable");
  }

  disconnect(inputNode?: InputNode) {}

  dispose() {}
}

class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface
{
  internalModule: InternalModule;

  readonly id: string;
  name: string;
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

    const input = audioModule.inputs.find((i) => i.name === to);
    if (!input)
      throw Error(`Input ${to} in module ${audioModule.name} not exist`);

    output.plug(input);
  }

  unplugAll() {
    this.outputs.forEach((o) => o.unPlugAll());
  }

  connect = (
    inputAudioModule: AudioModule,
    attribute: string = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        this.internalModule.connect((m as any)[attribute] as InputNode);
      });
      return;
    }

    this.internalModule.connect(
      (inputAudioModule as any)[attribute] as InputNode
    );
  };

  disconnect = (
    inputAudioModule: AudioModule,
    attribute: string = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        this.internalModule.disconnect((m as any)[attribute] as InputNode);
      });
      return;
    }

    this.internalModule.disconnect(
      (inputAudioModule as any)[attribute] as InputNode
    );
  };

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

  protected registerBasicOutputs() {
    this.registerOutput({
      name: "output",
      onPlug: (output: Output) => {
        this.connect(output.audioModule);
      },
      onUnPlug: (output: Output) => {
        this.disconnect(output.audioModule);
      },
    });
  }

  protected registerBasicInputs() {
    this.registerInput({
      name: "input",
    });
  }
}

export default Module;
