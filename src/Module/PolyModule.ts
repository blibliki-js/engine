import MidiEvent from "../MidiEvent";
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
  Volume = "volume",
}

interface PolyModuleInterface extends ModuleInterface {}

export default abstract class PolyModule<
  MonoAudioModule extends Module<Connectable, any>,
  PropsInterface
> {
  readonly id: string;
  _name: string;
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

    this.numberOfVoices = 1;

    Object.assign(this, { props: extraProps });
    this.registerNumberOfVoicesInput();
  }

  get type() {
    return this._type;
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this.audioModules.forEach((m) => (m.name = value));
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

  dispose() {
    this.audioModules.forEach((m) => {
      m.dispose();
    });
  }

  midiTriggered = (midiEvent: MidiEvent, voiceNo: number = 0) => {
    const audioModule = this.findVoice(voiceNo);
    audioModule?.midiTriggered(midiEvent);
  };

  serialize() {
    if (this.audioModules.length === 0)
      throw Error("There isn't any initialized module");

    return {
      ...this.audioModules[0].serialize(),
      id: this.id,
      type: this.type,
      inputs: this.inputs.map((i) => i.serialize()),
      outputs: this.outputs.map((i) => i.serialize()),
    };
  }

  protected connect = (
    inputAudioModule: AudioModule,
    attribute: string = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        if (m.voiceNo === undefined) throw Error("Voice error");

        const audioModule = this.findVoice(m.voiceNo);
        audioModule?.connect(m, attribute);
      });
      return;
    }

    this.audioModules.forEach((m) => m.connect(inputAudioModule, attribute));
  };

  protected disconnect = (
    inputAudioModule: AudioModule,
    attribute: string = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        if (m.voiceNo === undefined) throw Error("Voice error");

        const audioModule = this.findVoice(m.voiceNo);

        try {
          audioModule?.disconnect(m, attribute);
        } catch (e) {
          console.log(e);
        }
      });
      return;
    }

    try {
      this.audioModules.forEach((m) =>
        m.disconnect(inputAudioModule, attribute)
      );
    } catch (e) {
      console.log(e);
    }
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
    return this.audioModules.find((m) => m.voiceNo === voiceNo);
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

  private registerNumberOfVoicesInput() {
    this.registerInput({
      name: "number of voices",
    });
  }

  private adjustNumberOfModules() {
    if (this.audioModules.length === this.numberOfVoices) return;

    if (this.audioModules.length > this.numberOfVoices) {
      const audioModule = this.audioModules.pop();
      audioModule?.dispose();
    } else {
      const props = this.audioModules.length ? this.props : {};
      const audioModule = createModule(this.name, this.childrenType, {
        ...props,
        voiceNo: this.audioModules.length,
      });

      if (audioModule instanceof PolyModule)
        throw Error("Polymodule not supported");

      this.audioModules.push(audioModule as MonoAudioModule);
    }

    this.adjustNumberOfModules();
  }
}
