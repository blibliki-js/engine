import { InputNode } from "tone";
import IONode, { IOType, IIONode } from "./Node";
import MonoModule, { Connectable } from "../../Module/index";
import { AnyObject } from "../../types";

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

  plug(io: AudioOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AudioOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
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

  plug(io: AudioInput, plugOther: boolean = true) {
    super.plug(io, plugOther);

    this.internalModule.connect(io.internalModule);
  }

  unPlug(io: AudioInput, plugOther: boolean = true) {
    super.plug(io, plugOther);

    this.internalModule.disconnect(io.internalModule);
  }
}
