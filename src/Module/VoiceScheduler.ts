import Module, { DummnyInternalModule, Voicable } from "./Base";
import MidiEvent from "../MidiEvent";
import { Input, Output } from "./IO";
import PolyModule from "./PolyModule";

export interface VoiceSchedulerInterface extends Voicable {
  polyNumber: number;
}

export default class VoiceScheduler extends PolyModule<
  Voice,
  VoiceSchedulerInterface
> {
  static moduleName = "VoiceScheduler";
  midiOutput: Output;
  numberOfVoicesOut: Output;

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
    if (!this.numberOfVoicesOut) return;

    this.numberOfVoicesOut.connections.forEach((input) => {
      if (input.audioModule instanceof Module) return;

      input.audioModule.numberOfVoices = value;
    });
  }

  get polyNumber() {
    return this.numberOfVoices;
  }

  midiTriggered = (midiEvent: MidiEvent) => {
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
      this.midiOutput.connections.forEach((input) => {
        input.pluggable(midiEvent, voice.voiceNo, i);
      });
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

  private findFreeVoices(num: number = 1): Voice[] {
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
    this.registerInput({
      name: "midi in",
      pluggable: this.midiTriggered,
    });
  }

  private registerOutputs() {
    this.numberOfVoicesOut = this.registerOutput({
      name: "number of voices",
      onPlug: (input: Input) => {
        if (input.audioModule instanceof Module) return;

        input.audioModule.numberOfVoices = this.numberOfVoices;
      },
    });

    this.midiOutput = this.registerOutput({ name: "midi out" });
  }
}

export interface VoiceInterface extends Voicable {}

class Voice extends Module<DummnyInternalModule, VoiceInterface> {
  midiEvent: MidiEvent | null;
  activeNote: string | null;
  triggeredAt: number;
  midiOutput: Output;

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
