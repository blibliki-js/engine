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

  plug(io: MidiOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: MidiOutput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }
}

export class MidiOutput extends IONode implements IMidiOutput {
  declare ioType: IOType.MidiOutput;
  declare connections: MidiInput[];

  constructor(plugableModule: AudioModule, props: IIONode) {
    super(plugableModule, props);
  }

  plug(io: MidiInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  unPlug(io: MidiInput, plugOther: boolean = true) {
    super.plug(io, plugOther);
  }

  onMidiEvent = (event: MidiEvent) => {
    this.connections.forEach((input) => {
      input.onMidiEvent(event);
    });
  };
}
