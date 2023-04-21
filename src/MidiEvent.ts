import { now } from "tone";
import Note, { INote } from "./Note";

const EventType: { [key: number]: string } = {
  8: "noteOff",
  9: "noteOn",
};

export default class MidiEvent {
  note?: Note;
  readonly triggeredAt: number;
  _type: string;
  private data: Uint8Array;
  private event: MIDIMessageEvent;

  static fromNote(
    noteName: string | Note | INote,
    type: string,
    triggeredAt?: number
  ) {
    const event = new MidiEvent(
      new MIDIMessageEvent("", { data: new Uint8Array([0, 0, 0]) }),
      triggeredAt
    );

    if (noteName instanceof Note) {
      event.note = noteName;
    } else {
      event.note = new Note(noteName);
    }
    event._type = type;

    return event;
  }

  constructor(event: MIDIMessageEvent, triggeredAt?: number) {
    this.event = event;
    this.triggeredAt = triggeredAt || now();
    this.data = event.data;
    this.defineNote();
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

  defineNote() {
    if (!this.isNote) return;

    this.note = new Note(this.event);
  }
}
