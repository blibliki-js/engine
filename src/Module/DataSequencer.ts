import { now, Part } from "tone";

import Module, { DummnyInternalModule } from "./Base";
import { Output } from "./IO";
import MidiEvent from "../MidiEvent";
import { uniq } from "lodash";

interface IDataSequencer {
  sequences: IDataSequence[];
}

export interface IDataSequence {
  voiceNo: number;
  time: number;
  frequency: number;
  amplitude: number;
}

const InitialProps = () => ({
  sequences: [],
});

export default class DataSequencer extends Module<
  DummnyInternalModule,
  IDataSequencer
> {
  static moduleName = "DataSequencer";
  private midiOutput: Output;
  private part: Part<IDataSequence>;

  constructor(name: string, props: Partial<IDataSequence>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps(), ...props },
    });

    this.initializePart();
    this.start(now());
    this.registerOutputs();
  }

  get sequences() {
    return this._props["sequences"];
  }

  set sequences(value: IDataSequence[]) {
    const sequences = value;
    this._props = { ...this.props, sequences };
    this.updateParts();
    this.updateNumberOfVoices();
  }

  start(time: number) {
    const state = this.part.context.transport.state;
    if (state !== "started") return;

    this.part.start(time);
    this.updateParts();
  }

  stop() {
    this.part.stop();
  }

  private onPartEvent = (time: number, sequence: IDataSequence) => {
    const { voiceNo } = sequence;
    const event = MidiEvent.fromDataSequence(sequence, time);

    this.midiOutput.connections.forEach((input) => {
      input.pluggable(event, voiceNo);
    });
  };

  private initializePart() {
    this.part = new Part(this.onPartEvent, [] as IDataSequence[]);
    this.part.loopEnd = this.loopEnd;
  }

  private updateParts() {
    if (!this.part) return;

    this.part.clear();
    this.part.loopEnd = this.loopEnd;

    this.sequences.forEach((sequence: IDataSequence) => {
      this.part.add(sequence.time, sequence);
    });
  }

  private get loopEnd() {
    const times = this.sequences.map((sequence) => sequence.time);

    return times.length ? Math.max(...times) : 0;
  }

  private get numberOfVoices() {
    return uniq(this.sequences.map((sequence) => sequence.voiceNo)).length;
  }

  private updateNumberOfVoices() {
    if (!this.midiOutput) return;

    this.midiOutput.connections.forEach((input) => {
      if (input.audioModule instanceof Module) return;

      input.audioModule.numberOfVoices = this.numberOfVoices;
    });
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({
      name: "midi out",
      onPlug: (input) => {
        if (input.audioModule instanceof Module) return;

        input.audioModule.numberOfVoices = this.numberOfVoices;
      },
    });
  }
}
