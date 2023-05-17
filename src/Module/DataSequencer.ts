import { Loop, now } from "tone";

import Module, { DummnyInternalModule } from "./Base";
import { Output } from "./IO";
import MidiEvent from "../MidiEvent";
import { sortBy, uniq } from "lodash";
import Engine from "../Engine";

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
  private prevNumberOfVoices: number;
  private loop: Loop;

  constructor(name: string, props: Partial<IDataSequence>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps(), ...props },
    });

    this.start(now());
    this.registerOutputs();
  }

  get sequences() {
    return this._props["sequences"];
  }

  set sequences(value: IDataSequence[]) {
    const sequences = sortBy(value, (seq) => -seq.time);
    this._props = { ...this.props, sequences };
    this.updateNumberOfVoices();
    this.start(now());
  }

  start(time: number) {
    if (!Engine.isStarted) return;
    Engine.updateRoutes();

    const loopLength = 0.1;
    const tempSequences = [...this.sequences];
    const iterate = (maxTime: number) => {
      const sequence = tempSequences.pop();
      if (!sequence) return;

      const seqTime = time + sequence.time;
      this.onPartEvent(seqTime, sequence);
      if (seqTime > maxTime) return;

      iterate(maxTime);
    };

    this.loop = new Loop((t) => {
      iterate(time + t + loopLength);
    }, loopLength).start(time);
  }

  stop() {
    if (!this.loop) return;

    this.loop.stop();
    this.loop.dispose();
  }

  private onPartEvent = (time: number, sequence: IDataSequence) => {
    const { voiceNo } = sequence;
    const event = MidiEvent.fromDataSequence(sequence, time);

    this.midiOutput.connections.forEach((input) => {
      input.pluggable(event, voiceNo);
    });
  };

  private get numberOfVoices() {
    return uniq(this.sequences.map((sequence) => sequence.voiceNo)).length;
  }

  private updateNumberOfVoices() {
    if (!this.midiOutput) return;

    this.midiOutput.connections.forEach((input) => {
      if (input.audioModule instanceof Module) return;

      input.audioModule.numberOfVoices = this.numberOfVoices;
    });

    if (this.prevNumberOfVoices !== this.numberOfVoices) {
      Engine.updateRoutes();
    }
    this.prevNumberOfVoices = this.numberOfVoices;
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
