import { now } from "tone";
import { ISequence } from "../../modules";
import Note, { INote } from "../Note";

const EventType: { [key: number]: MidiEventType } = {
  8: "noteOff",
  9: "noteOn",
};

export type MidiEventType = "noteOn" | "noteOff";

export default class MidiEvent {
  notes: Note[];
  readonly triggeredAt: number;
  _type: MidiEventType;
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
    type: MidiEventType,
    triggeredAt?: number
  ) {
    const note = noteName instanceof Note ? noteName : new Note(noteName);

    const event = new MidiEvent(
      new MIDIMessageEvent("", { data: note.midiData }),
      triggeredAt
    );

    event.notes = [note];
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
