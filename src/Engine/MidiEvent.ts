import { now } from "tone";
import Note from "./Note";

const EvenType: { [key: number]: string } = {
  8: "noteOff",
  9: "noteOn",
};

export default class MidiEvent {
  note?: Note;
  triggeredAt: number;
  private data: Uint8Array;
  private _type: string;
  private _event: MIDIMessageEvent;

  constructor(event: MIDIMessageEvent) {
    this._event = event;
    this.triggeredAt = now();
    this.data = event.data;
    this.defineNote();
  }

  get type() {
    if (this._type) return this._type;

    let type = EvenType[this.data[0] >> 4];

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

    this.note = new Note(this._event);
  }
}
