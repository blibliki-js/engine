import { AudioModule } from "../Module";
import { AnyIO } from ".";
import { deterministicId } from "../../utils";

export interface IIONode {
  name: string;
  ioType: IOType;
}

export interface IIOSerialize {
  id: string;
  name: string;
  ioType: IOType;
  moduleId: string;
  moduleName: string;
}

export enum IOType {
  AudioInput = "audioInput",
  AudioOutput = "audioOutput",
  MidiInput = "midiInput",
  MidiOutput = "midiOutput",
  ForwardInput = "forwardInput",
  ForwardOutput = "forwardOutput",
}

const IOInputs = [IOType.AudioInput, IOType.MidiInput, IOType.ForwardInput];
const IOOutputs = [IOType.AudioOutput, IOType.MidiOutput, IOType.ForwardOutput];

export function plugCompatibleIO(io1: AnyIO, io2: AnyIO): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  io1.plug(io2);
}

export function unPlugCompatibleIO(io1: AnyIO, io2: AnyIO) {
  if (!io1.connections.some((io) => io.id === io2.id)) return;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  io1.unPlug(io2);
}

export default abstract class IONode implements IIONode {
  id: string;
  ioType!: IOType;
  name!: string;
  plugableModule: AudioModule;
  connections: IONode[] = [];

  static unPlugAll(io: IONode): void {
    io.connections.forEach((otherIO) => io.unPlug(otherIO));
  }

  constructor(plugableModule: AudioModule, props: IIONode) {
    this.plugableModule = plugableModule;
    this.id = deterministicId(plugableModule.id, props.name);

    Object.assign(this, props);
  }

  plug(io: IONode, plugOther: boolean = true) {
    this.connections.push(io);
    if (plugOther) io.plug(this, false);
  }

  unPlug(io: IONode, plugOther: boolean = true) {
    this.connections = this.connections.filter(
      (currentIO) => currentIO.id !== io.id
    );
    if (plugOther) io.unPlug(this, false);
  }

  get isInput() {
    return IOInputs.indexOf(this.ioType) > -1;
  }

  get isOutput() {
    return IOOutputs.indexOf(this.ioType) > -1;
  }

  abstract unPlugAll(): void;

  serialize(): IIOSerialize {
    return {
      id: this.id,
      name: this.name,
      moduleId: this.plugableModule.id,
      moduleName: this.plugableModule.name,
      ioType: this.ioType,
    };
  }
}
