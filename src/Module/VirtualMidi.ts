import Engine from "../Engine";
import MidiEvent from "../MidiEvent";
import Note from "../Note";
import Module, { DummnyInternalModule } from "./Base";
import { Output } from "./IO";

export interface VirtualMidiInterface {
  activeNotes: string[];
}

const InitialProps: VirtualMidiInterface = {
  activeNotes: [],
};

export default class VirtualMidi extends Module<
  DummnyInternalModule,
  VirtualMidiInterface
> {
  static moduleName = "VirtualMidi";
  midiOutput: Output;

  constructor(name: string, props: VirtualMidiInterface) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerInputs();
    this.registerOutputs();
  }

  get activeNotes() {
    return this._props["activeNotes"];
  }

  // can't set externaly
  set activeNotes(value: string[]) {
    this._props = { ...this.props, activeNotes: value };
  }

  sendMidi(midiEvent: MidiEvent) {
    this.midiOutput.connections.forEach((input) => {
      input.pluggable(midiEvent);
    });
  }

  triggerAttack = (note: Note) => {
    this.activeNotes = [...this.activeNotes, note.fullName];
    Engine._triggerPropsUpdate(this.id, this.props);
  };

  triggerRelease = (note: Note) => {
    this.activeNotes = this.activeNotes.filter(
      (name) => name !== note.fullName
    );
    Engine._triggerPropsUpdate(this.id, this.props);
  };

  serialize() {
    return {
      ...super.serialize(),
      activeNotes: this.activeNotes,
    };
  }

  private registerInputs() {
    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({ name: "midi out" });
  }
}
