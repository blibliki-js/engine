import { v4 as uuidv4 } from "uuid";
import { AudioModule } from "../../Module";

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

export default abstract class IONode implements IIONode {
  id: string;
  ioType!: IOType;
  name!: string;
  plugableModule: AudioModule;
  connections: IONode[] = [];

  constructor(plugableModule: AudioModule, props: IIONode) {
    this.id = uuidv4();
    this.plugableModule = plugableModule;

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

  unPlugAll() {
    this.connections.forEach((c) => this.unPlug(c));
  }

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
