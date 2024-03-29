import Engine from "../Engine";
import { MidiEvent } from "../core/midi";
import Module, { DummnyInternalModule } from "../core/Module";
import { MidiOutput } from "../core/IO";

export interface MidiSelectorInterface {
  selectedId: string | null;
}

const InitialProps: MidiSelectorInterface = {
  selectedId: null,
};

export default class MidiSelector extends Module<
  DummnyInternalModule,
  MidiSelectorInterface
> {
  static moduleName = "MidiSelector";
  midiOutput: MidiOutput;

  constructor(params: {
    id?: string;
    name: string;
    props: Partial<MidiSelectorInterface>;
  }) {
    const { id, name, props } = params;
    super(new DummnyInternalModule(), {
      id,
      name,
      props: { ...InitialProps, ...props },
    });

    this.registerOutputs();
    this.addEventListener(this.selectedId);
  }

  get selectedId() {
    return this._props["selectedId"];
  }

  set selectedId(value: string | null) {
    this.removeEventListener();

    this._props = { ...this.props, selectedId: value };

    this.addEventListener(value);
  }

  dispose() {
    this.removeEventListener();
    super.dispose();
  }

  private registerOutputs() {
    this.midiOutput = this.registerMidiOutput({ name: "midi out" });
  }

  private addEventListener(midiId: string | null) {
    if (!this.onMidiEvent || !midiId) return; // Ugly hack because of weird super bug

    const midiDevice = Engine.midiDeviceManager.find(midiId);
    midiDevice?.addEventListener(this.forwardMidiEvent);
  }

  private forwardMidiEvent = (midiEvent: MidiEvent) => {
    this.midiOutput.onMidiEvent(midiEvent);
  };

  private removeEventListener() {
    if (!this.selectedId) return;

    const midiDevice = Engine.midiDeviceManager.find(this.selectedId);
    midiDevice?.removeEventListener(this.forwardMidiEvent);
  }
}
