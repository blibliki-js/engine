import { Destination } from "tone";
import { store } from "store";
import { addActiveNote, removeActiveNote } from "globalSlice";

import Module, { Connectable, ModuleType } from "../Module";
import MidiEvent from "Engine/MidiEvent";
import { Input, Output } from "./IO";

export interface VoiceSchedulerInterface {
  numberOfVoices: number;
}

export default class VoiceScheduler extends Module<
  Connectable,
  VoiceSchedulerInterface
> {
  static poly = false;
  voices: Voice[] = [];
  midiOutput: Output;

  constructor(name: string, code: string, props: VoiceSchedulerInterface) {
    super(Destination, {
      name,
      code,
      type: ModuleType.VoiceScheduler,
      props,
    });

    this.numberOfVoices = props.numberOfVoices;

    this.registerInputs();
    this.registerOutputs();
  }

  get numberOfVoices(): number {
    return this._props["numberOfVoices"];
  }

  set numberOfVoices(value: number | string) {
    if (!this.voices) return;

    let newValue: number =
      typeof value === "string" ? parseInt(value, 10) : value;

    const adjustmentValue = newValue - this.voices.length;

    if (adjustmentValue > 0) {
      this.createVoices(adjustmentValue);
    } else {
      this.disposeVoices(Math.abs(adjustmentValue));
    }

    this._props = { ...this.props, numberOfVoices: newValue };
  }

  midiTriggered = (midiEvent: MidiEvent) => {
    let voice;

    switch (midiEvent.type) {
      case "noteOn":
        voice = this.voices.find((v) => !v.activeNote);
        if (voice) break;

        voice = this.voices.sort((a, b) => {
          if (!a || !b) return 0;

          return a.triggeredAt - b.triggeredAt;
        })[0];

        break;
      case "noteOff":
        voice = this.voices.find((v) => v.activeNote === midiEvent.note?.name);
        break;
      default:
        throw Error("This type is not a note");
    }

    if (!voice) return;

    voice.midiTriggered(midiEvent, this.midiOutput.connections);
  };

  private createVoices(value: number) {
    if (value <= 0) return;

    const voice = new Voice(this.voices.length);
    this.voices.push(voice);

    this.createVoices(value - 1);
  }

  private disposeVoices(value: number) {
    if (value <= 0) return;

    const voice = this.voices.pop();
    if (!voice) return;

    this.disposeVoices(value - 1);
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

class Voice {
  voiceNo: number;
  midiEvent: MidiEvent | null;
  activeNote: string | null;
  triggeredAt: number;

  constructor(voiceNo: number) {
    this.voiceNo = voiceNo;
  }

  midiTriggered(midiEvent: MidiEvent, connections: Input[]) {
    const { triggeredAt, note, type } = midiEvent;

    if (!note) throw Error("No valid note on this event");
    const noteName = note.name;

    switch (type) {
      case "noteOn":
        const overridedNote = this.activeNote;
        this.activeNote = noteName;
        this.triggeredAt = triggeredAt;
        this.midiEvent = midiEvent;

        connections.forEach((input) => {
          input.pluggable(midiEvent, this.voiceNo);
        });

        if (overridedNote) store.dispatch(removeActiveNote(overridedNote));
        store.dispatch(addActiveNote(noteName));
        break;
      case "noteOff":
        connections.forEach((input) => {
          input.pluggable(midiEvent, this.voiceNo);
        });

        store.dispatch(removeActiveNote(noteName));
        this.activeNote = null;
        this.midiEvent = null;
        break;
      default:
        throw Error("This type is not a note");
    }
  }
}
