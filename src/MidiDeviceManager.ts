import MidiDevice from "./MidiDevice";

class MidiDeviceManager {
  private devices: Array<MidiDevice>;
  private static instance: MidiDeviceManager;

  public static getInstance(): MidiDeviceManager {
    if (!MidiDeviceManager.instance) {
      MidiDeviceManager.instance = new MidiDeviceManager();
    }

    return MidiDeviceManager.instance;
  }

  async fetchDevices(): Promise<MidiDevice[]> {
    if (this.devices) return this.devices;

    this.devices = (await this._inputs()).map((input) => new MidiDevice(input));

    return this.devices;
  }

  async find(id: string): Promise<MidiDevice> {
    const device = (await this.fetchDevices()).find(
      (dev: MidiDevice) => dev.id === id
    );

    if (!device) throw Error(`Midi device with id ${id} not found`);

    return device;
  }

  async _inputs() {
    const inputs: Array<MIDIInput> = [];

    const access = await navigator.requestMIDIAccess();
    access.inputs.forEach((input) => inputs.push(input));

    return inputs;
  }

  async onStateChange(callback: Function) {
    const access: MIDIAccess = await navigator.requestMIDIAccess();
    await this.fetchDevices();

    access.onstatechange = (e) => {
      const isMidiEvent = e instanceof MIDIConnectionEvent;

      if (!isMidiEvent) return;
      if (e.port instanceof MIDIOutput) return;

      const input = e.port as MIDIInput;

      const midi = new MidiDevice(input);

      callback(midi);
    };
  }
}

export default MidiDeviceManager.getInstance();
