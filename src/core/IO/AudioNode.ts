import { InputNode } from "tone";
import IONode, { IOType, IIONode } from "./Node";
import MonoModule, { Connectable } from "../Module/index";
import { AnyObject } from "../../types";
import { ForwardAudioInput } from "./ForwardNode";
import { AnyAudioInput, AnyAudioOuput } from ".";

export type AudioIO = AudioInput | AudioOutput;

export interface IAudioInput extends IIONode {
  ioType: IOType.AudioInput;
  internalModule: InputNode;
}

export interface IAudioOutput extends IIONode {
  ioType: IOType.AudioOutput;
  internalModule: IInternalModule;
}

interface IInternalModule extends Connectable {}

export class AudioInput extends IONode implements IAudioInput {
  declare ioType: IOType.AudioInput;
  internalModule!: InputNode;
  declare connections: AudioOutput[];

  constructor(
    plugableModule: MonoModule<Connectable, AnyObject>,
    props: IAudioInput
  ) {
    super(plugableModule, props);
    this.internalModule = props.internalModule;
  }

  plug(io: AnyAudioOuput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AnyAudioOuput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }
}

export class AudioOutput extends IONode implements IAudioOutput {
  declare ioType: IOType.AudioOutput;
  internalModule!: IInternalModule;
  declare connections: AudioInput[];

  constructor(
    plugableModule: MonoModule<Connectable, AnyObject>,
    props: IAudioOutput
  ) {
    super(plugableModule, props);
    this.internalModule = props.internalModule;
  }

  plug(io: AnyAudioInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
    if (io instanceof ForwardAudioInput) return;

    this.internalModule.connect(io.internalModule);
  }

  unPlug(io: AnyAudioInput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
    if (io instanceof ForwardAudioInput) return;

    try {
      this.internalModule.disconnect(io.internalModule);
    } catch (e) {
      console.error(e);
    }
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }
}
