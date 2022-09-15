import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiEvent from "Engine/MidiEvent";
import Voice from "Engine/Voice";

class Engine {
  private static instance: Engine;
  voice: Voice;

  private constructor() {
    this.voice = new Voice(0);
    this.registerMidiEvents();
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  registerModule(name: string, code: string, type: string, props: any = {}) {
    return this.voice.registerModule(name, code, type, props);
  }

  updatePropsModule(code: string, props: any) {
    return this.voice.updatePropsModule(code, props);
  }

  triggerKey(noteName: string, type: string) {
    this.voice.triggerKey(noteName, type);
  }

  dispose() {
    this.voice.dispose();
  }

  private registerMidiEvents() {
    MidiDeviceManager.onNote((midiEvent: MidiEvent) => {
      const { note } = midiEvent;

      if (!note) return;

      this.triggerKey(note.fullName, midiEvent.type);
    });
  }
}

export default Engine.getInstance();
