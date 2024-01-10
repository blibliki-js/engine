import { v4 as uuidv4 } from "uuid";
import { InputNode } from "tone";

import { Input, Output, IOInterface } from "./IO";
import MidiEvent from "../MidiEvent";
import { AudioModule, PolyModule } from "../Module";
import Note from "../Note";

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
  triggerAttack: Function;
  triggerRelease: Function;
}

export interface Voicable {
  voiceNo?: number;
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

class Module<InternalModule extends Connectable, PropsInterface>
  implements ModuleInterface<PropsInterface>
{
  static readonly moduleName: string;

  readonly id: string;
  name: string;
  internalModule: InternalModule;
  inputs: Input[] = [];
  outputs: Output[] = [];
  readonly voiceNo?: number;
  updatedAt: Date;
  _props: PropsInterface = {} as PropsInterface;

  constructor(
    internalModule: InternalModule,
    props: Partial<ModuleInterface<PropsInterface>>
  ) {
    this.internalModule = internalModule;
    this.id = uuidv4();

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
    const output = this.outputs.find((i) => i.name === from);
    if (!output) throw Error(`Output ${from} not exist`);

    const input = audioModule.inputs.find((i) => i.name === to);
    if (!input)
      throw Error(`Input ${to} in module ${audioModule.name} not exist`);

    output.plug(input);
  }

  unplugAll() {
    this.outputs.forEach((o) => o.unPlugAll());
  }

  connect = (
    inputAudioModule: AudioModule,
    attribute = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        this.internalModule.connect((m as any)[attribute] as InputNode);
      });
      return;
    }

    this.internalModule.connect(
      (inputAudioModule as any)[attribute] as InputNode
    );
  };

  disconnect = (
    inputAudioModule: AudioModule,
    attribute = "internalModule"
  ) => {
    if (inputAudioModule instanceof PolyModule) {
      inputAudioModule.audioModules.forEach((m) => {
        this.internalModule.disconnect((m as any)[attribute] as InputNode);
      });
      return;
    }

    this.internalModule.disconnect(
      (inputAudioModule as any)[attribute] as InputNode
    );
  };

  dispose() {
    this.internalModule.dispose();
  }

  triggerAttack(note: Note, triggeredAt: number) {
    throw Error("triggerAttack not implemented");
  }

  triggerRelease(note: Note, triggeredAt: number) {
    throw Error("triggerRelease not implemented");
  }

  midiTriggered = (midiEvent: MidiEvent, noteIndex?: number) => {
    const { notes, triggeredAt } = midiEvent;

    switch (midiEvent.type) {
      case "noteOn":
        const { duration } = notes[0];

        this.triggerer(this.triggerAttack, notes, triggeredAt, noteIndex);

        if (duration) {
          const releaseTriggeredAt =
            triggeredAt + (this.internalModule as any).toSeconds(duration);
          this.triggerer(
            this.triggerRelease,
            notes,
            releaseTriggeredAt,
            noteIndex
          );
        }
        break;
      case "noteOff":
        this.triggerer(this.triggerRelease, notes, triggeredAt, noteIndex);
        break;
      default:
        throw Error("This type is not a note");
    }
  };

  private triggerer(
    trigger: Function,
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
      inputs: this.inputs.map((i) => i.serialize()),
      outputs: this.outputs.map((i) => i.serialize()),
    };
  }

  protected registerInput(props: IOInterface): Input {
    const input = new Input(this, props);
    this.inputs.push(input);

    return input;
  }

  protected registerOutput(props: IOInterface): Output {
    const output = new Output(this, props);
    this.outputs.push(output);

    return output;
  }

  protected registerBasicOutputs() {
    this.registerOutput({
      name: "output",
      onPlug: (output: Output) => {
        this.connect(output.audioModule);
      },
      onUnPlug: (output: Output) => {
        this.disconnect(output.audioModule);
      },
    });
  }

  protected registerBasicInputs() {
    this.registerInput({
      name: "input",
    });
  }
}

export default Module;
