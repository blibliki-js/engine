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
      props: { ...serialize.props, polyNumber: this.polyNumber },
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
