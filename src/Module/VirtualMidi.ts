import MidiEvent from "../MidiEvent";
import Module, { ModuleType, DummnyInternalModule } from "./Base";
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
  midiOutput: Output;

  constructor(name: string, props: VirtualMidiInterface) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps, ...props },
      type: ModuleType.VirtualMidi,
    });

    this.registerInputs();
    this.registerOutputs();
  }

  get activeNotes() {
    return this._props["activeNotes"];
  }

  set activeNotes(value: string[]) {
    this._props = { ...this.props, activeNotes: value };
  }

  sendMidi(midiEvent: MidiEvent) {
    this.midiOutput.connections.forEach((input) => {
      input.pluggable(midiEvent);
    });
  }

  triggerAttack(midiEvent: MidiEvent) {
    if (!midiEvent.note) return;

    this.activeNotes = [...this.activeNotes, midiEvent.note.fullName];
  }

  triggerRelease(midiEvent: MidiEvent) {
    if (!midiEvent.note) return;

    this.activeNotes = this.activeNotes.filter(
      (name) => name !== midiEvent.note!.fullName
    );
  }

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
