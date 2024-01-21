import { now } from "tone";
import { ISequence } from "../../modules";
import Note, { INote } from "../Note";

const EventType: { [key: number]: MidiEventType } = {
  0x80: "noteOff",
  0x90: "noteOn",
  0xb0: "cc",
};

export type MidiEventType = "noteOn" | "noteOff" | "cc";

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
    noteOn: boolean = true,
    triggeredAt?: number
  ) {
    const note = noteName instanceof Note ? noteName : new Note(noteName);

    const event = new MidiEvent(
      new MIDIMessageEvent("", { data: note.midiData(noteOn) }),
      triggeredAt
    );
    event.notes = [note];

    return event;
  }

  static fromCC(cc: number, value: number, triggeredAt?: number) {
    return new MidiEvent(
      new MIDIMessageEvent("", { data: new Uint8Array([0xb0, cc, value]) }),
      triggeredAt
    );
  }

  constructor(event: MIDIMessageEvent, triggeredAt?: number) {
    this.event = event;
    this.triggeredAt = triggeredAt || now();
    this.data = event.data;
    this.defineNotes();
  }

  get statusByte(): number {
    return this.data[0];
  }

  get firstData(): number {
    return this.data[1];
  }

  get secondData(): number {
    return this.data[2];
  }

  get type() {
    if (this._type) return this._type;

    let type = EventType[this.statusByte & 0xf0];

    if (type === "noteOn" && this.secondData === 0) {
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
