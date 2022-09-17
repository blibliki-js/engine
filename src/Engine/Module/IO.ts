import { v4 as uuidv4 } from "uuid";

import Module, { Connectable } from "./Base";

export interface IOInterface {
  name: string;
  pluggable: any;
  onPlug?: (io: IO) => void;
  onUnPlug?: (io: IO) => void;
}

interface SerializeInterface {
  name: string;
  connections: string[];
}

enum IOType {
  Input = "input",
  Output = "output",
}

abstract class IO {
  id: string;
  ioType: IOType;
  name: string;
  audioModule: Module<Connectable, any>;
  pluggable: any;
  onPlug: (io: IO) => void;
  onUnPlug: (io: IO) => void;
  connections: Input[] | Output[] = [];

  constructor(
    ioType: IOType,
    audioModule: Module<Connectable, any>,
    props: IOInterface
  ) {
    this.id = uuidv4();
    this.ioType = ioType;
    this.audioModule = audioModule;

    Object.assign(this, props);
  }

  plug(io: IO) {
    if (this.onPlug) this.onPlug(io);

    if (this.ioType === IOType.Output) io.plug(this);

    this.connections.push(io);
  }

  unPlug(io: IO) {
    if (this.onUnPlug) this.onUnPlug(io);

    if (this.ioType === IOType.Output) io.unPlug(this);

    this.connections = this.connections.filter(
      (current_io) => current_io.id === io.id
    );
  }

  serialize(): SerializeInterface {
    return {
      name: this.name,
      connections: this.connections.map((c) => c.name),
    };
  }
}

export class Input extends IO {
  constructor(audioModule: Module<Connectable, any>, props: IOInterface) {
    super(IOType.Input, audioModule, props);
  }
}

export class Output extends IO {
  constructor(audioModule: Module<Connectable, any>, props: IOInterface) {
    super(IOType.Output, audioModule, props);
  }
}
