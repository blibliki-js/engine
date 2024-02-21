import Engine from "../Engine";
import { MidiEvent } from "../core/midi";
import Note from "../core/Note";
import Module, { DummnyInternalModule } from "../core/Module";
import { MidiOutput } from "../core/IO";

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
  midiOutput: MidiOutput;

  constructor(params: {
    id?: string;
    name: string;
    props: VirtualMidiInterface;
  }) {
    const { id, name, props } = params;
    super(new DummnyInternalModule(), {
      id,
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
    this.midiOutput.onMidiEvent(midiEvent);
  }

  triggerAttack = (note: Note, triggerAttack: number) => {
    this.activeNotes = [...this.activeNotes, note.fullName];
    Engine._triggerPropsUpdate(this.id, this.props);
    this.sendMidi(MidiEvent.fromNote(note, true, triggerAttack));
  };

  triggerRelease = (note: Note, triggerAttack: number) => {
    this.activeNotes = this.activeNotes.filter(
      (name) => name !== note.fullName
    );
    Engine._triggerPropsUpdate(this.id, this.props);
    this.sendMidi(MidiEvent.fromNote(note, false, triggerAttack));
  };

  serialize() {
    return {
      ...super.serialize(),
      activeNotes: this.activeNotes,
    };
  }

  private registerInputs() {
    this.registerMidiInput({
      name: "midi in",
      onMidiEvent: this.onMidiEvent,
    });
  }

  private registerOutputs() {
    this.midiOutput = this.registerMidiOutput({ name: "midi out" });
  }
}
