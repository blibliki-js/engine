import { MidiEvent } from "../midi";
import { v4 as uuidv4 } from "uuid";
import Module, { Connectable } from "./MonoModule";
import {
  IOCollection,
  IOType,
  IMidiInput,
  IMidiOutput,
  MidiOutput,
  MidiInput,
  AnyInput,
  AnyOuput,
  ForwardAudioInput,
} from "../IO";
import { AudioModule } from "./index";
import { plugCompatibleIO } from "../IO/Node";
import { deterministicId } from "../../utils";
import {
  ForwardAudioOutput,
  IForwardAudioInput,
  IForwardAudioOutput,
} from "../IO/ForwardNode";

interface PolyModuleInterface<MonoAudioModule, PropsInterface> {
  id?: string;
  name: string;
  numberOfVoices?: number;
  child: new (params: {
    id?: string;
    name: string;
    props: PropsInterface;
  }) => MonoAudioModule;
  props: PropsInterface;
}

export default abstract class PolyModule<
  MonoAudioModule extends Module<Connectable, PropsInterface>,
  PropsInterface
> {
  static readonly moduleName: string;

  readonly id: string;
  readonly child: new (params: {
    id?: string;
    name: string;
    props: PropsInterface;
  }) => MonoAudioModule;
  _name: string;
  audioModules: MonoAudioModule[];
  inputs: IOCollection<AnyInput>;
  outputs: IOCollection<AnyOuput>;
  private _numberOfVoices: number;

  constructor(params: PolyModuleInterface<MonoAudioModule, PropsInterface>) {
    this.id = params.id || uuidv4();
    delete params.id;

    this.audioModules = [];

    const { child, props: extraProps, ...basicProps } = params;
    this.child = child;
    Object.assign(this, basicProps);

    this.numberOfVoices = params.numberOfVoices || 1;
    this.inputs = new IOCollection<AnyInput>(this);
    this.outputs = new IOCollection<AnyOuput>(this);

    Object.assign(this, { props: extraProps });
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this.audioModules.forEach((m) => (m.name = value));
  }

  get props() {
    if (this.audioModules.length === 0) {
      throw Error("There isn't any initialized module");
    }

    return this.audioModules[0].props;
  }

  set props(value: PropsInterface) {
    Object.assign(this, value);
    this.audioModules.forEach((m) => (m.props = value));
  }

  get numberOfVoices() {
    return this._numberOfVoices;
  }

  set numberOfVoices(value: number) {
    this._numberOfVoices = value;
    this.adjustNumberOfModules();
  }

  plug(audioModule: AudioModule, from: string, to: string) {
    const output = this.outputs.findByName(from);
    if (!output) throw Error(`Output ${from} not exist`);

    const input = audioModule.inputs.findByName(to);
    if (!input) throw Error(`Input ${to} not exist`);

    plugCompatibleIO(input, output);
  }

  unPlugAll() {
    this.outputs.unPlugAll();
  }

  dispose() {
    this.unPlugAll();
    this.audioModules.forEach((m) => m.dispose());
  }

  onMidiEvent = (midiEvent: MidiEvent) => {
    const voiceNo = midiEvent.voiceNo || 0;
    const audioModule = this.findVoice(voiceNo);
    audioModule?.onMidiEvent(midiEvent);
  };

  serialize() {
    if (this.audioModules.length === 0)
      throw Error("There isn't any initialized module");

    const klass = this.constructor as typeof PolyModule;

    return {
      ...this.audioModules[0].serialize(),
      id: this.id,
      type: klass.moduleName,
      numberOfVoices: this.numberOfVoices,
      inputs: this.inputs.serialize(),
      outputs: this.outputs.serialize(),
    };
  }

  protected find(callback: (audioModule: MonoAudioModule) => boolean) {
    const audioModule = this.audioModules.find(callback);
    if (!audioModule) throw Error(`Audio module not found`);

    return audioModule;
  }

  protected findVoice(voiceNo: number) {
    return this.audioModules.find((m) => m.voiceNo === voiceNo);
  }

  protected registerForwardAudioInput(
    props: Omit<IForwardAudioInput, "ioType">
  ): ForwardAudioInput {
    return this.inputs.add({ ...props, ioType: IOType.ForwardAudioInput });
  }

  protected registerForwardAudioOutput(
    props: Omit<IForwardAudioOutput, "ioType">
  ): ForwardAudioOutput {
    return this.outputs.add({ ...props, ioType: IOType.ForwardAudioOutput });
  }

  protected registerMidiInput(props: Omit<IMidiInput, "ioType">): MidiInput {
    return this.inputs.add({ ...props, ioType: IOType.MidiInput });
  }

  protected registerMidiOutput(props: Omit<IMidiOutput, "ioType">): MidiOutput {
    return this.outputs.add({ ...props, ioType: IOType.MidiOutput });
  }

  protected registerBasicOutputs() {
    this.registerForwardAudioOutput({ name: "output" });
  }

  protected registerBasicInputs() {
    this.registerForwardAudioInput({ name: "input" });
    this.registerMidiIn();
  }

  protected registerMidiIn() {
    this.registerMidiInput({
      name: "midi in",
      onMidiEvent: this.onMidiEvent,
    });
  }

  private adjustNumberOfModules() {
    if (this.audioModules.length === this.numberOfVoices) return;

    if (this.audioModules.length > this.numberOfVoices) {
      const audioModule = this.audioModules.pop();
      audioModule?.dispose();
    } else {
      const voiceNo = this.audioModules.length;
      const id = deterministicId(this.id, voiceNo.toString());
      const props = voiceNo === 0 ? ({} as PropsInterface) : this.props;
      const audioModule = new this.child({
        id,
        name: this.name,
        props: {
          ...props,
          voiceNo,
        },
      });

      if (audioModule instanceof PolyModule) {
        throw Error("Polymodule not supported");
      }

      this.audioModules.push(audioModule);
    }

    this.adjustNumberOfModules();
  }
}
