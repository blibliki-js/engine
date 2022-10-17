import Module, { ModuleType, DummnyInternalModule } from "./Base";
import MidiEvent from "../MidiEvent";
import { Output } from "./IO";
import PolyModule, { PolyModuleType } from "./PolyModule";

export interface VoiceSchedulerInterface {
  numberOfVoices: number;
}

export default class VoiceScheduler extends PolyModule<
  Voice,
  VoiceSchedulerInterface
> {
  midiOutput: Output;

  constructor(name: string, props: VoiceSchedulerInterface) {
    super(PolyModuleType.VoiceScheduler, {
      name,
      props,
      type: ModuleType.Voice,
    });

    this.registerInputs();
    this.registerOutputs();
  }

  midiTriggered = (midiEvent: MidiEvent) => {
    let voice: Voice | undefined;

    switch (midiEvent.type) {
      case "noteOn":
        voice = this.findFreeVoice();

        break;
      case "noteOff":
        voice = this.audioModules.find(
          (v) => v.activeNote === midiEvent.note?.fullName
        );
        break;
      default:
        throw Error("This type is not a note");
    }

    if (voice === undefined) return;

    voice.midiTriggered(midiEvent);
    this.midiOutput.connections.forEach((input) => {
      input.pluggable(midiEvent, voice?.voiceNo);
    });
  };

  serialize() {
    const serialize = super.serialize();
    delete serialize.props.voiceNo;

    return {
      ...serialize,
      props: { ...serialize.props, numberOfVoices: this.numberOfVoices },
    };
  }

  private findFreeVoice(): Voice {
    let voice = this.audioModules.find((v) => !v.activeNote);

    if (!voice) {
      voice = this.audioModules.sort((a, b) => {
        if (!a || !b) return 0;

        return a.triggeredAt - b.triggeredAt;
      })[0];
    }

    return voice;
  }

  private registerInputs() {
    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }

  private registerOutputs() {
    this.registerOutput({
      name: "number of voices",
    });

    this.midiOutput = this.registerOutput({ name: "midi out" });
  }
}

export interface VoiceInterface {
  voiceNo?: number;
}

export class Voice extends Module<DummnyInternalModule, VoiceInterface> {
  midiEvent: MidiEvent | null;
  activeNote: string | null;
  triggeredAt: number;
  midiOutput: Output;

  constructor(name: string, props: VoiceInterface) {
    super(new DummnyInternalModule(), {
      name,
      type: ModuleType.Voice,
      props,
    });
  }

  midiTriggered = (midiEvent: MidiEvent) => {
    const { triggeredAt, note, type } = midiEvent;

    if (!note) throw Error("No valid note on this event");
    const noteName = note.fullName;

    switch (type) {
      case "noteOn":
        this.activeNote = noteName;
        this.triggeredAt = triggeredAt;
        this.midiEvent = midiEvent;

        break;
      case "noteOff":
        this.activeNote = null;
        this.midiEvent = null;
        break;
      default:
        throw Error("This type is not a note");
    }
  };
}
