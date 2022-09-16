import MidiDeviceManager from "Engine/MidiDeviceManager";
import MidiEvent from "Engine/MidiEvent";
import VoiceManager from "Engine/VoiceManager";

class Engine {
  private static instance: Engine;
  voiceManager: VoiceManager;

  private constructor() {
    this.voiceManager = new VoiceManager(8);
    this.registerMidiEvents();
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  registerModule(name: string, code: string, type: string, props: any = {}) {
    return this.voiceManager.registerModule(name, code, type, props);
  }

  updatePropsModule(code: string, props: any) {
    return this.voiceManager.updatePropsModule(code, props);
  }

  triggerKey(noteName: string, type: string) {
    this.voiceManager.triggerKey(noteName, type);
  }

  dispose() {
    this.voiceManager.dispose();
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
