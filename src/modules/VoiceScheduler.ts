import { MidiEvent } from "../core/midi";
import Module, { PolyModule, DummnyInternalModule } from "../core/Module";
import { MidiOutput } from "../core/IO";

export interface VoiceSchedulerInterface {
  polyNumber: number;
}

export default class VoiceScheduler extends PolyModule<
  Voice,
  VoiceSchedulerInterface
> {
  static moduleName = "VoiceScheduler";
  midiOutput: MidiOutput;

  constructor(params: {
    id?: string;
    name: string;
    props: VoiceSchedulerInterface;
  }) {
    const { id, name, props } = params;

    super({
      id,
      name,
      child: Voice,
      props,
    });

    this.registerInputs();
    this.registerOutputs();
    this.polyNumber = this.numberOfVoices;
  }

  set polyNumber(value: number) {
    super.numberOfVoices = value;
  }

  get polyNumber() {
    return this.numberOfVoices;
  }

  onMidiEvent = (midiEvent: MidiEvent) => {
    let voice: Voice | undefined;

    switch (midiEvent.type) {
      case "noteOn":
        voice = this.findFreeVoice();

        break;
      case "noteOff":
        voice = this.audioModules.find(
          (v) => v.activeNote === midiEvent.note.fullName
        );
        break;
      default:
        throw Error("This type is not a note");
    }

    if (!voice) return;

    voice.midiTriggered(midiEvent);
    midiEvent.voiceNo = voice.voiceNo;
    this.midiOutput.onMidiEvent(midiEvent);
  };

  serialize() {
    const serialize = super.serialize();

    return {
      ...serialize,
      props: { ...serialize.props, polyNumber: this.polyNumber },
    };
  }

  private findFreeVoice(): Voice {
    let voice = this.audioModules.find((v) => !v.activeNote);

    // If no available voice, get the one with the lowest triggeredAt
    if (!voice) {
      voice = this.audioModules.sort((a, b) => {
        if (!a || !b) return 0;

        return a.triggeredAt - b.triggeredAt;
      })[0];
    }

    return voice;
  }

  private registerInputs() {
    this.registerMidiInput({
      name: "midi in",
      onMidiEvent: this.onMidiEvent,
    });
  }

  private registerOutputs() {
    this.midiOutput = this.registerMidiOutput({ name: "midi out" });
  }
}

class Voice extends Module<DummnyInternalModule, VoiceSchedulerInterface> {
  midiEvent: MidiEvent | null;
  activeNote: string | null;
  triggeredAt: number;

  constructor(params: {
    id?: string;
    name: string;
    props: VoiceSchedulerInterface;
  }) {
    const { id, name, props } = params;

    super(new DummnyInternalModule(), {
      id,
      name,
      props,
    });
  }

  midiTriggered = (midiEvent: MidiEvent) => {
    if (this.voiceNo === undefined) throw Error("Voice without voiceNo");

    const { triggeredAt, note, type } = midiEvent;

    if (!note) return;
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
