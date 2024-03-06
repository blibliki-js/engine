import { default as IOCollection } from "./Collection";
import { IIONode, IOType, IIOSerialize } from "./Node";
import {
  AudioInput,
  AudioOutput,
  IAudioInput,
  IAudioOutput,
} from "./AudioNode";
import { IMidiInput, IMidiOutput, MidiInput, MidiOutput } from "./MidiNode";
import {
  ForwardAudioInput,
  ForwardAudioOutput,
  IForwardAudioInput,
  IForwardAudioOutput,
} from "./ForwardNode";

type AnyAudioInput = AudioInput | ForwardAudioInput;
type AnyMidiInput = MidiInput;
type AnyAudioOuput = AudioOutput | ForwardAudioOutput;
type AnyMidiOuput = MidiOutput;
type AnyInput = AnyAudioInput | AnyMidiInput;
type AnyOuput = AnyAudioOuput | AnyMidiOuput;
type AnyIO = AnyInput | AnyOuput;

type IAnyAudioInput = IAudioInput | IForwardAudioInput;
type IAnyMidiInput = IMidiInput;
type IAnyAudioOuput = IAudioOutput | IForwardAudioOutput;
type IAnyMidiOuput = IMidiOutput;
type IAnyInput = IAnyAudioInput | IAnyMidiInput;
type IAnyOutput = IAnyAudioOuput | IAnyMidiOuput;
type IAnyIO = IAnyInput | IAnyOutput;

export {
  IOCollection,
  IOType,
  AudioInput,
  AudioOutput,
  MidiInput,
  MidiOutput,
  ForwardAudioInput,
  ForwardAudioOutput,
};
export type {
  IAnyIO,
  IIONode,
  IAudioInput,
  IAudioOutput,
  IMidiInput,
  IMidiOutput,
  IForwardAudioInput,
  IForwardAudioOutput,
  IAnyInput,
  IAnyOutput,
  IIOSerialize,
  AnyAudioInput,
  AnyMidiInput,
  AnyAudioOuput,
  AnyMidiOuput,
  AnyInput,
  AnyOuput,
  AnyIO,
};
