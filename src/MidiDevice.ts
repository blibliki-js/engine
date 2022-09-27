import MidiEvent from "./MidiEvent";

export interface MidiDeviceInterface {
  id: string;
  name: string;
  state: string;
}

export type EventListerCallback = (event: MidiEvent) => void;

export default class MidiDevice implements MidiDeviceInterface {
  id: string;
  name: string;
  state: string;
  eventListerCallbacks: EventListerCallback[] = [];

  private _midi: MIDIInput;

  constructor(midi: MIDIInput) {
    this.id = midi.id;
    this.name = midi.name || `Device ${midi.id}`;
    this.state = midi.state;
    this._midi = midi;

    this.connect();
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

  serialize() {
    const { id, name, state } = this;

    return { id, name, state };
  }

  addEventListener(callback: EventListerCallback) {
    this.eventListerCallbacks.push(callback);
  }

  removeEventListener(callback: EventListerCallback) {
    this.eventListerCallbacks = this.eventListerCallbacks.filter(
      (c) => c === callback
    );
  }

  _processEvent(e: MIDIMessageEvent) {
    const event = new MidiEvent(e);

    switch (event.type) {
      case "noteOn":
      case "noteOff":
        this.eventListerCallbacks.forEach((callback) => callback(event));
    }
  }
}
