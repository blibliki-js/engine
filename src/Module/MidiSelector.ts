import MidiDevice from "../MidiDevice";
import MidiDeviceManager from "../MidiDeviceManager";
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

  constructor(
    name: string,
    code: string,
    props: Partial<MidiSelectorInterface>
  ) {
    super(new DummnyInternalModule(), {
      name,
      code,
      props: { ...InitialProps, ...props },
      type: ModuleType.MidiSelector,
    });

    this.registerOutputs();
  }

  get selectedId() {
    return this._props["selectedId"];
  }

  set selectedId(value: string | null) {
    if (this.selectedId) {
      MidiDeviceManager.find(this.selectedId).then((midiDevice: MidiDevice) => {
        midiDevice.removeEventListener(this.onMidiEvent);
      });
    }

    this._props = { ...this.props, selectedId: value };

    if (!value) return;

    MidiDeviceManager.find(value).then((midiDevice: MidiDevice) => {
      midiDevice.addEventListener(this.onMidiEvent);
    });
  }

  onMidiEvent = (midiEvent: MidiEvent) => {
    this.midiOutput.connections.forEach((input) => {
      input.pluggable(midiEvent);
    });
  };

  async availableDevices(): Promise<MidiDevice[]> {
    return MidiDeviceManager.fetchDevices();
  }

  private registerOutputs() {
    this.midiOutput = this.registerOutput({ name: "midi out" });
  }
}
