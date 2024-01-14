import { now, Part } from "tone";
import Module, { DummnyInternalModule } from "./Base";
import { INote } from "../Note";
import { MidiOutput } from "./IO";
import MidiEvent from "../MidiEvent";
import Engine from "../Engine";

export interface ISequence {
  active: boolean;
  time: string;
  notes: INote[];
}
interface ISequencer {
  sequences: ISequence[][];
  steps: number;
  bars: number;
}

const InitialProps = () => ({
  sequences: [],
  steps: 16,
  bars: 1,
});

export default class Sequencer extends Module<
  DummnyInternalModule,
  ISequencer
> {
  static moduleName = "Sequencer";
  midiOutput: MidiOutput;
  private part: Part<ISequence>;

  constructor(name: string, props: Partial<ISequencer>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps(), ...props },
    });

    this.initializePart();
    this.start(now());
    this.registerOutputs();
  }

  get props() {
    return super.props;
  }

  set props(value: ISequencer) {
    if (!this.sequences) this._props["sequences"] = [];

    super.props = { ...this.props, ...value };
    this.adjust();
  }

  get steps() {
    return this._props["steps"];
  }

  set steps(value: number) {
    this._props = { ...this.props, steps: value };
  }

  get bars() {
    return this.props["bars"];
  }

  set bars(value: number) {
    this._props = { ...this.props, bars: value };
  }

  get sequences() {
    return this._props["sequences"];
  }

  set sequences(value: ISequence[][]) {
    const sequences = value;
    this._props = { ...this.props, sequences };
  }

  start(time: number) {
    if (!Engine.isStarted) return;

    this.part.start(time);
  }

  stop() {
    this.part.stop();
  }

  private registerOutputs() {
    this.midiOutput = this.registerMidiOutput({ name: "midi out" });
  }

  private initializePart() {
    this.part = new Part(this.onPartEvent, [] as ISequence[]);
    this.part.loop = true;
    this.part.loopEnd = this.loopEnd;
  }

  private adjust() {
    if (!this.part) return;

    this.adjustNumberOfBars();
    this.adjustNumberOfSteps();
    this.updateBarParts();
  }

  private adjustNumberOfBars() {
    const currentBar = this.sequences.length;
    const num = currentBar - this.bars;
    const sequences = [...this.sequences];

    if (num === 0) return;

    if (num > 0) {
      sequences.pop();
    } else {
      sequences.push([]);
    }

    this.sequences = sequences;
    this.adjustNumberOfBars();
  }

  private adjustNumberOfSteps(bar = 0) {
    if (!this.bars) return;

    const allSequences = [...this.sequences];
    const sequences = [...allSequences[bar]];
    const num = sequences.length - this.steps;

    if (num === 0) {
      if (bar === this.bars - 1) return;

      this.adjustNumberOfSteps(bar + 1);
      return;
    }

    if (num > 0) {
      sequences.pop();
    } else {
      const index = sequences.length;
      sequences.push({ active: false, time: `${bar}:0:${index}`, notes: [] });
    }
    allSequences[bar] = sequences;
    this.sequences = allSequences;

    this.adjustNumberOfSteps(bar);
  }

  private updateBarParts() {
    this.part.clear();

    this.sequences.forEach((barSeqs) => {
      barSeqs.forEach((seq) => this.part.add(seq.time, seq));
    });

    this.part.loopEnd = this.loopEnd;
  }

  private get loopEnd() {
    return `${this.bars}:0:0`;
  }

  private onPartEvent = (time: number, sequence: ISequence) => {
    if (!sequence.active) return;

    const event = MidiEvent.fromSequence(sequence, time);

    this.midiOutput.onMidiEvent(event);
  };
}
