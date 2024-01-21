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
import { AudioModule, PolyModule } from "./index";
import Note from "../../core/Note";

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
    props: Partial<ModuleInterface<PropsInterface>>
  ) {
    this.internalModule = internalModule;
    this.id = uuidv4();

    this.inputs = new IOCollection<AudioInput | MidiInput>(this);
    this.outputs = new IOCollection<AudioOutput>(this);

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
    if (audioModule instanceof PolyModule) {
      audioModule.audioModules.forEach((m) => this.plug(m, from, to));
      return;
    }

    const output = this.outputs.findByName(from);
    if (!output) throw Error(`Output ${from} not exist`);

    const input = audioModule.inputs.findByName(to);
    if (!input) throw Error(`Input ${to} not exist`);

    if (output instanceof AudioOutput && input instanceof AudioInput) {
      output.plug(input);
    } else if (output instanceof MidiOutput && input instanceof MidiInput) {
      output.plug(input);
    } else {
      throw Error("This output could not plugged to this input");
    }
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

  onMidiEvent = (midiEvent: MidiEvent, noteIndex?: number) => {
    const { notes, triggeredAt } = midiEvent;

    switch (midiEvent.type) {
      case "noteOn": {
        const { duration } = notes[0];

        this.triggerer(this.triggerAttack, notes, triggeredAt, noteIndex);

        if (duration) {
          const releaseTriggeredAt = triggeredAt + Time(duration).toSeconds();

          this.triggerer(
            this.triggerRelease,
            notes,
            releaseTriggeredAt,
            noteIndex
          );
        }
        break;
      }
      case "noteOff":
        this.triggerer(this.triggerRelease, notes, triggeredAt, noteIndex);
        break;
      default:
        throw Error("This type is not a note");
    }
  };

  private triggerer(
    trigger: (note: Note, triggeredAt: number) => void,
    notes: Note[],
    triggeredAt: number,
    noteIndex?: number
  ) {
    if (noteIndex !== undefined && this.voiceNo !== undefined) {
      trigger(notes[noteIndex], triggeredAt);
      return;
    }

    notes.forEach((note) => trigger(note, triggeredAt));
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

    this.registerMidiInput({
      name: "midi input",
      onMidiEvent: this.onMidiEvent,
    });
  }
}

export default Module;
