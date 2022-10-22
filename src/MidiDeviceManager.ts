import MidiDevice from "./MidiDevice";

export default class MidiDeviceManager {
  devices: { [Key: string]: MidiDevice } = {};
  private initialized: boolean = false;

  constructor() {
    this.initializeDevices().then(() => {
      this.listenChanges();
      this.initialized = true;
    });
  }

  find(id: string): MidiDevice | null {
    const device = this.devices[id];

    if (!device) return null;

    return device;
  }

  onStateChange(callback: (device: MidiDevice) => void) {
    navigator.requestMIDIAccess().then((access: MIDIAccess) => {
      access.onstatechange = (e) => {
        const isMidiEvent = e instanceof MIDIConnectionEvent;

        if (!isMidiEvent) return;
        if (e.port instanceof MIDIOutput) return;

        const input = e.port as MIDIInput;

        const midi = new MidiDevice(input);

        callback(midi);
      };
    });
  }

  private listenChanges() {
    this.onStateChange((device) => {
      if (device.state === "disconnected") {
        device.disconnect();
        delete this.devices[device.id];
      } else {
        this.devices[device.id] = device;
      }
    });
  }

  private async initializeDevices() {
    if (this.initialized) return Object.values(this.devices);

    (await this.inputs()).forEach((input) => {
      if (this.devices[input.id]) return;

      this.devices[input.id] = new MidiDevice(input);
    });

    return Object.values(this.devices);
  }

  private async inputs() {
    const inputs: Array<MIDIInput> = [];

    const access = await navigator.requestMIDIAccess();
    access.inputs.forEach((input) => inputs.push(input));

    return inputs;
  }
}
