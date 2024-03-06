import { AnyMidiInput, AnyMidiOuput } from ".";
import { AudioModule } from "../Module";
import { MidiEvent } from "../midi";
import IONode, { IOType, IIONode } from "./Node";

export interface IMidiInput extends IIONode {
  ioType: IOType.MidiInput;
  onMidiEvent: (event: MidiEvent) => void;
}
export interface IMidiOutput extends IIONode {
  ioType: IOType.MidiOutput;
}

export class MidiInput extends IONode implements IMidiInput {
  declare ioType: IOType.MidiInput;
  declare connections: MidiOutput[];
  onMidiEvent: (event: MidiEvent) => void;

  constructor(plugableModule: AudioModule, props: IMidiInput) {
    super(plugableModule, props);

    this.onMidiEvent = props.onMidiEvent;
  }

  plug(io: AnyMidiOuput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AnyMidiOuput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }
}

export class MidiOutput extends IONode implements IMidiOutput {
  declare ioType: IOType.MidiOutput;
  declare connections: MidiInput[];

  constructor(plugableModule: AudioModule, props: IIONode) {
    super(plugableModule, props);
  }

  plug(io: AnyMidiInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: AnyMidiInput, plugOther: boolean = true) {
    super.unPlug(io, plugOther);
  }

  unPlugAll() {
    IONode.unPlugAll(this);
  }

  onMidiEvent = (event: MidiEvent) => {
    this.midiConnections.forEach((input) => {
      input.onMidiEvent(event);
    });
  };

  private get midiConnections() {
    return this.connections.filter((input) => input instanceof MidiInput);
  }
}
