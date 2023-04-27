import { Part, Time } from "tone";
import Module, { DummnyInternalModule } from "./Base";
import { INote } from "../Note";
import { Output } from "./IO";
import MidiEvent from "../MidiEvent";

export interface ISequence {
  active: boolean;
  time: string;
  notes: INote[];
}
interface ISequencer {
  sequences: ISequence[][];
  length: number;
  bars: number;
}

const InitialProps = () => ({
  sequences: [],
  length: 16,
  bars: 1,
});

export default class Sequencer extends Module<
  DummnyInternalModule,
  ISequencer
> {
  static moduleName = "Sequencer";
  midiOutput: Output;
  private part: Part<number>;
  private barParts: Part<ISequence>[] = [];

  constructor(name: string, props: Partial<ISequencer>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps(), ...props },
    });

    this.initializePart();
    this.start();
    this.registerOutputs();
  }

  get length() {
    return this._props["length"];
  }

  set length(value: number) {
    this._props["length"] = value;
    this.adjustNumberOfSequences();
    this.updateBarParts();
  }

  get bars() {
    return this.props["bars"];
  }

  set bars(value: number) {
    this._props["bars"] = value;
    this.adjustNumberOfBars();
    this.adjustNumberOfSequences();
    this.updateBarParts();
  }

  get sequences() {
    return this._props["sequences"];
  }

  set sequences(value: ISequence[][]) {
    const sequences = value;
    this._props = { ...this.props, sequences };
    this.updateBarParts();
  }

  start() {
    this.part.start();
  }

  stop() {
    this.part.stop();
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({ name: "midi out" });
  }

  private initializePart() {
    this.part = new Part(this.onPartEvent, [] as number[]);
    this.part.loop = true;
    this.part.loopEnd = this.loopEnd;

    this.sequences.forEach((_, i) => {
      this.part.add(`${i}:0:0`, i);
    });
  }

  private adjustNumberOfBars() {
    const currentBar = this.sequences.length;
    const num = currentBar - this.bars;

    if (num === 0) return;

    if (num > 0) {
      this.part?.remove(`${currentBar}:0:0`);
      this.sequences.pop();
    } else {
      this.part?.add(`${currentBar}:0:0`, currentBar);
      this.sequences.push([]);
    }

    this.adjustNumberOfBars();
  }

  private adjustNumberOfSequences(bar = 0) {
    if (!this.bars) return;

    const sequences = this.sequences[bar];
    const num = sequences.length - this.length;

    if (num === 0) {
      if (bar === this.bars - 1) return;

      this.adjustNumberOfSequences(bar + 1);
      return;
    }

    if (num > 0) {
      sequences.pop();
    } else {
      const index = sequences.length;
      sequences.push({ active: false, time: `${bar}:0:${index}`, notes: [] });
    }

    this.adjustNumberOfSequences(bar);
  }

  private updateBarParts() {
    this.barParts = this.sequences.map((barSeqs, bar) => {
      const part = new Part(this.onSequenceEvent, [] as Array<ISequence>);
      barSeqs.forEach((seq) => part.add(seq.time, seq));

      return part;
    });
  }

  private get loopEnd() {
    return `${this.bars}:0:0`;
  }

  private onPartEvent = (time: number, bar: number | null) => {
    if (bar === null) return;

    const part = this.barParts[bar];
    if (!part) return;

    part.start(time);
    part.stop(time + Time("1m").toSeconds());
  };

  private onSequenceEvent = (time: number, sequence: ISequence) => {
    if (!sequence.active) return;

    const event = MidiEvent.fromSequence(sequence, time);

    this.midiOutput.connections.forEach((input) => {
      input.pluggable(event);
    });
  };
}
