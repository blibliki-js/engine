import { v4 as uuidv4 } from "uuid";
import { InputNode, Time } from "tone";

import {
  IOCollection,
  AudioInput,
  AudioOutput,
  MidiInput,
  IMidiInput,
  IAudioInput,
  IAudioOutput,
  IOType,
  MidiOutput,
  IMidiOutput,
} from "../IO";
import { MidiEvent } from "../../core/midi";
import { AudioModule } from "./index";
import Note from "../../core/Note";
import { plugCompatibleIO } from "../IO/Node";
import { AtLeast } from "../../types";

export interface Startable {
  start(time: number): void;
  stop(time: number): void;
}

export interface Connectable {
  connect: (inputNode: InputNode) => void;
  disconnect: (inputNode?: InputNode) => void;
  dispose: () => void;
}

export interface Triggerable {
  triggerAttack: (note: Note, triggeredAt: number) => void;
  triggerRelease: (note: Note, triggeredAt: number) => void;
}

export interface ModuleInterface<PropsInterface> {
  id: string;
  name: string;
  props: PropsInterface;
  voiceNo?: number;
}

export class DummnyInternalModule implements Connectable {
  connect() {
    throw Error("This module is not connectable");
  }

  disconnect() {
    throw Error("This module is not connectable");
  }

  dispose() {
    // do nothing
  }
}

abstract class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface<PropsInterface>
{
  static readonly moduleName: string;

  readonly id: string;
  name: string;
  internalModule: InternalModule;
  inputs: IOCollection<AudioInput | MidiInput>;
  outputs: IOCollection<AudioOutput | MidiOutput>;
  readonly voiceNo?: number;
  updatedAt: Date;
  _props: PropsInterface = {} as PropsInterface;

  constructor(
    internalModule: InternalModule,
    props: AtLeast<ModuleInterface<PropsInterface>, "name">
  ) {
    this.internalModule = internalModule;
    this.id = props.id || uuidv4();
    delete props.id;

    this.inputs = new IOCollection<AudioInput | MidiInput>(this);
    this.outputs = new IOCollection<AudioOutput | MidiOutput>(this);

    Object.assign(this, props);
  }

  set props(value: PropsInterface) {
    if (!value) return;

    this.updatedAt = new Date();

    Object.assign(this, value);
  }

  get props() {
    return this._props;
  }

  plug(audioModule: AudioModule, from: string, to: string) {
    const output = this.outputs.findByName(from);
    if (!output) throw Error(`Output ${from} not exist`);

    const input = audioModule.inputs.findByName(to);
    if (!input) throw Error(`Input ${to} not exist`);

    plugCompatibleIO(input, output);
  }

  unPlugAll() {
    this.outputs.unPlugAll();
  }

  dispose() {
    this.inputs.unPlugAll();
    this.outputs.unPlugAll();
    this.internalModule.dispose();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  triggerAttack = (note: Note, triggeredAt: number): void => {
    throw Error("triggerAttack not implemented");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  triggerRelease = (note: Note, triggeredAt: number): void => {
    throw Error("triggerRelease not implemented");
  };

  onMidiEvent = (midiEvent: MidiEvent) => {
    if (midiEvent.voiceNo !== undefined && midiEvent.voiceNo !== this.voiceNo)
      return;

    const { note, triggeredAt } = midiEvent;

    switch (midiEvent.type) {
      case "noteOn": {
        const { duration } = note;

        this.triggerer(this.triggerAttack, note, triggeredAt);

        if (duration) {
          const releaseTriggeredAt = triggeredAt + Time(duration).toSeconds();

          this.triggerer(this.triggerRelease, note, releaseTriggeredAt);
        }
        break;
      }
      case "noteOff":
        this.triggerer(this.triggerRelease, note, triggeredAt);
        break;
      default:
        throw Error("This type is not a note");
    }
  };

  private triggerer(
    trigger: (note: Note, triggeredAt: number) => void,
    note: Note,
    triggeredAt: number
  ) {
    trigger(note, triggeredAt);
  }

  serialize() {
    const klass = this.constructor as typeof Module;

    return {
      id: this.id,
      name: this.name,
      type: klass.moduleName,
      props: this.props,
      inputs: this.inputs.serialize(),
      outputs: this.outputs.serialize(),
    };
  }

  protected registerMidiInput(props: Omit<IMidiInput, "ioType">): MidiInput {
    return this.inputs.add({ ...props, ioType: IOType.MidiInput });
  }

  protected registerAudioInput(props: Omit<IAudioInput, "ioType">): AudioInput {
    return this.inputs.add({ ...props, ioType: IOType.AudioInput });
  }

  protected registerMidiOutput(props: Omit<IMidiOutput, "ioType">): MidiOutput {
    return this.outputs.add({ ...props, ioType: IOType.MidiOutput });
  }

  protected registerAudioOutput(
    props: Omit<IAudioOutput, "ioType">
  ): AudioOutput {
    return this.outputs.add({ ...props, ioType: IOType.AudioOutput });
  }

  protected registerBasicOutputs() {
    this.registerAudioOutput({
      name: "output",
      internalModule: this.internalModule,
    });
  }

  protected registerBasicInputs() {
    this.registerAudioInput({
      name: "input",
      internalModule: this.internalModule as unknown as InputNode,
    });

    this.registerDefaultMidiInput();
  }

  protected registerDefaultMidiInput() {
    this.registerMidiInput({
      name: "midi in",
      onMidiEvent: this.onMidiEvent,
    });
  }
}

export default Module;
