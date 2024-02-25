import Note from "../Note";
import { IMidiInput, TMidiPortState } from "./MidiDevice";
import MidiEvent from "./MidiEvent";

const MAP_KEYS: { [key: string]: Note } = {
  a: new Note("C3"),
  s: new Note("D3"),
  d: new Note("E3"),
  f: new Note("F3"),
  g: new Note("G3"),
  h: new Note("A3"),
  j: new Note("B3"),
  k: new Note("C4"),
  l: new Note("D4"),
  w: new Note("C#3"),
  e: new Note("D#3"),
  t: new Note("F#3"),
  y: new Note("G#3"),
  u: new Note("A#3"),
  o: new Note("C#4"),
  p: new Note("D#4"),
};

const COMPUTER_KEYBOARD_DATA = {
  id: "computer_keyboard",
  name: "Computer Keyboard",
  state: "connected",
};

export default class ComputerKeyboardInput implements IMidiInput {
  id: string;
  name: string;
  state: TMidiPortState;
  onmidimessage: ((e: MidiEvent) => void) | null;

  constructor() {
    Object.assign(this, COMPUTER_KEYBOARD_DATA);
    document.addEventListener("keydown", this.onKeyTrigger(true));
    document.addEventListener("keyup", this.onKeyTrigger(false));
  }

  onKeyTrigger = (noteOn: boolean) => (event: KeyboardEvent) => {
    if (!this.onmidimessage) return;

    const note = this.extractNote(event);
    if (!note) return;

    const midiEvent = MidiEvent.fromNote(note, noteOn);
    this.onmidimessage(midiEvent);
  };

  private extractNote(event: KeyboardEvent): Note | undefined {
    if (event.repeat) return;

    return MAP_KEYS[event.key];
  }
}
