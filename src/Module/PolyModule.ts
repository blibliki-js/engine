import MidiEvent from "../MidiEvent";
import { v4 as uuidv4 } from "uuid";
import Module, { Connectable, Voicable } from "./Base";
import {
  IOCollection,
  ForwardInput,
  ForwardOutput,
  IOType,
  IMidiInput,
  IMidiOutput,
  IForwardInput,
  IForwardOutput,
  MidiOutput,
  MidiInput,
} from "../core/IO";
import { AudioModule } from "../Module";

interface PolyModuleInterface<MonoAudioModule, PropsInterface> {
  name: string;
  child: new (name: string, props: PropsInterface) => MonoAudioModule;
  props: PropsInterface;
}

export default abstract class PolyModule<
  MonoAudioModule extends Module<Connectable, PropsInterface>,
  PropsInterface extends Voicable
> {
  static readonly moduleName: string;

  readonly id: string;
  readonly child: new (name: string, props: PropsInterface) => MonoAudioModule;
  _name: string;
  audioModules: MonoAudioModule[];
  inputs: IOCollection<ForwardInput | MidiInput>;
  outputs: IOCollection<ForwardOutput | MidiOutput>;
  private _numberOfVoices: number;

  constructor(params: PolyModuleInterface<MonoAudioModule, PropsInterface>) {
    this.id = uuidv4();
    this.audioModules = [];

    const { child, props: extraProps, ...basicProps } = params;
    this.child = child;
    Object.assign(this, basicProps);

    this.numberOfVoices = 1;
    this.inputs = new IOCollection<ForwardInput>(this);
    this.outputs = new IOCollection<ForwardOutput>(this);

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
    if (audioModule instanceof PolyModule) {
      this.audioModules.forEach((mSrc) => {
        if (mSrc.voiceNo === undefined) throw Error("Missing voiceNo");

        const mDest = audioModule.findVoice(mSrc.voiceNo);
        if (!mDest) return;

        mSrc.plug(mDest, from, to);
      });
      return;
    }

    this.audioModules.forEach((m) => m.plug(audioModule, from, to));
  }

  unPlugAll() {
    this.outputs.unPlugAll();
  }

  dispose() {
    this.unPlugAll();
    this.audioModules.forEach((m) => m.dispose());
  }

  onMidiEvent = (midiEvent: MidiEvent, voiceNo = 0, noteIndex?: number) => {
    const audioModule = this.findVoice(voiceNo);
    audioModule?.onMidiEvent(midiEvent, noteIndex);
  };

  serialize() {
    if (this.audioModules.length === 0)
      throw Error("There isn't any initialized module");

    const klass = this.constructor as typeof PolyModule;

    return {
      ...this.audioModules[0].serialize(),
      id: this.id,
      type: klass.moduleName,
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

  protected registerInput(props: Omit<IForwardInput, "ioType">): ForwardInput {
    return this.inputs.add({ ...props, ioType: IOType.ForwardInput });
  }

  protected registerOutput(
    props: Omit<IForwardOutput, "ioType">
  ): ForwardOutput {
    return this.outputs.add({ ...props, ioType: IOType.ForwardOutput });
  }

  protected registerMidiInput(props: Omit<IMidiInput, "ioType">): MidiInput {
    return this.inputs.add({ ...props, ioType: IOType.MidiInput });
  }

  protected registerMidiOutput(props: Omit<IMidiOutput, "ioType">): MidiOutput {
    return this.outputs.add({ ...props, ioType: IOType.MidiOutput });
  }

  protected registerBasicOutputs() {
    this.registerOutput({ name: "output" });
  }

  protected registerBasicInputs() {
    this.registerInput({ name: "input" });
    this.registerInput({ name: "midi input" });
  }

  private adjustNumberOfModules() {
    if (this.audioModules.length === this.numberOfVoices) return;

    if (this.audioModules.length > this.numberOfVoices) {
      const audioModule = this.audioModules.pop();
      audioModule?.dispose();
    } else {
      const props = this.audioModules.length
        ? this.props
        : ({} as PropsInterface);
      const audioModule = new this.child(this.name, {
        ...props,
        voiceNo: this.audioModules.length,
      });

      if (audioModule instanceof PolyModule)
        throw Error("Polymodule not supported");

      this.audioModules.push(audioModule);
    }

    this.adjustNumberOfModules();
  }
}
