import { Part } from "tone";
import Module, { DummnyInternalModule } from "./Base";
import Note, { INote } from "../Note";
import { Output } from "./IO";
import MidiEvent from "../MidiEvent";

interface ISequencer {
  notes: INote[];
}

const InitialProps: ISequencer = {
  notes: [],
};

export default class Sequencer extends Module<
  DummnyInternalModule,
  ISequencer
> {
  static moduleName = "Sequencer";
  midiOutput: Output;
  private _part: Part;

  constructor(name: string, props: Partial<ISequencer>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerOutputs();
    this.start();
  }

  get notes() {
    return this._props["notes"];
  }

  set notes(value: INote[]) {
    const notes = value;
    this._props = { ...this.props, notes };
    this.updateNotesToPart();
  }

  start() {
    this.part.start();
  }

  stop() {
    this.part.stop();
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({ name: "midi out" });
  }

  private get part() {
    if (this._part) return this._part;

    this._part = new Part(this.onEvent, this.notes);
    this._part.loop = true;
    this._part.loopEnd = this.loopEnd;

    return this._part;
  }

  private updateNotesToPart() {
    this.part.clear();

    this.notes.forEach((note) => {
      this.part.add(note.time, note);
    });
  }

  private get loopEnd() {
    const end =
      Math.max(
        ...this.notes.map((note) => parseInt(note.time.split(":")[0], 10))
      ) + 1;

    return `${end}:0:0`;
  }

  private onEvent = (time: number, note: INote) => {
    const event = MidiEvent.fromNote(note, "noteOn", time);

    this.midiOutput.connections.forEach((input) => {
      input.pluggable(event);
    });
  };
}
