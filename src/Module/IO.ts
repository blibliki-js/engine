import { v4 as uuidv4 } from "uuid";
import { AudioModule } from "../Module";

export interface IOInterface {
  name: string;
  pluggable?: any;
  onPlug?: (io: IO) => void;
  onUnPlug?: (io: IO) => void;
}

export interface SerializeInterface {
  id: string;
  name: string;
  moduleId: string;
  moduleName: string;
}

enum IOType {
  Input = "input",
  Output = "output",
}

abstract class IO {
  id: string;
  ioType: IOType;
  name: string;
  audioModule: AudioModule;
  pluggable: any;
  onPlug: (io: IO) => void;
  onUnPlug: (io: IO) => void;
  connections: Input[] | Output[] = [];

  constructor(ioType: IOType, audioModule: AudioModule, props: IOInterface) {
    this.id = uuidv4();
    this.ioType = ioType;
    this.audioModule = audioModule;

    Object.assign(this, props);
  }

  plug(io: IO) {
    this.connections.push(io);

    if (this.onPlug) this.onPlug(io);

    if (this.ioType === IOType.Output) io.plug(this);
  }

  unPlug(io: IO) {
    if (this.onUnPlug) this.onUnPlug(io);

    if (this.ioType === IOType.Output) {
      io.unPlug(this);
    }

    this.connections = this.connections.filter(
      (current_io) => current_io.id !== io.id
    );
  }

  unPlugAll() {
    this.connections.forEach((c) => this.unPlug(c));
  }

  serialize(): SerializeInterface {
    return {
      id: this.id,
      name: this.name,
      moduleId: this.audioModule.id,
      moduleName: this.audioModule.name,
    };
  }
}

export class Input extends IO {
  constructor(audioModule: AudioModule, props: IOInterface) {
    super(IOType.Input, audioModule, props);
  }
}

export class Output extends IO {
  constructor(audioModule: AudioModule, props: IOInterface) {
    super(IOType.Output, audioModule, props);
  }
}
