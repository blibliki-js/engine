import MidiEvent from "./MidiEvent";
import MidiDeviceManager from "./MidiDeviceManager";

export interface MidiDeviceInterface {
  id: string;
  name: string;
  state: string;
  selected: boolean;
}

export default class MidiDevice implements MidiDeviceInterface {
  id: string;
  name: string;
  state: string;
  selected: boolean;
  noteCallback: Function;

  private _midi: MIDIInput;

  constructor(midi: MIDIInput) {
    this.id = midi.id;
    this.name = midi.name || `Device ${midi.id}`;
    this.state = midi.state;
    this.selected = false;
    this._midi = midi;

    this.connect();
  }

  connect() {
    this._midi.onmidimessage = (e) => {
      if (!this.selected) return;

      const isMidiEvent = e instanceof MIDIMessageEvent;

      if (!isMidiEvent) return;

      this._processEvent(e);
    };
  }

  disconnect() {
    this._midi.onmidimessage = null;
  }

  serialize() {
    const { id, name, state, selected } = this;

    return { id, name, state, selected };
  }

  select(value: boolean = true) {
    this.selected = value;
  }

  _processEvent(e: MIDIMessageEvent) {
    const event = new MidiEvent(e);

    switch (event.type) {
      case "noteOn":
      case "noteOff":
        MidiDeviceManager.noteCallback(event);
    }
  }
}
