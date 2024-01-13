import { now } from "tone";
import { ISequence } from "./Module/Sequencer";
import Note, { INote } from "./Note";

const EventType: { [key: number]: EType } = {
  8: "noteOff",
  9: "noteOn",
};

export type EType = "noteOn" | "noteOff";

export default class MidiEvent {
  notes: Note[];
  readonly triggeredAt: number;
  _type: EType;
  private data: Uint8Array;
  private event: MIDIMessageEvent;

  static fromSequence(sequence: ISequence, triggeredAt: number) {
    const event = new MidiEvent(
      new MIDIMessageEvent("", { data: new Uint8Array([0, 0, 0]) }),
      triggeredAt
    );
    event._type = "noteOn";
    event.notes = sequence.notes.map((n) => new Note(n));

    return event;
  }

  static fromNote(
    noteName: string | Note | INote,
    type: EType,
    triggeredAt?: number
  ) {
    const event = new MidiEvent(
      new MIDIMessageEvent("", { data: new Uint8Array([0, 0, 0]) }),
      triggeredAt
    );

    if (noteName instanceof Note) {
      event.notes = [noteName];
    } else {
      event.notes = [new Note(noteName)];
    }
    event._type = type;

    return event;
  }

  constructor(event: MIDIMessageEvent, triggeredAt?: number) {
    this.event = event;
    this.triggeredAt = triggeredAt || now();
    this.data = event.data;
    this.defineNotes();
  }

  get type() {
    if (this._type) return this._type;

    let type = EventType[this.data[0] >> 4];

    if (type === "noteOn" && this.data[2] === 0) {
      type = "noteOff";
    }

    return (this._type = type);
  }

  get isNote() {
    return this.type === "noteOn" || this.type === "noteOff";
  }

  defineNotes() {
    if (!this.isNote) return;
    if (this.notes) return;

    this.notes = [new Note(this.event)];
  }
}
