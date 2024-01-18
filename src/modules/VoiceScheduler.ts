import { MidiEvent } from "../core/midi";
import Module, {
  PolyModule,
  DummnyInternalModule,
  Voicable,
} from "../core/Module";
import { MidiOutput } from "../core/IO";

export interface VoiceSchedulerInterface extends Voicable {
  polyNumber: number;
}

export default class VoiceScheduler extends PolyModule<
  Voice,
  VoiceSchedulerInterface
> {
  static moduleName = "VoiceScheduler";
  midiOutput: MidiOutput;

  constructor(name: string, props: VoiceSchedulerInterface) {
    super({
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
    let voices: Array<Voice | undefined>;

    switch (midiEvent.type) {
      case "noteOn":
        voices = this.findFreeVoices(midiEvent.notes.length);

        break;
      case "noteOff":
        voices = midiEvent.notes.map((note) => {
          return this.audioModules.find((v) => v.activeNote === note.fullName);
        });
        break;
      default:
        throw Error("This type is not a note");
    }

    if (voices.length === 0) return;

    voices.forEach((voice, i) => {
      if (!voice) return;

      voice.midiTriggered(midiEvent, i);
      this.midiOutput.onMidiEvent(midiEvent, voice.voiceNo);
    });
  };

  serialize() {
    const serialize = super.serialize();
    delete serialize.props.voiceNo;

    return {
      ...serialize,
      props: { ...serialize.props, polyNumber: this.polyNumber },
    };
  }

  private findFreeVoices(num = 1): Voice[] {
    let voices = this.audioModules.filter((v) => !v.activeNote).slice(0, num);

    if (voices.length === 0) {
      voices = this.audioModules
        .sort((a, b) => {
          if (!a || !b) return 0;

          return a.triggeredAt - b.triggeredAt;
        })
        .slice(0, num);
    }

    return voices;
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

export type VoiceInterface = Voicable;

class Voice extends Module<DummnyInternalModule, VoiceInterface> {
  midiEvent: MidiEvent | null;
  activeNote: string | null;
  triggeredAt: number;

  constructor(name: string, props: VoiceInterface) {
    super(new DummnyInternalModule(), {
      name,
      props,
    });
  }

  midiTriggered = (midiEvent: MidiEvent, noteIndex?: number) => {
    if (this.voiceNo === undefined) throw Error("Voice without voiceNo");
    if (noteIndex === undefined) return;

    const { triggeredAt, notes, type } = midiEvent;
    const note = notes[noteIndex];

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
