import MonoModule, { AudioModule, PolyModule } from "../Module";
import IO, { IOType } from "./Node";
import { AudioInput, AudioOutput } from "./AudioNode";
import { MidiInput, MidiOutput } from "./MidiNode";
import { IAnyIO } from ".";
import { ForwardInput, ForwardOutput } from "./ForwardNode";

export default class IOCollection<AnyIO extends IO> {
  plugableModule: AudioModule;
  collection: AnyIO[] = [];

  constructor(plugableModule: AudioModule) {
    this.plugableModule = plugableModule;
  }
  add<CurrentIO extends AnyIO>(props: IAnyIO): CurrentIO {
    let io;

    switch (props.ioType) {
      case IOType.AudioInput:
        if (this.plugableModule instanceof PolyModule) {
          throw Error("PolyModule is not supported");
        }

        io = new AudioInput(this.plugableModule, props);
        break;
      case IOType.AudioOutput:
        if (this.plugableModule instanceof PolyModule) {
          throw Error("PolyModule is not supported");
        }

        io = new AudioOutput(this.plugableModule, props);
        break;
      case IOType.ForwardInput:
        if (this.plugableModule instanceof MonoModule) {
          throw Error("MonoModule is not supported");
        }

        io = new ForwardInput(this.plugableModule, props);
        break;
      case IOType.ForwardOutput:
        if (this.plugableModule instanceof MonoModule) {
          throw Error("MonoModule is not supported");
        }

        io = new ForwardOutput(this.plugableModule, props);
        break;
      case IOType.MidiInput:
        io = new MidiInput(this.plugableModule, props);
        break;
      case IOType.MidiOutput:
        io = new MidiOutput(this.plugableModule, props);
        break;
      default:
        throw Error("Unknown IOType");
    }

    this.collection.push(io as unknown as CurrentIO);
    return io as unknown as CurrentIO;
  }

  unPlugAll() {
    this.collection.forEach((io) => io.unPlugAll());
  }

  find(id: string) {
    return this.collection.find((io) => io.id === id);
  }

  findByName(name: string) {
    return this.collection.find((io) => io.name === name);
  }

  serialize() {
    return this.collection.map((io) => io.serialize());
  }
}
