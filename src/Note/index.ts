import frequencyTable from "./frequencyTable";

const Notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NotesLength = Notes.length;

export interface INote {
  note: string;
  velocity: number;
  duration: string;
}

export default class Note {
  static _notes: Note[];
  name: string;
  octave: number;
  velocity: number = 1;
  duration: string;

  constructor(eventOrString: Partial<INote> | MIDIMessageEvent | string) {
    if (typeof eventOrString === "string") {
      this.fromString(eventOrString);
    } else if (eventOrString instanceof MIDIMessageEvent) {
      this.fromEvent(eventOrString);
    } else {
      this.fromProps(eventOrString);
    }
  }

  static notes(octave: number = 3) {
    return Notes.map((note: string) => new Note(`${note}${octave}`));
  }

  get isSemi() {
    return this.name.slice(-1) === "#";
  }

  get fullName() {
    return `${this.name}${this.octave}`;
  }

  frequency(range: number = 0, coarse: number = 0) {
    let newOctave = this.octave + range;
    let coarseIndex = Notes.indexOf(this.name) + coarse;
    let nameIndex = coarseIndex;

    if (coarseIndex >= NotesLength) {
      newOctave++;
      nameIndex = coarseIndex % NotesLength;
    } else if (coarseIndex < 0) {
      newOctave--;
      nameIndex = NotesLength + nameIndex;
    }

    const newName = Notes[nameIndex];

    return frequencyTable[`${newName}${newOctave}`];
  }

  valueOf() {
    return this.fullName;
  }

  serialize(): INote {
    return {
      note: this.fullName,
      velocity: this.velocity,
      duration: this.duration,
    };
  }

  private fromString(string: string) {
    const matches = string.match(/(\w#?)(\d)?/) || [];

    this.name = matches[1];
    this.octave = matches[2] ? parseInt(matches[2]) : 1;
  }

  private fromEvent(event: MIDIMessageEvent) {
    this.name = Notes[event.data[1] % 12];
    this.octave = Math.floor(event.data[1] / 12) - 2;
  }

  private fromProps(props: Partial<INote>) {
    Object.assign(this, props);
    if (!props.note) throw Error("note props is mandatory");

    this.fromString(props.note);
  }
}
