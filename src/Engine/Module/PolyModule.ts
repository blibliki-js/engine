import MidiEvent from "Engine/MidiEvent";
import { InputNode } from "tone";
import { v4 as uuidv4 } from "uuid";
import { createModule } from ".";
import Module, { ModuleInterface, ModuleType, Connectable } from "./Base";
import { Input, Output, IOInterface } from "./IO";
import { AudioModule } from "../Module";

export enum PolyModuleType {
  Oscillator = "oscillator",
  Envelope = "envelope",
  AmpEnvelope = "ampEnvelope",
  FreqEnvelope = "freqEnvelope",
  VoiceScheduler = "voiceScheduler",
  Filter = "filter",
}

interface PolyModuleInterface extends ModuleInterface {}

export default abstract class PolyModule<
  MonoAudioModule extends Module<Connectable, any>,
  PropsInterface
> {
  readonly id: string;
  name: string;
  code: string;
  audioModules: MonoAudioModule[];
  inputs: Input[] = [];
  outputs: Output[] = [];
  readonly _type: PolyModuleType;
  readonly childrenType: ModuleType;
  private _numberOfVoices: number;

  constructor(type: PolyModuleType, props: PolyModuleInterface) {
    this.id = uuidv4();
    this._type = type;
    this.childrenType = props.type;
    this.audioModules = [];

    const { props: extraProps, ...basicProps } = props;
    Object.assign(this, basicProps);

    this.numberOfVoices = 6;

    Object.assign(this, { props: extraProps });
  }

  get type() {
    return this._type;
  }

  // Do nothing
  // This is a little hack to avoid override type by children module
  set type(value: PolyModuleType) {}

  get props() {
    if (this.audioModules.length === 0) {
      throw Error("There isn't any initialized module");
    }

    return this.audioModules[0].props;
  }

  set props(value: PropsInterface) {
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

  dispose() {
    this.audioModules.forEach((m) => {
      m.dispose();
    });
  }

  midiTriggered = (midiEvent: MidiEvent, voiceNo: number) => {
    const audioModule = this.findVoice(voiceNo);
    audioModule.midiTriggered(midiEvent);
  };

  serialize() {
    if (this.audioModules.length === 0)
      throw Error("There isn't any initialized module");

    return {
      ...this.audioModules[0].serialize(),
      id: this.id,
      type: this.type,
    };
  }

  protected connect = (inputNode: InputNode, voiceNo?: number) => {
    if (voiceNo !== undefined) {
      const audioModule = this.findVoice(voiceNo);
      audioModule.connect(inputNode);
      return;
    }

    this.audioModules.forEach((m) => m.connect(inputNode));
  };

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

  protected find(callback: (audioModule: MonoAudioModule) => boolean) {
    const audioModule = this.audioModules.find(callback);
    if (!audioModule) throw Error(`Audio module not found`);

    return audioModule;
  }

  protected findVoice(voiceNo: number) {
    const audioModule = this.audioModules.find((m) => m.voiceNo === voiceNo);

    if (!audioModule) {
      throw Error(`Voice number ${voiceNo} not found in ${this.name}`);
    }

    return audioModule;
  }

  private adjustNumberOfModules() {
    if (this.audioModules.length === this.numberOfVoices) return;

    if (this.audioModules.length > this.numberOfVoices) {
      const audioModule = this.audioModules.pop();
      audioModule?.dispose();
    } else {
      const props = this.audioModules.length ? this.props : {};
      const audioModule = createModule(
        this.name,
        this.code,
        this.childrenType,
        { ...props, voiceNo: this.audioModules.length }
      );

      if (audioModule instanceof PolyModule)
        throw Error("Polymodule not supported");

      this.audioModules.push(audioModule as MonoAudioModule);
    }

    this.adjustNumberOfModules();
  }
}
