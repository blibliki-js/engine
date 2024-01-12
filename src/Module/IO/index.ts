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
  ForwardInput,
  ForwardOutput,
  IForwardInput,
  IForwardOutput,
} from "./ForwardNode";

type AnyInput = AudioInput | MidiInput | ForwardInput;
type AnyOuput = AudioOutput | MidiOutput | ForwardOutput;
type IAnyInput = IAudioInput | IMidiInput | IForwardInput;
type IAnyOutput = IAudioOutput | IMidiOutput | IForwardOutput;
type IAnyIO = IAnyInput | IAnyOutput | IForwardOutput;

export {
  IOCollection,
  IOType,
  AudioInput,
  AudioOutput,
  MidiInput,
  MidiOutput,
  ForwardInput,
  ForwardOutput,
};
export type {
  IAnyIO,
  IIONode,
  IAudioInput,
  IAudioOutput,
  IMidiInput,
  IMidiOutput,
  IAnyInput,
  IAnyOutput,
  IIOSerialize,
  AnyInput,
  AnyOuput,
};
