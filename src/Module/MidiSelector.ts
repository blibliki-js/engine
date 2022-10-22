import Engine from "../Engine";
import MidiEvent from "../MidiEvent";
import Module, { ModuleType, DummnyInternalModule } from "./Base";
import { Output } from "./IO";

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
  midiOutput: Output;

  constructor(name: string, props: Partial<MidiSelectorInterface>) {
    super(new DummnyInternalModule(), {
      name,
      props: { ...InitialProps, ...props },
      type: ModuleType.MidiSelector,
    });

    this.registerOutputs();
    this.addEventListener(this.selectedId);
  }

  get selectedId() {
    return this._props["selectedId"];
  }

  set selectedId(value: string | null) {
    if (this.selectedId) {
      const prevMidiDevice = Engine.midiDeviceManager.find(this.selectedId);
      prevMidiDevice?.removeEventListener(this.onMidiEvent);
    }

    this._props = { ...this.props, selectedId: value };

    this.addEventListener(value);
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({ name: "midi out" });
  }

  private onMidiEvent = (midiEvent: MidiEvent) => {
    this.midiOutput.connections.forEach((input) => {
      input.pluggable(midiEvent);
    });
  };

  private addEventListener(midiId: string | null) {
    if (!this.onMidiEvent || !midiId) return; // Ugly hack because of weird super bug

    const midiDevice = Engine.midiDeviceManager.find(midiId);
    midiDevice?.addEventListener(this.onMidiEvent);
  }
}
