import { AudioModule } from "../Module";
import {
  AnyInput,
  AnyOuput,
  AudioInput,
  AudioOutput,
  ForwardInput,
  ForwardOutput,
  MidiInput,
  MidiOutput,
} from ".";
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

export function plugCompatibleIO(input: AnyInput, output: AnyOuput) {
  if (input instanceof AudioInput && output instanceof AudioOutput) {
    input.plug(output);
  } else if (input instanceof MidiInput && output instanceof MidiOutput) {
    input.plug(output);
  } else if (input instanceof ForwardInput && output instanceof ForwardOutput) {
    input.plug(output);
  } else if (input instanceof ForwardInput && output instanceof MidiOutput) {
    input.plug(output);
  } else if (input instanceof ForwardInput && output instanceof AudioOutput) {
    input.plug(output);
  } else if (input instanceof AudioInput && output instanceof ForwardOutput) {
    input.plug(output);
  } else if (input instanceof MidiInput && output instanceof ForwardOutput) {
    input.plug(output);
  } else {
    throw Error("Input and output type is not compatible");
  }
}

export function unPlugCompatibleIO(input: AnyInput, output: AnyOuput) {
  if (input instanceof AudioInput && output instanceof AudioOutput) {
    input.unPlug(output);
  } else if (input instanceof MidiInput && output instanceof MidiOutput) {
    input.unPlug(output);
  } else if (input instanceof ForwardInput && output instanceof ForwardOutput) {
    input.unPlug(output);
  } else if (input instanceof ForwardInput && output instanceof MidiOutput) {
    input.unPlug(output);
  } else if (input instanceof ForwardInput && output instanceof AudioOutput) {
    input.unPlug(output);
  } else if (input instanceof AudioInput && output instanceof ForwardOutput) {
    input.unPlug(output);
  } else if (input instanceof MidiInput && output instanceof ForwardOutput) {
    input.unPlug(output);
  } else {
    throw Error("Input and output type is not compatible");
  }
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
