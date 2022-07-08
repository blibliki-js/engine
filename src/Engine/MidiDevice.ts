import MidiEvent from "./MidiEvent";

export default class MidiDevice {
  id: string;
  name: string;
  state: string;
  noteCallback: Function;

  private _midi: MIDIInput;

  constructor(midi: MIDIInput) {
    this.id = midi.id;
    this.name = midi.name || `Device ${midi.id}`;
    this.state = midi.state;
    this._midi = midi;
  }

  connect() {
    this._midi.onmidimessage = (e) => {
      const isMidiEvent = e instanceof MIDIMessageEvent;

      if (!isMidiEvent) return;

      this._processEvent(e);
    };
  }

  disconnect() {
    this._midi.onmidimessage = null;
  }

  onNote(callback: Function) {
    this.noteCallback = callback;
  }

  _processEvent(e: MIDIMessageEvent) {
    const event = new MidiEvent(e);

    switch (event.type) {
      case "noteOn":
      case "noteOff":
        this.noteCallback(event);
    }
  }
}
